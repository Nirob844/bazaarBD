import { Inventory, Prisma, Product } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { InventoryService } from '../inventory/inventory.service';
import {
  productRelationalFields,
  productRelationalFieldsMapper,
  productSearchAbleFields,
} from './product.constants';

// const insertIntoDB = async (data: Product): Promise<Product> => {
//   const existingSku = await prisma.product.findUnique({
//     where: { sku: data.sku },
//   });

//   if (existingSku) throw new Error('SKU must be unique!');

//   const userExists = await prisma.user.findUnique({
//     where: { id: data.userId },
//   });

//   if (!userExists) throw new Error('Vendor not found!');

//   return prisma.product.create({ data });
// };

const insertIntoDB = async (
  data: Product & { inventory?: Inventory }
): Promise<Product> => {
  console.log('data', data);
  const { inventory, ...productData } = data;
  // Check if SKU is unique
  const existingSku = await prisma.product.findUnique({
    where: { sku: productData.sku },
  });

  if (existingSku) throw new Error('SKU must be unique!');

  // Check if Vendor exists
  const userExists = await prisma.user.findUnique({
    where: { id: productData.userId },
  });

  if (!userExists) throw new Error('User not found!');

  // Create Product
  const product = await prisma.product.create({ data: productData });

  // Only create inventory if stock is provided
  if (inventory) {
    const data: any = {
      productId: product.id,
      stock: inventory.stock,
    };
    InventoryService.insertIntoDB(data);
  }

  return product;
};

const getAllFromDB = async (
  filters: any,
  options: IPaginationOptions
): Promise<IGenericResponse<Product[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: productSearchAbleFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map(key => {
        if (productRelationalFields.includes(key)) {
          return {
            [productRelationalFieldsMapper[key]]: {
              id: (filterData as any)[key],
            },
          };
        } else {
          return {
            [key]: {
              equals: (filterData as any)[key],
            },
          };
        }
      }),
    });
  }

  const whereConditions: Prisma.ProductWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.product.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
    include: {
      imageUrls: {
        select: {
          url: true,
          altText: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
      inventory: {
        select: {
          stock: true,
        },
      },
      promotions: {
        select: {
          type: true,
          discountPercentage: true,
        },
      },
    },
  });
  const total = await prisma.product.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getDataById = async (id: string): Promise<Product | null> => {
  return prisma.product.findUnique({
    where: { id },
    include: {
      imageUrls: true,
      category: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      inventory: {
        include: {
          history: true,
        },
      },
      promotions: {
        select: {
          type: true,
          discountPercentage: true,
        },
      },
    },
  });
};

const updateOneInDB = async (
  id: string,
  payload: Partial<Product>
): Promise<Product> => {
  if (payload.sku) {
    const existingSku = await prisma.product.findUnique({
      where: { sku: payload.sku },
    });
    if (existingSku && existingSku.id !== id)
      throw new Error('SKU must be unique!');
  }

  return prisma.product.update({
    where: { id },
    data: payload,
    include: {
      category: true,
      user: true,
      inventory: true,
    },
  });
};

const deleteByIdFromDB = async (id: string): Promise<Product> => {
  const hasOrders = await prisma.orderItem.findFirst({
    where: {
      productId: id,
    },
  });
  if (hasOrders) throw new Error('Cannot delete product with active orders!');

  await prisma.cartItem.deleteMany({
    where: {
      productId: id,
    },
  });
  await prisma.inventory.deleteMany({
    where: {
      productId: id,
    },
  });

  return prisma.product.delete({
    where: { id },
  });
};

export const ProductService = {
  insertIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
};

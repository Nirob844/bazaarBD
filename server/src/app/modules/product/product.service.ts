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

const insertIntoDB = async (
  data: Product & { inventory?: Inventory }
): Promise<Product> => {
  const { inventory, ...productData } = data;
  // Check if SKU is unique
  const existingSku = await prisma.product.findUnique({
    where: { sku: productData.sku },
  });

  if (existingSku) throw new Error('SKU must be unique!');

  // Check if Vendor exists
  const userExists = await prisma.vendor.findUnique({
    where: { id: productData.vendorId },
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
  const { searchTerm, minPrice, maxPrice, status, ...filterData } = filters;

  const andConditions = [];

  // Search term conditions
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

  // Min price filtering
  if (minPrice !== undefined) {
    andConditions.push({
      basePrice: {
        gte: Number(minPrice),
      },
    });
  }

  // Max basePrice filtering
  if (maxPrice !== undefined) {
    andConditions.push({
      basePrice: {
        lte: Number(maxPrice),
      },
    });
  }

  if (status) {
    andConditions.push({
      status: {
        equals: status,
      },
    });
  }

  // Filter conditions
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map(key => {
        if (productRelationalFields.includes(key)) {
          const relationField = productRelationalFieldsMapper[key];

          // Handle one-to-many relations for promotions
          if (relationField === 'promotions') {
            return {
              [relationField]: {
                some: {
                  ...(key === 'promotionId' && {
                    id: (filterData as any)[key],
                  }),
                  ...(key === 'promotionType' && {
                    type: (filterData as any)[key],
                  }),
                },
              },
            };
          }

          // Handle one-to-one relations for category, inventory
          return {
            [relationField]: {
              id: (filterData as any)[key],
            },
          };
        } else {
          // Non-relational filters (price, status, etc.)
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
      images: {
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
          discountValue: true,
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

const getAllPromotionProducts = async (
  options: IPaginationOptions
): Promise<IGenericResponse<Product[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  const result = await prisma.product.findMany({
    where: {
      promotions: {
        some: {},
      },
    },
    skip,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      images: {
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
          id: true,
          type: true,
          discountValue: true,
        },
      },
    },
  });

  const total = await prisma.product.count({
    where: {
      promotions: {
        some: {},
      },
    },
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
      images: {
        select: {
          url: true,
          altText: true,
        },
      },
      category: {
        select: {
          name: true,
          imageUrl: true,
        },
      },
      vendor: {
        select: {
          businessName: true,
          businessEmail: true,
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
          discountValue: true,
        },
      },
      variants: {
        select: {
          name: true,
        },
      },
      attributes: {
        select: {
          key: true,
          value: true,
        },
      },
      tags: {
        select: {
          name: true,
        },
      },
      reviews: {
        select: {
          rating: true,
          comment: true,
          customer: {
            select: {
              firstName: true,
              avatar: true,
            },
          },
        },
      },
    },
  });
};

const getProductPromotions = async (productId: string) => {
  const result = await prisma.promotion.findMany({
    where: {
      productId: productId,
    },
    include: {
      product: true,
    },
  });

  return result;
};

const getProductAttributes = async (productId: string) => {
  const result = await prisma.productAttribute.findMany({
    where: {
      productId: productId,
    },
    include: {
      product: true,
    },
  });

  return result;
};

const getProductVariants = async (productId: string) => {
  const result = await prisma.productVariant.findMany({
    where: {
      productId: productId,
    },
    include: {
      product: true,
    },
  });

  return result;
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

  await prisma.promotion.deleteMany({
    where: {
      productId: id,
    },
  });

  await prisma.inventoryHistory.deleteMany({
    where: {
      inventory: {
        productId: id,
      },
    },
  });

  await prisma.inventory.deleteMany({
    where: {
      productId: id,
    },
  });

  await prisma.productImage.deleteMany({
    where: {
      productId: id,
    },
  });

  await prisma.review.deleteMany({
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
  getProductPromotions,
  getProductAttributes,
  getProductVariants,
  getAllPromotionProducts,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
};

import { Prisma, ProductAttribute } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';

const insertIntoDB = async (
  data: ProductAttribute
): Promise<ProductAttribute> => {
  const result = await prisma.productAttribute.create({
    data,
  });

  return result;
};

const insertManyIntoDB = async (
  data: ProductAttribute[]
): Promise<{ count: number }> => {
  const result = await prisma.productAttribute.createMany({
    data,
    skipDuplicates: true,
  });

  return result;
};

const getAllFromDB = async (
  options: IPaginationOptions
): Promise<IGenericResponse<ProductAttribute[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  const andConditions: Prisma.ProductAttributeWhereInput[] = [];

  const whereConditions: Prisma.ProductAttributeWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.productAttribute.findMany({
    where: whereConditions,
    skip,
    take: limit,
    // orderBy:
    //   options.sortBy && options.sortOrder
    //     ? { [options.sortBy]: options.sortOrder }
    //     : {
    //         createdAt: 'desc',
    //       },
    include: {
      product: {
        select: {
          name: true,
          basePrice: true,
          inventory: {
            select: {
              stock: true,
            },
          },
          images: {
            select: {
              url: true,
              altText: true,
            },
          },
        },
      },
    },
  });
  const total = await prisma.productAttribute.count({
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

const getDataById = async (id: string): Promise<ProductAttribute | null> => {
  const result = await prisma.productAttribute.findUnique({
    where: {
      id,
    },
    include: {
      product: {
        include: {
          images: {
            select: {
              url: true,
              altText: true,
            },
          },
          inventory: {
            select: {
              stock: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return result;
};

const updateOneInDB = async (
  id: string,
  payload: Partial<ProductAttribute>
): Promise<ProductAttribute> => {
  const result = await prisma.productAttribute.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

const deleteByIdFromDB = async (id: string): Promise<ProductAttribute> => {
  const result = await prisma.productAttribute.delete({
    where: {
      id,
    },
  });
  return result;
};

export const ProductAttributeService = {
  insertIntoDB,
  insertManyIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
};

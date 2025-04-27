import { Prisma, ProductVariant } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';

const insertIntoDB = async (data: ProductVariant): Promise<ProductVariant> => {
  const result = await prisma.productVariant.create({
    data,
  });

  return result;
};

const insertManyIntoDB = async (
  data: ProductVariant[]
): Promise<{ count: number }> => {
  const result = await prisma.productVariant.createMany({
    data,
    skipDuplicates: true,
  });

  return result;
};

const getAllFromDB = async (
  options: IPaginationOptions
): Promise<IGenericResponse<ProductVariant[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  const andConditions: Prisma.ProductVariantWhereInput[] = [];

  const whereConditions: Prisma.ProductVariantWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.productVariant.findMany({
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
  const total = await prisma.productVariant.count({
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

const getDataById = async (id: string): Promise<ProductVariant | null> => {
  const result = await prisma.productVariant.findUnique({
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
  payload: Partial<ProductVariant>
): Promise<ProductVariant> => {
  const result = await prisma.productVariant.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

const deleteByIdFromDB = async (id: string): Promise<ProductVariant> => {
  const result = await prisma.productVariant.delete({
    where: {
      id,
    },
  });
  return result;
};

export const ProductVariantService = {
  insertIntoDB,
  insertManyIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
};

import { Prisma, ProductTag } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';

const insertIntoDB = async (data: { name: string }): Promise<ProductTag> => {
  const existingTag = await prisma.productTag.findUnique({
    where: { name: data.name },
  });

  if (existingTag) {
    throw new Error('Tag with this name already exists');
  }

  const result = await prisma.productTag.create({
    data,
  });

  return result;
};

const insertManyIntoDB = async (
  data: { name: string }[]
): Promise<{ count: number }> => {
  const result = await prisma.productTag.createMany({
    data,
    skipDuplicates: true,
  });

  return result;
};

const getAllFromDB = async (
  options: IPaginationOptions
): Promise<IGenericResponse<ProductTag[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  const andConditions: Prisma.ProductTagWhereInput[] = [];

  const whereConditions: Prisma.ProductTagWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.productTag.findMany({
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
      products: {
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
  const total = await prisma.productTag.count({
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

const getDataById = async (id: string): Promise<ProductTag | null> => {
  const result = await prisma.productTag.findUnique({
    where: {
      id,
    },
    include: {
      products: {
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
  payload: Partial<ProductTag>
): Promise<ProductTag> => {
  const result = await prisma.productTag.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

const deleteByIdFromDB = async (id: string): Promise<ProductTag> => {
  const result = await prisma.productTag.delete({
    where: {
      id,
    },
  });
  return result;
};

export const ProductTagService = {
  insertIntoDB,
  insertManyIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
};

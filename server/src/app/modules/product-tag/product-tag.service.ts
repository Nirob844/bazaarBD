import { Prisma, ProductTag } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';

const insertIntoDB = async (data: { name: string }): Promise<ProductTag> => {
  const result = await prisma.productTag.create({
    data,
    include: {
      products: true,
    },
  });

  return result;
};

const bulkInsertIntoDB = async (data: {
  tags: Array<{ name: string }>;
}): Promise<ProductTag[]> => {
  const createdTags = await Promise.all(
    data.tags.map(tag =>
      prisma.productTag.create({
        data: tag,
        include: {
          products: true,
        },
      })
    )
  );

  return createdTags;
};

const getAllFromDB = async (
  filters: any,
  options: IPaginationOptions
): Promise<IGenericResponse<ProductTag[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm } = filters;

  const andConditions: Prisma.ProductTagWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ],
    });
  }

  const whereConditions: Prisma.ProductTagWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.productTag.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      name: 'asc',
    },
    include: {
      products: true,
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
    where: { id },
    include: {
      products: true,
    },
  });

  return result;
};

const updateOneInDB = async (
  id: string,
  payload: Prisma.ProductTagUpdateInput
): Promise<ProductTag> => {
  const result = await prisma.productTag.update({
    where: { id },
    data: payload,
    include: {
      products: true,
    },
  });

  return result;
};

const deleteByIdFromDB = async (id: string): Promise<ProductTag> => {
  const result = await prisma.productTag.delete({
    where: { id },
    include: {
      products: true,
    },
  });

  return result;
};

const getProductsByTag = async (tagId: string): Promise<ProductTag | null> => {
  const result = await prisma.productTag.findUnique({
    where: { id: tagId },
    include: {
      products: {
        include: {
          category: true,
          vendor: true,
        },
      },
    },
  });

  return result;
};

export const ProductTagService = {
  insertIntoDB,
  bulkInsertIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
  getProductsByTag,
};

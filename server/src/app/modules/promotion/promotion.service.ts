import { Prisma, Promotion } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';

const insertIntoDB = async (data: Promotion): Promise<Promotion> => {
  const existingPromotion = await prisma.promotion.findFirst({
    where: {
      productId: data.productId,
    },
  });
  if (existingPromotion) {
    throw new Error('Promotion for this product already exists');
  }
  const result = await prisma.promotion.create({
    data,
  });

  return result;
};

const getAllFromDB = async (
  options: IPaginationOptions
): Promise<IGenericResponse<Promotion[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  const andConditions: Prisma.PromotionWhereInput[] = [];

  const whereConditions: Prisma.PromotionWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.promotion.findMany({
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
      product: {
        select: {
          name: true,
          price: true,
          inventory: {
            select: {
              stock: true,
            },
          },
          imageUrls: {
            select: {
              url: true,
              altText: true,
            },
          },
        },
      },
    },
  });
  const total = await prisma.promotion.count({
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

const getDataById = async (id: string): Promise<Promotion | null> => {
  const result = await prisma.promotion.findUnique({
    where: {
      id,
    },
    include: {
      product: true,
    },
  });

  return result;
};

const updateOneInDB = async (
  id: string,
  payload: Partial<Promotion>
): Promise<Promotion> => {
  const result = await prisma.promotion.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

const deleteByIdFromDB = async (id: string): Promise<Promotion> => {
  const result = await prisma.promotion.delete({
    where: {
      id,
    },
  });
  return result;
};

export const PromotionService = {
  insertIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
};

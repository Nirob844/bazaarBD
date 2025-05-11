import { Prisma, PrismaClient, Promotion, PromotionType } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';

const insertIntoDB = async (data: {
  productId: string;
  type: PromotionType;
  discountValue: number;
  isPercentage: boolean;
  startDate: Date;
  endDate: Date;
  isActive?: boolean;
  maxUses?: number;
}): Promise<Promotion> => {
  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // Check for overlapping promotions
  const overlappingPromotion = await prisma.promotion.findFirst({
    where: {
      productId: data.productId,
      isActive: true,
      OR: [
        {
          AND: [
            { startDate: { lte: data.startDate } },
            { endDate: { gte: data.startDate } },
          ],
        },
        {
          AND: [
            { startDate: { lte: data.endDate } },
            { endDate: { gte: data.endDate } },
          ],
        },
        {
          AND: [
            { startDate: { gte: data.startDate } },
            { endDate: { lte: data.endDate } },
          ],
        },
      ],
    },
  });

  if (overlappingPromotion) {
    throw new Error('Overlapping promotion exists for this product');
  }

  const result = await prisma.promotion.create({
    data,
    include: {
      product: true,
    },
  });

  return result;
};

const bulkInsertIntoDB = async (data: {
  promotions: Array<{
    productId: string;
    type: PromotionType;
    discountValue: number;
    isPercentage: boolean;
    startDate: Date;
    endDate: Date;
    isActive?: boolean;
    maxUses?: number;
  }>;
}): Promise<Promotion[]> => {
  // Check if all products exist
  const productIds = [...new Set(data.promotions.map(p => p.productId))];
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
  });

  if (products.length !== productIds.length) {
    throw new Error('One or more products not found');
  }

  // Check for overlapping promotions
  const dateRanges = data.promotions.map(p => ({
    productId: p.productId,
    startDate: p.startDate,
    endDate: p.endDate,
  }));

  for (const range of dateRanges) {
    const overlappingPromotion = await prisma.promotion.findFirst({
      where: {
        productId: range.productId,
        isActive: true,
        OR: [
          {
            AND: [
              { startDate: { lte: range.startDate } },
              { endDate: { gte: range.startDate } },
            ],
          },
          {
            AND: [
              { startDate: { lte: range.endDate } },
              { endDate: { gte: range.endDate } },
            ],
          },
          {
            AND: [
              { startDate: { gte: range.startDate } },
              { endDate: { lte: range.endDate } },
            ],
          },
        ],
      },
    });

    if (overlappingPromotion) {
      throw new Error(
        `Overlapping promotion exists for product ${range.productId}`
      );
    }
  }

  // Create promotions
  const createdPromotions = await Promise.all(
    data.promotions.map(promotion =>
      prisma.promotion.create({
        data: promotion,
        include: {
          product: true,
        },
      })
    )
  );

  return createdPromotions;
};

const getAllFromDB = async (
  filters: any,
  options: IPaginationOptions
): Promise<IGenericResponse<Promotion[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { productId, type, isActive, startDate, endDate } = filters;

  const andConditions: Prisma.PromotionWhereInput[] = [];

  if (productId) {
    andConditions.push({ productId });
  }

  if (type) {
    andConditions.push({ type });
  }

  if (typeof isActive === 'boolean') {
    andConditions.push({ isActive });
  }

  if (startDate) {
    andConditions.push({
      startDate: {
        gte: new Date(startDate),
      },
    });
  }

  if (endDate) {
    andConditions.push({
      endDate: {
        lte: new Date(endDate),
      },
    });
  }

  const whereConditions: Prisma.PromotionWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.promotion.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      startDate: 'desc',
    },
    include: {
      product: true,
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
    where: { id },
    include: {
      product: true,
    },
  });

  return result;
};

const updateOneInDB = async (
  id: string,
  payload: Prisma.PromotionUpdateInput
): Promise<Promotion> => {
  const promotion = await prisma.promotion.findUnique({
    where: { id },
    select: {
      productId: true,
      startDate: true,
      endDate: true,
    },
  });

  if (!promotion) {
    throw new Error('Promotion not found');
  }

  // If updating dates, check for overlapping promotions
  if (payload.startDate || payload.endDate) {
    const startDate = payload.startDate
      ? new Date(payload.startDate as Date)
      : promotion.startDate;
    const endDate = payload.endDate
      ? new Date(payload.endDate as Date)
      : promotion.endDate;

    const overlappingPromotion = await prisma.promotion.findFirst({
      where: {
        productId: promotion.productId,
        id: {
          not: id,
        },
        isActive: true,
        OR: [
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: startDate } },
            ],
          },
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: endDate } },
            ],
          },
          {
            AND: [
              { startDate: { gte: startDate } },
              { endDate: { lte: endDate } },
            ],
          },
        ],
      },
    });

    if (overlappingPromotion) {
      throw new Error('Overlapping promotion exists for this product');
    }
  }

  const result = await prisma.promotion.update({
    where: { id },
    data: payload,
    include: {
      product: true,
    },
  });

  return result;
};

const deleteByIdFromDB = async (id: string): Promise<Promotion> => {
  const result = await prisma.promotion.delete({
    where: { id },
    include: {
      product: true,
    },
  });

  return result;
};

const getProductPromotions = async (
  productId: string
): Promise<Promotion[]> => {
  const result = await prisma.promotion.findMany({
    where: {
      productId,
      isActive: true,
      endDate: {
        gte: new Date(),
      },
    },
    orderBy: {
      startDate: 'desc',
    },
    include: {
      product: true,
    },
  });

  return result;
};

const incrementPromotionUses = async (id: string): Promise<Promotion> => {
  const promotion = await prisma.promotion.findUnique({
    where: { id },
    select: {
      maxUses: true,
      currentUses: true,
    },
  });

  if (!promotion) {
    throw new Error('Promotion not found');
  }

  if (
    promotion.maxUses !== null &&
    promotion.currentUses >= promotion.maxUses
  ) {
    throw new Error('Promotion usage limit reached');
  }

  const result = await prisma.promotion.update({
    where: { id },
    data: {
      currentUses: {
        increment: 1,
      },
    },
    include: {
      product: true,
    },
  });

  return result;
};

const insertMany = async (
  tx: PrismaClient | typeof prisma,
  productId: string,
  promotions: Array<{
    type: any;
    discountValue: number;
    isPercentage?: boolean;
    startDate: Date | string;
    endDate: Date | string;
    isActive?: boolean;
    maxUses?: number;
    currentUses?: number;
  }>
): Promise<Promotion[]> => {
  const createdPromotions = await Promise.all(
    promotions.map(promo =>
      tx.promotion.create({
        data: {
          productId,
          type: promo.type,
          discountValue: promo.discountValue,
          isPercentage: promo.isPercentage ?? true,
          startDate: new Date(promo.startDate),
          endDate: new Date(promo.endDate),
          isActive: promo.isActive ?? true,
          maxUses: promo.maxUses,
          currentUses: promo.currentUses ?? 0,
        },
      })
    )
  );

  return createdPromotions;
};

export const PromotionService = {
  insertIntoDB,
  insertMany,
  bulkInsertIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
  getProductPromotions,
  incrementPromotionUses,
};

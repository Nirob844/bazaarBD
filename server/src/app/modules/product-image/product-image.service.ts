import { Prisma, PrismaClient, ProductImage } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';

const insertIntoDB = async (data: {
  productId: string;
  url: string;
  altText?: string;
  isPrimary?: boolean;
}): Promise<ProductImage> => {
  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // If this image is primary, unset any existing primary image
  if (data.isPrimary) {
    await prisma.productImage.updateMany({
      where: {
        productId: data.productId,
        isPrimary: true,
      },
      data: {
        isPrimary: false,
      },
    });
  }

  const result = await prisma.productImage.create({
    data,
    include: {
      product: true,
    },
  });

  return result;
};

const bulkInsertIntoDB = async (data: {
  productId: string;
  images: Array<{
    url: string;
    altText?: string;
    isPrimary?: boolean;
  }>;
}): Promise<ProductImage[]> => {
  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // If any image is primary, unset existing primary image
  const hasPrimaryImage = data.images.some(img => img.isPrimary);
  if (hasPrimaryImage) {
    await prisma.productImage.updateMany({
      where: {
        productId: data.productId,
        isPrimary: true,
      },
      data: {
        isPrimary: false,
      },
    });
  }

  // Create images
  const createdImages = await Promise.all(
    data.images.map(image =>
      prisma.productImage.create({
        data: {
          ...image,
          productId: data.productId,
        },
        include: {
          product: true,
        },
      })
    )
  );

  return createdImages;
};

const getAllFromDB = async (
  filters: any,
  options: IPaginationOptions
): Promise<IGenericResponse<ProductImage[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { productId, isPrimary } = filters;

  const andConditions: Prisma.ProductImageWhereInput[] = [];

  if (productId) {
    andConditions.push({ productId });
  }

  if (typeof isPrimary === 'boolean') {
    andConditions.push({ isPrimary });
  }

  const whereConditions: Prisma.ProductImageWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.productImage.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      isPrimary: 'desc',
    },
    include: {
      product: true,
    },
  });

  const total = await prisma.productImage.count({
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

const getDataById = async (id: string): Promise<ProductImage | null> => {
  const result = await prisma.productImage.findUnique({
    where: { id },
    include: {
      product: true,
    },
  });

  return result;
};

const updateOneInDB = async (
  id: string,
  payload: Prisma.ProductImageUpdateInput
): Promise<ProductImage> => {
  const image = await prisma.productImage.findUnique({
    where: { id },
    select: {
      productId: true,
    },
  });

  if (!image) {
    throw new Error('Image not found');
  }

  // If setting as primary, unset any existing primary image
  if (payload.isPrimary === true) {
    await prisma.productImage.updateMany({
      where: {
        productId: image.productId,
        id: {
          not: id,
        },
        isPrimary: true,
      },
      data: {
        isPrimary: false,
      },
    });
  }

  const result = await prisma.productImage.update({
    where: { id },
    data: payload,
    include: {
      product: true,
    },
  });

  return result;
};

const deleteByIdFromDB = async (id: string): Promise<ProductImage> => {
  const image = await prisma.productImage.findUnique({
    where: { id },
    select: {
      isPrimary: true,
      productId: true,
    },
  });

  if (!image) {
    throw new Error('Image not found');
  }

  // If deleting primary image, set another image as primary if available
  if (image.isPrimary) {
    const nextPrimaryImage = await prisma.productImage.findFirst({
      where: {
        productId: image.productId,
        id: {
          not: id,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (nextPrimaryImage) {
      await prisma.productImage.update({
        where: { id: nextPrimaryImage.id },
        data: {
          isPrimary: true,
        },
      });
    }
  }

  const result = await prisma.productImage.delete({
    where: { id },
    include: {
      product: true,
    },
  });

  return result;
};

const getProductImages = async (productId: string): Promise<ProductImage[]> => {
  const result = await prisma.productImage.findMany({
    where: {
      productId,
    },
    orderBy: [
      {
        isPrimary: 'desc',
      },
      {
        createdAt: 'desc',
      },
    ],
    include: {
      product: true,
    },
  });

  return result;
};

const setPrimaryImage = async (id: string): Promise<ProductImage> => {
  const image = await prisma.productImage.findUnique({
    where: { id },
    select: {
      productId: true,
    },
  });

  if (!image) {
    throw new Error('Image not found');
  }

  // Unset any existing primary image
  await prisma.productImage.updateMany({
    where: {
      productId: image.productId,
      isPrimary: true,
    },
    data: {
      isPrimary: false,
    },
  });

  // Set this image as primary
  const result = await prisma.productImage.update({
    where: { id },
    data: {
      isPrimary: true,
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
  images: string[]
) => {
  return tx.productImage.createMany({
    data: images.map((url, index) => ({
      productId,
      url,
      isPrimary: index === 0,
    })),
  });
};

export const ProductImageService = {
  insertIntoDB,
  bulkInsertIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
  getProductImages,
  setPrimaryImage,
  insertMany,
};

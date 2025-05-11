import { Prisma, ProductAttribute } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';

const insertIntoDB = async (data: {
  productId: string;
  attributeId: string;
  value: string;
  displayValue?: string;
  isFilterable?: boolean;
  isVisible?: boolean;
  displayOrder?: number;
}): Promise<ProductAttribute> => {
  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // Check if attribute exists
  const attribute = await prisma.attribute.findUnique({
    where: { id: data.attributeId },
  });

  if (!attribute) {
    throw new Error('Attribute not found');
  }

  // Check if product attribute already exists
  const existingAttribute = await prisma.productAttribute.findUnique({
    where: {
      productId_attributeId: {
        productId: data.productId,
        attributeId: data.attributeId,
      },
    },
  });

  if (existingAttribute) {
    throw new Error('Product attribute already exists');
  }

  const result = await prisma.productAttribute.create({
    data,
    include: {
      product: true,
      attribute: {
        include: {
          values: true,
        },
      },
    },
  });

  return result;
};

const bulkInsertIntoDB = async (data: {
  productId: string;
  attributes: Array<{
    attributeId: string;
    value: string;
    displayValue?: string;
    isFilterable?: boolean;
    isVisible?: boolean;
    displayOrder?: number;
  }>;
}): Promise<ProductAttribute[]> => {
  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // Check if all attributes exist
  const attributeIds = data.attributes.map(attr => attr.attributeId);
  const attributes = await prisma.attribute.findMany({
    where: {
      id: {
        in: attributeIds,
      },
    },
  });

  if (attributes.length !== attributeIds.length) {
    throw new Error('One or more attributes not found');
  }

  // Check for existing product attributes
  const existingAttributes = await prisma.productAttribute.findMany({
    where: {
      productId: data.productId,
      attributeId: {
        in: attributeIds,
      },
    },
  });

  if (existingAttributes.length > 0) {
    throw new Error('One or more product attributes already exist');
  }

  await prisma.productAttribute.createMany({
    data: data.attributes.map(attr => ({
      ...attr,
      productId: data.productId,
    })),
  });

  // Fetch created attributes with relations
  const createdAttributes = await prisma.productAttribute.findMany({
    where: {
      productId: data.productId,
      attributeId: {
        in: attributeIds,
      },
    },
    include: {
      product: true,
      attribute: {
        include: {
          values: true,
        },
      },
    },
  });

  return createdAttributes;
};

const getAllFromDB = async (
  filters: any,
  options: IPaginationOptions
): Promise<IGenericResponse<ProductAttribute[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { productId, attributeId, searchTerm } = filters;

  const andConditions: Prisma.ProductAttributeWhereInput[] = [];

  if (productId) {
    andConditions.push({ productId });
  }

  if (attributeId) {
    andConditions.push({ attributeId });
  }

  if (searchTerm) {
    andConditions.push({
      OR: [
        {
          value: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          displayValue: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          attribute: {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
      ],
    });
  }

  const whereConditions: Prisma.ProductAttributeWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.productAttribute.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      displayOrder: 'asc',
    },
    include: {
      product: true,
      attribute: {
        include: {
          values: true,
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
    where: { id },
    include: {
      product: true,
      attribute: {
        include: {
          values: true,
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
    where: { id },
    data: payload,
    include: {
      product: true,
      attribute: {
        include: {
          values: true,
        },
      },
    },
  });

  return result;
};

const deleteByIdFromDB = async (id: string): Promise<ProductAttribute> => {
  const result = await prisma.productAttribute.delete({
    where: { id },
    include: {
      product: true,
      attribute: {
        include: {
          values: true,
        },
      },
    },
  });

  return result;
};

const getProductAttributes = async (
  productId: string
): Promise<ProductAttribute[]> => {
  const result = await prisma.productAttribute.findMany({
    where: { productId },
    orderBy: {
      displayOrder: 'asc',
    },
    include: {
      attribute: {
        include: {
          values: true,
        },
      },
    },
  });

  return result;
};

export const ProductAttributeService = {
  insertIntoDB,
  bulkInsertIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
  getProductAttributes,
};

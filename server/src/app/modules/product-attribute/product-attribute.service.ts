import {
  AttributeType,
  Prisma,
  PrismaClient,
  ProductAttribute,
} from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';

type PrismaTransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

// const insertIntoDB = async (
//   tx: PrismaClient | PrismaTransactionClient,
//   data: {
//     productId: string;
//     attributeId: string;
//     value: string;
//     displayValue?: string;
//     isFilterable?: boolean;
//     isVisible?: boolean;
//     displayOrder?: number;
//   }
// ): Promise<ProductAttribute> => {
//   console.log(data, 'product attribute data from service');
//   // Check if product exists
//   const product = await tx.product.findUnique({
//     where: { id: data.productId },
//   });

//   if (!product) {
//     throw new Error('Product not found');
//   }

//   // Check if attribute exists
//   const attribute = await tx.attribute.findUnique({
//     where: { id: data.attributeId },
//   });

//   if (!attribute) {
//     throw new Error('Attribute not found');
//   }

//   // Check if product attribute already exists
//   const existingAttribute = await tx.productAttribute.findUnique({
//     where: {
//       productId_attributeId: {
//         productId: data.productId,
//         attributeId: data.attributeId,
//       },
//     },
//   });

//   if (existingAttribute) {
//     throw new Error('Product attribute already exists');
//   }

//   const result = await tx.productAttribute.create({
//     data,
//     include: {
//       product: true,
//       attribute: {
//         include: {
//           values: true,
//         },
//       },
//     },
//   });

//   return result;
// };

const insertIntoDB = async (
  prisma: PrismaClient,
  payload: {
    productId: string;
    attribute?: {
      id?: string;
      name: string;
      type: AttributeType; // Enum: 'TEXT' | 'SELECT' | ...
      description?: string;
      isRequired?: boolean;
      isFilterable?: boolean;
      isVisible?: boolean;
      displayOrder?: number;
      values?: {
        value: string;
        displayValue?: string;
        isDefault?: boolean;
        displayOrder?: number;
      }[];
    };
    value: string;
    displayValue?: string;
    isFilterable?: boolean;
    isVisible?: boolean;
    displayOrder?: number;
  }
) => {
  const {
    productId,
    attribute,
    value,
    displayValue,
    isFilterable = false,
    isVisible = true,
    displayOrder = 0,
  } = payload;

  // Validate product
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error('Product not found');

  let attributeId: string;

  // Handle attribute (create or find)
  if (attribute?.id) {
    // Reuse existing attribute
    const existingAttr = await prisma.attribute.findUnique({
      where: { id: attribute.id },
    });
    if (!existingAttr) throw new Error('Attribute not found');
    attributeId = existingAttr.id;
  } else if (attribute?.name && attribute.type) {
    // Try finding existing attribute by name
    let existingAttr = await prisma.attribute.findUnique({
      where: { name: attribute.name },
    });

    if (!existingAttr) {
      // Create new attribute
      existingAttr = await prisma.attribute.create({
        data: {
          name: attribute.name,
          type: attribute.type,
          description: attribute.description,
          isRequired: attribute.isRequired ?? false,
          isFilterable: attribute.isFilterable ?? false,
          isVisible: attribute.isVisible ?? true,
          displayOrder: attribute.displayOrder ?? 0,
        },
      });
    }

    attributeId = existingAttr.id;

    // Handle values if attribute is of type SELECT or MULTISELECT
    if (
      ['SELECT', 'MULTISELECT'].includes(attribute.type.toUpperCase()) &&
      attribute.values?.length
    ) {
      for (const attrValue of attribute.values) {
        const exists = await prisma.attributeValue.findFirst({
          where: {
            attributeId,
            value: attrValue.value,
          },
        });
        if (!exists) {
          await prisma.attributeValue.create({
            data: {
              attributeId,
              value: attrValue.value,
              displayValue: attrValue.displayValue,
              isDefault: attrValue.isDefault ?? false,
              displayOrder: attrValue.displayOrder ?? 0,
            },
          });
        }
      }
    }
  } else {
    throw new Error('Attribute data is incomplete');
  }

  // Final check for allowed value (if SELECT or MULTISELECT)
  const attr = await prisma.attribute.findUnique({
    where: { id: attributeId },
    include: { values: true },
  });
  if (!attr) throw new Error('Attribute not found');

  if (['SELECT', 'MULTISELECT'].includes(attr.type)) {
    const isValidValue = attr.values.some(v => v.value === value);
    if (!isValidValue) {
      throw new Error(`Invalid value "${value}" for attribute "${attr.name}"`);
    }
  }

  // Create ProductAttribute
  const productAttribute = await prisma.productAttribute.create({
    data: {
      productId,
      attributeId,
      value,
      displayValue,
      isFilterable,
      isVisible,
      displayOrder,
    },
    include: {
      attribute: true,
    },
  });

  return productAttribute;
};

const insertMany = async (
  tx: PrismaClient | PrismaTransactionClient,
  attributes: Array<{
    productId: string;
    attributeId: string;
    value: string;
    displayValue?: string;
    isFilterable?: boolean;
    isVisible?: boolean;
    displayOrder?: number;
  }>
) => {
  return tx.productAttribute.createMany({
    data: attributes.map(attr => ({
      productId: attr.productId,
      attributeId: attr.attributeId,
      value: attr.value,
      displayValue: attr.displayValue,
      isFilterable: attr.isFilterable ?? false,
      isVisible: attr.isVisible ?? true,
      displayOrder: attr.displayOrder ?? 0,
    })),
  });
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
  insertMany,
  bulkInsertIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
  getProductAttributes,
};

import {
  Prisma,
  PrismaClient,
  ProductVariant,
  StockStatus,
} from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';

type PrismaTransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

const insertIntoDB = async (
  tx: PrismaClient | PrismaTransactionClient,
  data: {
    productId: string;
    name: string;
    sku?: string;
    basePrice?: number;
    salePrice?: number;
    costPrice?: number;
    taxRate?: number;
    taxClass?: string;
    minimumOrder?: number;
    maximumOrder?: number;
    stockStatus?: StockStatus;
    isBackorder?: boolean;
    backorderLimit?: number;
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    attributes: Record<string, any>;
    imageUrl?: string;
    barcode?: string;
    upc?: string;
    ean?: string;
    isActive?: boolean;
    isDefault?: boolean;
    isVisible?: boolean;
    inventory?: {
      stock: number;
      lowStockThreshold?: number;
      reorderPoint?: number;
      reorderQuantity?: number;
      location?: string;
      binNumber?: string;
    };
  }
): Promise<ProductVariant> => {
  console.log('product variant data', data);
  // 1. Check if product exists
  const product = await tx.product.findUnique({
    where: { id: data.productId },
  });

  if (!product) throw new Error('Product not found');

  // 2. Check SKU uniqueness
  if (data.sku) {
    const existingVariant = await tx.productVariant.findUnique({
      where: { sku: data.sku },
    });
    if (existingVariant) throw new Error('SKU already exists');
  }

  // 3. Handle default variant logic
  const variantCount = await tx.productVariant.count({
    where: { productId: data.productId },
  });

  if (variantCount === 0 || data.isDefault) {
    if (data.isDefault) {
      await tx.productVariant.updateMany({
        where: { productId: data.productId, isDefault: true },
        data: { isDefault: false },
      });
    }
    data.isDefault = true;
  }

  // 4. Create ProductVariant
  const variant = await tx.productVariant.create({
    data: {
      productId: data.productId,
      name: data.name,
      sku: data.sku,
      basePrice: data.basePrice,
      salePrice: data.salePrice,
      costPrice: data.costPrice,
      taxRate: data.taxRate,
      taxClass: data.taxClass,
      minimumOrder: data.minimumOrder,
      maximumOrder: data.maximumOrder,
      stockStatus: data.stockStatus || 'IN_STOCK',
      isBackorder: data.isBackorder ?? false,
      backorderLimit: data.backorderLimit,
      weight: data.weight,
      dimensions: data.dimensions ? JSON.stringify(data.dimensions) : undefined,
      attributes: data.attributes,
      imageUrl: data.imageUrl,
      barcode: data.barcode,
      upc: data.upc,
      ean: data.ean,
      isActive: data.isActive ?? true,
      isDefault: data.isDefault ?? false,
      isVisible: data.isVisible ?? true,
    },
    include: {
      product: true,
    },
  });

  // 5. Optionally create Inventory
  // if (data.inventory) {
  //   await InventoryService.insertIntoDBForVariant(tx, {
  //     ...data.inventory,
  //     productId: data.productId,
  //     variantId: variant.id,
  //     availableStock: data.inventory.stock,
  //     reservedStock: 0,
  //   });
  // }

  return variant;
};

const bulkInsertIntoDB = async (data: {
  productId: string;
  variants: Array<{
    name: string;
    sku?: string;
    basePrice?: number;
    salePrice?: number;
    costPrice?: number;
    taxRate?: number;
    taxClass?: string;
    minimumOrder?: number;
    maximumOrder?: number;
    stockStatus?: StockStatus;
    isBackorder?: boolean;
    backorderLimit?: number;
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    attributes: Record<string, any>;
    imageUrl?: string;
    barcode?: string;
    upc?: string;
    ean?: string;
    isActive?: boolean;
    isDefault?: boolean;
    isVisible?: boolean;
  }>;
}): Promise<ProductVariant[]> => {
  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // Check for duplicate SKUs
  const skus = data.variants
    .map(v => v.sku)
    .filter((sku): sku is string => !!sku);

  if (skus.length > 0) {
    const existingVariants = await prisma.productVariant.findMany({
      where: {
        sku: {
          in: skus,
        },
      },
    });

    if (existingVariants.length > 0) {
      throw new Error('One or more SKUs already exist');
    }
  }

  // Handle default variant
  const variantCount = await prisma.productVariant.count({
    where: { productId: data.productId },
  });

  const hasDefaultVariant = data.variants.some(v => v.isDefault);
  if (variantCount === 0 && !hasDefaultVariant) {
    data.variants[0].isDefault = true;
  } else if (hasDefaultVariant) {
    // Unset any existing default variant
    await prisma.productVariant.updateMany({
      where: {
        productId: data.productId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  // Create variants
  const createdVariants = await Promise.all(
    data.variants.map(variant =>
      prisma.productVariant.create({
        data: {
          ...variant,
          productId: data.productId,
        },
        include: {
          product: true,
          inventory: true,
        },
      })
    )
  );

  return createdVariants;
};

const getAllFromDB = async (
  filters: any,
  options: IPaginationOptions
): Promise<IGenericResponse<ProductVariant[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { productId, searchTerm, stockStatus, isActive, isVisible } = filters;

  const andConditions: Prisma.ProductVariantWhereInput[] = [];

  if (productId) {
    andConditions.push({ productId });
  }

  if (stockStatus) {
    andConditions.push({ stockStatus });
  }

  if (typeof isActive === 'boolean') {
    andConditions.push({ isActive });
  }

  if (typeof isVisible === 'boolean') {
    andConditions.push({ isVisible });
  }

  if (searchTerm) {
    andConditions.push({
      OR: [
        {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          sku: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          barcode: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          upc: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          ean: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ],
    });
  }

  const whereConditions: Prisma.ProductVariantWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.productVariant.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      product: true,
      inventory: true,
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
    where: { id },
    include: {
      product: true,
      inventory: true,
    },
  });

  return result;
};

const updateOneInDB = async (
  id: string,
  payload: Prisma.ProductVariantUpdateInput
): Promise<ProductVariant> => {
  // If updating SKU, check for uniqueness
  if (payload.sku) {
    const existingVariant = await prisma.productVariant.findFirst({
      where: {
        sku: payload.sku as string,
        id: {
          not: id,
        },
      },
    });

    if (existingVariant) {
      throw new Error('SKU already exists');
    }
  }

  // If setting as default variant, unset any existing default variant
  if (payload.isDefault) {
    const variant = await prisma.productVariant.findUnique({
      where: { id },
      select: { productId: true },
    });

    if (variant) {
      await prisma.productVariant.updateMany({
        where: {
          productId: variant.productId,
          id: {
            not: id,
          },
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }
  }

  const result = await prisma.productVariant.update({
    where: { id },
    data: payload,
    include: {
      product: true,
      inventory: true,
    },
  });

  return result;
};

const deleteByIdFromDB = async (id: string): Promise<ProductVariant> => {
  const variant = await prisma.productVariant.findUnique({
    where: { id },
    select: {
      productId: true,
      isDefault: true,
    },
  });

  if (!variant) {
    throw new Error('Variant not found');
  }

  // If deleting the default variant, set another variant as default
  if (variant.isDefault) {
    const nextVariant = await prisma.productVariant.findFirst({
      where: {
        productId: variant.productId,
        id: {
          not: id,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (nextVariant) {
      await prisma.productVariant.update({
        where: { id: nextVariant.id },
        data: {
          isDefault: true,
        },
      });
    }
  }

  const result = await prisma.productVariant.delete({
    where: { id },
    include: {
      product: true,
      inventory: true,
    },
  });

  return result;
};

const getProductVariants = async (
  productId: string
): Promise<ProductVariant[]> => {
  const result = await prisma.productVariant.findMany({
    where: { productId },
    orderBy: [
      {
        isDefault: 'desc',
      },
      {
        createdAt: 'asc',
      },
    ],
    include: {
      inventory: true,
    },
  });

  return result;
};

const insertMany = async (
  tx: PrismaClient | typeof prisma,
  productId: string,
  variants: Array<{
    name: string;
    sku?: string;
    basePrice?: number;
    salePrice?: number;
    costPrice?: number;
    taxRate?: number;
    taxClass?: string;
    minimumOrder?: number;
    maximumOrder?: number;
    stockStatus?: StockStatus;
    isBackorder?: boolean;
    backorderLimit?: number;
    weight?: number;
    dimensions?: string;
    attributes?: Record<string, any>;
    imageUrl?: string;
    barcode?: string;
    upc?: string;
    ean?: string;
    isActive?: boolean;
    isDefault?: boolean;
    isVisible?: boolean;
    inventory?: {
      stock: number;
      lowStockThreshold?: number;
      reorderPoint?: number;
      reorderQuantity?: number;
      location?: string;
      binNumber?: string;
    };
  }>
): Promise<ProductVariant[]> => {
  const createdVariants = await Promise.all(
    variants.map(async variant => {
      const variantData: Prisma.ProductVariantCreateInput = {
        product: {
          connect: {
            id: productId,
          },
        },
        name: variant.name,
        sku: variant.sku,
        basePrice: variant.basePrice,
        salePrice: variant.salePrice,
        costPrice: variant.costPrice,
        taxRate: variant.taxRate,
        taxClass: variant.taxClass,
        minimumOrder: variant.minimumOrder,
        maximumOrder: variant.maximumOrder,
        stockStatus: variant.stockStatus ?? StockStatus.IN_STOCK,
        isBackorder: variant.isBackorder ?? false,
        backorderLimit: variant.backorderLimit,
        weight: variant.weight,
        dimensions: variant.dimensions,
        attributes: variant.attributes
          ? (variant.attributes as Prisma.InputJsonValue)
          : Prisma.JsonNull,
        imageUrl: variant.imageUrl,
        barcode: variant.barcode,
        upc: variant.upc,
        ean: variant.ean,
        isActive: variant.isActive ?? true,
        isDefault: variant.isDefault ?? false,
        isVisible: variant.isVisible ?? true,
      };

      if (variant.inventory) {
        return tx.productVariant.create({
          data: {
            ...variantData,
            inventory: {
              create: {
                stock: variant.inventory.stock,
                lowStockThreshold: variant.inventory.lowStockThreshold ?? 5,
                reorderPoint: variant.inventory.reorderPoint,
                reorderQuantity: variant.inventory.reorderQuantity,
                location: variant.inventory.location,
                binNumber: variant.inventory.binNumber,
                availableStock: variant.inventory.stock,
                reservedStock: 0,
                product: {
                  connect: {
                    id: productId,
                  },
                },
              },
            },
          },
          include: {
            inventory: true,
          },
        });
      }

      return tx.productVariant.create({
        data: variantData,
        include: {
          inventory: true,
        },
      });
    })
  );

  return createdVariants;
};

export const ProductVariantService = {
  insertIntoDB,
  bulkInsertIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
  getProductVariants,
  insertMany,
};

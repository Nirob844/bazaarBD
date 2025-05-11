/* eslint-disable no-undef */
import {
  Inventory,
  Prisma,
  Product,
  ProductStatus,
  ProductVariant,
  Promotion,
} from '@prisma/client';
import slugify from 'slugify';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { productSearchableFields } from './product.constant';
import {
  CreateProductData,
  MulterFile,
  ProductWithRelations,
  ShopSelect,
  VendorSelect,
} from './product.types';

const insertIntoDB = async (
  data: CreateProductData,
  files?: MulterFile[]
): Promise<ProductWithRelations> => {
  console.log('productData', data);
  const {
    name,
    inventory,
    attributes,
    variants,
    tags,
    images: existingImages,
    promotions,
    ...productData
  } = data;

  // Generate slug from name
  const slug = slugify(name, { lower: true, strict: true });

  // Handle image uploads
  let uploadedImages: string[] = [];
  if (files && files.length > 0) {
    uploadedImages = await Promise.all(
      files.map(async file => {
        const uploadedFile = await FileUploadHelper.uploadToCloudinary(file);
        if (!uploadedFile) throw new Error('Failed to upload image');
        return uploadedFile.secure_url;
      })
    );
  }

  // Combine existing and new images
  const allImages = [...(existingImages || []), ...uploadedImages];

  // Create product with all related data in a transaction
  const result = await prisma.$transaction(async tx => {
    // Create product
    const product = (await tx.product.create({
      data: {
        name,
        slug,
        ...productData,
        // Create product images using proper Prisma types
        images:
          allImages.length > 0
            ? {
                createMany: {
                  data: allImages.map((url, index) => ({
                    url,
                    isPrimary: index === 0,
                  })),
                },
              }
            : undefined,
        // Create inventory with proper types
        inventory: inventory
          ? {
              create: {
                stock: inventory.stock,
                lowStockThreshold: inventory.lowStockThreshold ?? 5,
                reorderPoint: inventory.reorderPoint,
                reorderQuantity: inventory.reorderQuantity,
                location: inventory.location,
                binNumber: inventory.binNumber,
                //    warehouseId: inventory.warehouseId,
                availableStock: inventory.stock,
                reservedStock: 0,
              },
            }
          : undefined,
        // Create attributes with proper types
        attributes: attributes
          ? {
              createMany: {
                data: attributes.map(attr => ({
                  attributeId: attr.attributeId,
                  value: attr.value,
                  displayValue: attr.displayValue,
                  isFilterable: attr.isFilterable ?? false,
                  isVisible: attr.isVisible ?? true,
                  displayOrder: attr.displayOrder ?? 0,
                })),
              },
            }
          : undefined,
        // Create variants with proper types
        variants: variants
          ? {
              create: variants.map(variant => {
                const variantData: Prisma.ProductVariantCreateWithoutProductInput =
                  {
                    name: variant.name,
                    sku: variant.sku,
                    basePrice: variant.basePrice,
                    salePrice: variant.salePrice,
                    costPrice: variant.costPrice,
                    taxRate: variant.taxRate,
                    taxClass: variant.taxClass,
                    minimumOrder: variant.minimumOrder,
                    maximumOrder: variant.maximumOrder,
                    stockStatus: variant.stockStatus ?? 'IN_STOCK',
                    isBackorder: variant.isBackorder ?? false,
                    backorderLimit: variant.backorderLimit,
                    weight: variant.weight,
                    dimensions: variant.dimensions,
                    attributes: variant.attributes,
                    imageUrl: variant.imageUrl,
                    barcode: variant.barcode,
                    upc: variant.upc,
                    ean: variant.ean,
                    isActive: variant.isActive ?? true,
                    isDefault: variant.isDefault ?? false,
                    isVisible: variant.isVisible ?? true,
                  };

                // Add inventory if provided
                if (variant.inventory) {
                  const {
                    stock,
                    lowStockThreshold,
                    reorderPoint,
                    reorderQuantity,
                    location,
                    binNumber,
                    warehouseId,
                  } = variant.inventory;
                  const inventoryData: any = {
                    stock,
                    lowStockThreshold: lowStockThreshold ?? 5,
                    reorderPoint,
                    reorderQuantity,
                    location,
                    binNumber,
                    availableStock: stock,
                    reservedStock: 0,
                  };
                  if (warehouseId) inventoryData.warehouseId = warehouseId;
                  variantData.inventory = { create: inventoryData };
                }

                return variantData;
              }),
            }
          : undefined,
        // Create tags with proper types
        tags: tags
          ? {
              connectOrCreate: tags.map(tag => ({
                where: { name: tag },
                create: { name: tag },
              })),
            }
          : undefined,
        // Add promotions creation
        promotions: promotions
          ? {
              create: promotions.map(promo => ({
                type: promo.type,
                discountValue: promo.discountValue,
                isPercentage: promo.isPercentage ?? true,
                startDate: new Date(promo.startDate),
                endDate: new Date(promo.endDate),
                isActive: promo.isActive ?? true,
                maxUses: promo.maxUses,
                currentUses: promo.currentUses ?? 0,
              })),
            }
          : undefined,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
          },
        },
        vendor: {
          select: {
            id: true,
            businessName: true,
            businessEmail: true,
            imageUrl: true,
          } as VendorSelect,
        },
        shop: {
          select: {
            id: true,
            name: true,
            logo: true,
          } as ShopSelect,
        },
        images: true,
        inventory: {
          include: {
            warehouse: true,
            history: {
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        attributes: {
          include: {
            attribute: true,
          },
        },
        variants: {
          include: {
            inventory: {
              include: {
                warehouse: true,
                history: {
                  take: 1,
                  orderBy: { createdAt: 'desc' },
                },
              },
            },
          },
        },
        tags: true,
        promotions: true,
      },
    })) as ProductWithRelations;

    // Create initial inventory history for main product
    if (inventory && product.inventory) {
      await tx.inventoryHistory.create({
        data: {
          inventoryId: product.inventory.id,
          action: 'ADJUSTMENT',
          quantityChange: inventory.stock,
          previousStock: 0,
          newStock: inventory.stock,
          referenceType: 'INITIAL_STOCK',
          notes: 'Initial stock setup',
        },
      });
    }

    // Create initial inventory history for variants
    if (variants && product.variants) {
      await Promise.all(
        product.variants.map(
          async (
            variant: ProductVariant & { inventory?: Inventory | null },
            index: number
          ) => {
            if (variant.inventory && variants[index].inventory) {
              await tx.inventoryHistory.create({
                data: {
                  inventoryId: variant.inventory.id,
                  action: 'ADJUSTMENT',
                  quantityChange: variants[index].inventory!.stock,
                  previousStock: 0,
                  newStock: variants[index].inventory!.stock,
                  referenceType: 'INITIAL_STOCK',
                  notes: 'Initial stock setup for variant',
                },
              });
            }
          }
        )
      );
    }

    return product;
  });

  return result;
};

const getAllFromDB = async (
  filters: any,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<Product[]>> => {
  const { searchTerm, ...filterData } = filters;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: productSearchableFields.map((field: string) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map(key => {
        if (key === 'minPrice') {
          return { basePrice: { gte: Number(filterData[key]) } };
        }
        if (key === 'maxPrice') {
          return { basePrice: { lte: Number(filterData[key]) } };
        }
        return { [key]: filterData[key] };
      }),
    });
  }

  const whereConditions: Prisma.ProductWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.product.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : {
            createdAt: 'desc',
          },
    include: {
      category: true,
      vendor: true,
      shop: true,
      attributes: true,
      variants: true,
      promotions: true,
    },
  });

  const total = await prisma.product.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getAllPromotionProducts = async (
  filters: any,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<Product[]>> => {
  const {
    type,
    status,
    expired,
    minDiscount,
    maxDiscount,
    categoryId,
    vendorId,
  } = filters;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const whereConditions: Prisma.ProductWhereInput = {
    promotions: {
      some: {
        ...(type && { type }),
        ...(status && { status }),
        ...(minDiscount && { discountValue: { gte: Number(minDiscount) } }),
        ...(maxDiscount && { discountValue: { lte: Number(maxDiscount) } }),
        ...(expired === 'true'
          ? { endDate: { lt: new Date() } }
          : expired === 'false'
          ? { endDate: { gt: new Date() } }
          : {}),
      },
    },
    ...(categoryId && { categoryId }),
    ...(vendorId && { vendorId }),
    status: 'PUBLISHED',
    stockStatus: { in: ['IN_STOCK', 'LOW_STOCK'] },
  };

  const result = await prisma.product.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: [
      ...(sortBy && sortOrder ? [{ [sortBy]: sortOrder }] : []),
      { featured: 'desc' },
      { bestSeller: 'desc' },
      { newArrival: 'desc' },
      { averageRating: 'desc' },
      { createdAt: 'desc' },
    ],
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
        },
      },
      vendor: {
        select: {
          id: true,
          businessName: true,
          businessEmail: true,
          imageUrl: true,
        },
      },
      shop: {
        select: {
          id: true,
          name: true,
          logo: true,
        } as ShopSelect,
      },
      promotions: {
        where: {
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
        select: {
          id: true,
          productId: true,
          type: true,
          discountValue: true,
          isPercentage: true,
          startDate: true,
          endDate: true,
          isActive: true,
          maxUses: true,
          currentUses: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      attributes: {
        where: {
          isVisible: true,
        },
        select: {
          attributeId: true,
          value: true,
          displayValue: true,
        },
      },
      variants: {
        where: {
          isActive: true,
          isVisible: true,
        },
        select: {
          id: true,
          productId: true,
          name: true,
          sku: true,
          basePrice: true,
          salePrice: true,
          costPrice: true,
          taxRate: true,
          taxClass: true,
          minimumOrder: true,
          maximumOrder: true,
          stockStatus: true,
          isBackorder: true,
          backorderLimit: true,
          weight: true,
          dimensions: true,
          attributes: true,
          imageUrl: true,
          barcode: true,
          upc: true,
          ean: true,
          isActive: true,
          isDefault: true,
          isVisible: true,
          viewCount: true,
          orderCount: true,
          lastRestocked: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      inventory: {
        select: {
          stock: true,
          availableStock: true,
          lowStockThreshold: true,
        },
      },
    },
  });

  const total = await prisma.product.count({
    where: whereConditions,
  });

  // Calculate effective prices with promotions
  const productsWithPromotions = result.map(product => {
    const activePromotions =
      (product as ProductWithRelations).promotions?.filter(
        (promo: Promotion) =>
          promo.isActive &&
          new Date(promo.startDate) <= new Date() &&
          new Date(promo.endDate) >= new Date()
      ) ?? [];

    const bestPromotion = activePromotions.reduce(
      (best: Promotion | null, current: Promotion) => {
        if (!best) return current;
        return Number(current.discountValue) > Number(best.discountValue)
          ? current
          : best;
      },
      null
    );

    return {
      ...product,
      effectivePrice: bestPromotion
        ? {
            original: product.basePrice,
            discounted:
              Number(product.basePrice) *
              (1 - Number(bestPromotion.discountValue) / 100),
            discount: bestPromotion.discountValue,
            promotion: bestPromotion,
          }
        : {
            original: product.basePrice,
            discounted: product.salePrice || product.basePrice,
            discount: product.salePrice
              ? ((Number(product.basePrice) - Number(product.salePrice)) /
                  Number(product.basePrice)) *
                100
              : 0,
          },
    };
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: productsWithPromotions,
  };
};

const getDataById = async (id: string): Promise<Product | null> => {
  const result = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
      vendor: true,
      shop: true,
      attributes: true,
      variants: true,
      promotions: true,
    },
  });
  return result;
};

const getProductPromotions = async (id: string) => {
  const result = await prisma.product.findUnique({
    where: {
      id,
      status: 'PUBLISHED',
    },
    select: {
      id: true,
      name: true,
      basePrice: true,
      salePrice: true,
      promotions: {
        where: {
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
        orderBy: [{ discountValue: 'desc' }, { endDate: 'asc' }],
        select: {
          id: true,
          type: true,
          discountValue: true,
          isPercentage: true,
          startDate: true,
          endDate: true,
          isActive: true,
          maxUses: true,
          currentUses: true,
        },
      },
      variants: {
        where: {
          isActive: true,
          isVisible: true,
        },
        select: {
          id: true,
          productId: true,
          name: true,
          sku: true,
          basePrice: true,
          salePrice: true,
          costPrice: true,
          taxRate: true,
          taxClass: true,
          minimumOrder: true,
          maximumOrder: true,
          stockStatus: true,
          isBackorder: true,
          backorderLimit: true,
          weight: true,
          dimensions: true,
          attributes: true,
          imageUrl: true,
          barcode: true,
          upc: true,
          ean: true,
          isActive: true,
          isDefault: true,
          isVisible: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!result) return null;

  // Calculate effective prices for each promotion
  const promotionsWithPrices = (result as any).promotions.map(
    (promotion: Promotion) => {
      const effectivePrice =
        Number(result.basePrice) * (1 - Number(promotion.discountValue) / 100);
      const savings = Number(result.basePrice) - effectivePrice;

      return {
        ...promotion,
        effectivePrice,
        savings,
        originalPrice: result.basePrice,
        variants: (result as any).variants.map((variant: ProductVariant) => ({
          ...variant,
          effectivePrice: variant.basePrice
            ? Number(variant.basePrice) *
              (1 - Number(promotion.discountValue) / 100)
            : effectivePrice,
        })),
      };
    }
  );

  return {
    productId: result.id,
    productName: result.name,
    basePrice: result.basePrice,
    salePrice: result.salePrice,
    promotions: promotionsWithPrices,
  };
};

const getProductAttributes = async (id: string) => {
  const result = await prisma.product.findUnique({
    where: {
      id,
    },
    select: {
      attributes: true,
    },
  });
  return result?.attributes;
};

const getProductVariants = async (id: string) => {
  const result = await prisma.product.findUnique({
    where: {
      id,
    },
    select: {
      variants: true,
    },
  });
  return result?.variants;
};

const updateOneInDB = async (
  id: string,
  data: any,
  files?: MulterFile[]
): Promise<Product> => {
  const { images, ...productData } = data;

  // Handle image uploads
  let uploadedImages: string[] = [];
  if (files && files.length > 0) {
    uploadedImages = await Promise.all(
      files.map(async file => {
        const uploadedFile = await FileUploadHelper.uploadToCloudinary(file);
        if (!uploadedFile) throw new Error('Failed to upload image');
        return uploadedFile.secure_url;
      })
    );
  }

  // Combine existing and new images
  const allImages = [...(images || []), ...uploadedImages];

  const result = await prisma.product.update({
    where: {
      id,
    },
    data: {
      ...productData,
      images: allImages,
    },
    include: {
      category: true,
      vendor: true,
      shop: true,
      attributes: true,
      variants: true,
      promotions: true,
    },
  });

  return result;
};

const deleteByIdFromDB = async (id: string): Promise<Product> => {
  // Use a transaction to ensure all related data is deleted atomically
  const result = await prisma.$transaction(async tx => {
    // First, get the product with its relations to delete
    const product = await tx.product.findUnique({
      where: { id },
      include: {
        images: true,
        inventory: true,
        variants: {
          include: {
            inventory: true,
          },
        },
        promotions: true,
        attributes: true,
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Delete inventory history for main product inventory
    if (product.inventory) {
      await tx.inventoryHistory.deleteMany({
        where: { inventoryId: product.inventory.id },
      });
    }

    // Delete inventory history for variant inventories
    if (product.variants) {
      for (const variant of product.variants) {
        if (variant.inventory) {
          await tx.inventoryHistory.deleteMany({
            where: { inventoryId: variant.inventory.id },
          });
        }
      }
    }

    // Delete variant inventories
    if (product.variants) {
      for (const variant of product.variants) {
        if (variant.inventory) {
          await tx.inventory.delete({
            where: { id: variant.inventory.id },
          });
        }
      }
    }

    // Delete main product inventory
    if (product.inventory) {
      await tx.inventory.delete({
        where: { id: product.inventory.id },
      });
    }

    // Delete product images
    await tx.productImage.deleteMany({
      where: { productId: id },
    });

    // Delete product attributes
    await tx.productAttribute.deleteMany({
      where: { productId: id },
    });

    // Delete product variants
    await tx.productVariant.deleteMany({
      where: { productId: id },
    });

    // Delete product promotions
    await tx.promotion.deleteMany({
      where: { productId: id },
    });

    // Delete product tags (this will only remove the relation, not the tags themselves)
    await tx.product.update({
      where: { id },
      data: {
        tags: {
          set: [], // This removes all tag relations
        },
      },
    });

    // Finally, delete the product itself
    const deletedProduct = await tx.product.delete({
      where: { id },
    });

    return deletedProduct;
  });

  return result;
};

const bulkCreate = async (
  products: any[],
  files?: MulterFile[]
): Promise<Product[]> => {
  const uploadedFiles = files || [];
  const fileMap = new Map<string, string>();

  // Upload all files first
  await Promise.all(
    uploadedFiles.map(async file => {
      const uploadedFile = await FileUploadHelper.uploadToCloudinary(file);
      if (!uploadedFile) throw new Error('Failed to upload image');
      fileMap.set(file.originalname, uploadedFile.secure_url);
    })
  );

  // Process each product
  const results = await Promise.all(
    products.map(async product => {
      const { images, ...productData } = product;
      const productImages =
        images?.map((img: string) => fileMap.get(img) || img) || [];

      return prisma.product.create({
        data: {
          ...productData,
          images: productImages,
        },
        include: {
          category: true,
          vendor: true,
          shop: true,
          attributes: true,
          variants: true,
          promotions: true,
        },
      });
    })
  );

  return results;
};

const bulkUpdate = async (products: any[]): Promise<Product[]> => {
  const results = await Promise.all(
    products.map(async product => {
      const { id, ...data } = product;
      return prisma.product.update({
        where: { id },
        data,
        include: {
          category: true,
          vendor: true,
          shop: true,
          attributes: true,
          variants: true,
          promotions: true,
        },
      });
    })
  );

  return results;
};

const bulkDelete = async (ids: string[]): Promise<Product[]> => {
  const results = await Promise.all(
    ids.map(async id => {
      return prisma.product.delete({
        where: { id },
      });
    })
  );

  return results;
};

const updateStatus = async (
  id: string,
  data: { status: ProductStatus }
): Promise<Product> => {
  const result = await prisma.product.update({
    where: { id },
    data: { status: data.status },
    include: {
      category: true,
      vendor: true,
      shop: true,
      attributes: true,
      variants: true,
      promotions: true,
    },
  });

  return result;
};

const updateInventory = async (
  id: string,
  data: {
    stock?: number;
    lowStockThreshold?: number;
    reorderPoint?: number;
    reorderQuantity?: number;
  }
): Promise<Product> => {
  const result = await prisma.product.update({
    where: { id },
    data: {
      inventory: {
        update: data,
      },
    },
    include: {
      category: true,
      vendor: true,
      shop: true,
      attributes: true,
      variants: true,
      promotions: true,
    },
  });

  return result;
};

const updateMarketing = async (
  id: string,
  data: {
    featured?: boolean;
    bestSeller?: boolean;
    newArrival?: boolean;
    featuredUntil?: Date;
  }
): Promise<Product> => {
  const result = await prisma.product.update({
    where: { id },
    data,
    include: {
      category: true,
      vendor: true,
      shop: true,
      attributes: true,
      variants: true,
      promotions: true,
    },
  });

  return result;
};

const getBestSellingProducts = async (
  limit = 10
): Promise<ProductWithRelations[]> => {
  const products = (await prisma.product.findMany({
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
        },
      },
      vendor: {
        select: {
          id: true,
          businessName: true,
          businessEmail: true,
          imageUrl: true,
        } as VendorSelect,
      },
      shop: {
        select: {
          id: true,
          name: true,
          logo: true,
        } as ShopSelect,
      },
      images: true,
      inventory: {
        include: {
          warehouse: true,
          history: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      },
      attributes: {
        include: {
          attribute: true,
        },
      },
      variants: {
        include: {
          inventory: {
            include: {
              warehouse: true,
              history: {
                take: 1,
                orderBy: { createdAt: 'desc' },
              },
            },
          },
        },
      },
      tags: true,
      promotions: {
        where: {
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
        select: {
          id: true,
          type: true,
          discountValue: true,
          isPercentage: true,
          startDate: true,
          endDate: true,
          isActive: true,
          maxUses: true,
          currentUses: true,
        },
      },
    },
  })) as unknown as ProductWithRelations[];

  return products;
};

const getPromotionalProducts = async (
  limit = 10
): Promise<ProductWithRelations[]> => {
  const products = (await prisma.product.findMany({
    take: limit,
    where: {
      promotions: {
        some: {
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      },
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
        },
      },
      vendor: {
        select: {
          id: true,
          businessName: true,
          businessEmail: true,
          imageUrl: true,
        } as VendorSelect,
      },
      shop: {
        select: {
          id: true,
          name: true,
          logo: true,
        } as ShopSelect,
      },
      images: true,
      inventory: {
        include: {
          warehouse: true,
          history: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      },
      attributes: {
        include: {
          attribute: true,
        },
      },
      variants: {
        include: {
          inventory: {
            include: {
              warehouse: true,
              history: {
                take: 1,
                orderBy: { createdAt: 'desc' },
              },
            },
          },
        },
      },
      tags: true,
      promotions: {
        where: {
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
        select: {
          id: true,
          type: true,
          discountValue: true,
          isPercentage: true,
          startDate: true,
          endDate: true,
          isActive: true,
          maxUses: true,
          currentUses: true,
        },
      },
    },
  })) as unknown as ProductWithRelations[];

  return products;
};

// Add new functions for promotional products
const getActivePromotions = async (): Promise<Promotion[]> => {
  const result = await prisma.promotion.findMany({
    where: {
      isActive: true,
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          basePrice: true,
          salePrice: true,
          images: true,
          stockStatus: true,
        },
      },
    },
    orderBy: [{ discountValue: 'desc' }, { endDate: 'asc' }],
  });
  return result;
};

const getUpcomingPromotions = async (): Promise<Promotion[]> => {
  const result = await prisma.promotion.findMany({
    where: {
      isActive: true,
      startDate: { gt: new Date() },
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          basePrice: true,
          salePrice: true,
          images: true,
          stockStatus: true,
        },
      },
    },
    orderBy: [{ startDate: 'asc' }, { discountValue: 'desc' }],
  });
  return result;
};

const getExpiredPromotions = async (): Promise<Promotion[]> => {
  const result = await prisma.promotion.findMany({
    where: {
      endDate: { lt: new Date() },
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          basePrice: true,
          salePrice: true,
          images: true,
          stockStatus: true,
        },
      },
    },
    orderBy: [{ endDate: 'desc' }, { discountValue: 'desc' }],
  });
  return result;
};

const getPromotionStats = async () => {
  const now = new Date();
  const stats = await prisma.promotion.groupBy({
    by: ['type'],
    _count: {
      _all: true,
    },
    where: {
      isActive: true,
    },
  });

  const activePromotions = await prisma.promotion.count({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
  });

  const upcomingPromotions = await prisma.promotion.count({
    where: {
      isActive: true,
      startDate: { gt: now },
    },
  });

  const expiredPromotions = await prisma.promotion.count({
    where: {
      endDate: { lt: now },
    },
  });

  const totalDiscountValue = await prisma.promotion.aggregate({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    _sum: {
      discountValue: true,
    },
  });

  return {
    byType: stats,
    activeCount: activePromotions,
    upcomingCount: upcomingPromotions,
    expiredCount: expiredPromotions,
    totalActiveDiscount: totalDiscountValue._sum.discountValue || 0,
  };
};

const getPromotionDetails = async (promotionId: string) => {
  const promotion = await prisma.promotion.findUnique({
    where: { id: promotionId },
    include: {
      product: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          vendor: {
            select: {
              id: true,
              businessName: true,
              businessEmail: true,
            },
          },
          shop: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
          variants: {
            where: {
              isActive: true,
              isVisible: true,
            },
            include: {
              inventory: true,
            },
          },
          inventory: true,
        },
      },
    },
  });

  if (!promotion) {
    throw new Error('Promotion not found');
  }

  // Calculate effective prices
  const effectivePrice = promotion.isPercentage
    ? Number(promotion.product.basePrice) *
      (1 - Number(promotion.discountValue) / 100)
    : Number(promotion.product.basePrice) - Number(promotion.discountValue);

  const savings = Number(promotion.product.basePrice) - effectivePrice;

  return {
    ...promotion,
    effectivePrice,
    savings,
    daysRemaining: Math.ceil(
      (new Date(promotion.endDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    ),
    variants: promotion.product.variants.map(variant => ({
      ...variant,
      effectivePrice: variant.basePrice
        ? promotion.isPercentage
          ? Number(variant.basePrice) *
            (1 - Number(promotion.discountValue) / 100)
          : Number(variant.basePrice) - Number(promotion.discountValue)
        : effectivePrice,
    })),
  };
};

export const ProductService = {
  insertIntoDB,
  getAllFromDB,
  getAllPromotionProducts,
  getDataById,
  getProductPromotions,
  getProductAttributes,
  getProductVariants,
  updateOneInDB,
  deleteByIdFromDB,
  bulkCreate,
  bulkUpdate,
  bulkDelete,
  updateStatus,
  updateInventory,
  updateMarketing,
  getBestSellingProducts,
  getPromotionalProducts,
  getActivePromotions,
  getUpcomingPromotions,
  getExpiredPromotions,
  getPromotionStats,
  getPromotionDetails,
};

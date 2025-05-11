/* eslint-disable no-undef */
import {
  OrderStatus,
  Prisma,
  Product,
  ProductStatus,
  ProductVariant,
  Promotion,
  StockStatus,
} from '@prisma/client';
import slugify from 'slugify';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { InventoryService } from '../inventory/inventory.service';
import { ProductAttributeService } from '../product-attribute/product-attribute.service';
import { ProductImageService } from '../product-image/product-image.service';
import { ProductTagService } from '../product-tag/product-tag.service';
import { ProductVariantService } from '../product-variant/product-variant.service';
import { PromotionService } from '../promotion/promotion.service';
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

  // Validate name
  if (!name || typeof name !== 'string') {
    throw new Error('Product name is required and must be a string');
  }

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
    // 1. Create base product
    const product = await tx.product.create({
      data: {
        name,
        slug,
        ...productData,
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
      },
    });

    // 2. Create product images
    if (allImages.length > 0) {
      await Promise.all(
        allImages.map((url, index) =>
          ProductImageService.insertIntoDB({
            productId: product.id,
            url,
            isPrimary: index === 0,
          })
        )
      );
    }

    // 3. Create inventory if provided
    if (inventory) {
      await InventoryService.insertIntoDB(prisma, {
        ...inventory,
        productId: product.id,
        availableStock: inventory.stock,
        reservedStock: 0,
      });
    }

    // 4. Create attributes if provided
    if (attributes && attributes.length > 0) {
      await Promise.all(
        attributes.map(attr =>
          ProductAttributeService.insertIntoDB({
            productId: product.id,
            attributeId: attr.attributeId,
            value: attr.value,
            displayValue: attr.displayValue,
            isFilterable: attr.isFilterable,
            isVisible: attr.isVisible,
            displayOrder: attr.displayOrder,
          })
        )
      );
    }

    // 5. Create variants if provided
    if (variants && variants.length > 0) {
      await Promise.all(
        variants.map(variant =>
          ProductVariantService.insertIntoDB({
            productId: product.id,
            ...variant,
          })
        )
      );
    }

    // 6. Create tags if provided
    if (tags && tags.length > 0) {
      await Promise.all(
        tags.map(tag =>
          ProductTagService.insertIntoDB({
            name: tag,
          }).then(tagRecord =>
            tx.product.update({
              where: { id: product.id },
              data: {
                tags: {
                  connect: { id: tagRecord.id },
                },
              },
            })
          )
        )
      );
    }

    // 7. Create promotions if provided
    if (promotions && promotions.length > 0) {
      await Promise.all(
        promotions.map(promo =>
          PromotionService.insertIntoDB({
            productId: product.id,
            type: promo.type,
            discountValue: promo.discountValue,
            isPercentage: promo.isPercentage ?? true,
            startDate: new Date(promo.startDate),
            endDate: new Date(promo.endDate),
            isActive: promo.isActive ?? true,
            maxUses: promo.maxUses,
          })
        )
      );
    }

    // 8. Fetch complete product with all relations
    const completeProduct = await tx.product.findUnique({
      where: { id: product.id },
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
        reviews: {
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!completeProduct) {
      throw new Error('Failed to create product');
    }

    // Cast to unknown first to avoid type checking issues
    return completeProduct as unknown as ProductWithRelations;
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
  const products = await prisma.product.findMany({
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
      reviews: {
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  // Cast to unknown first to avoid type checking issues
  return products as unknown as ProductWithRelations[];
};

const getPromotionalProducts = async (
  limit = 10
): Promise<ProductWithRelations[]> => {
  const products = await prisma.product.findMany({
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
      reviews: {
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  // Cast to unknown first to avoid type checking issues
  return products as unknown as ProductWithRelations[];
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

const getProductBySlug = async (
  slug: string
): Promise<ProductWithRelations | null> => {
  const result = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
        },
      },
      shop: {
        select: {
          id: true,
          name: true,
          logo: true,
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
      },
      reviews: {
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!result) return null;

  // Increment view count
  await prisma.product.update({
    where: { id: result.id },
    data: {
      viewCount: {
        increment: 1,
      },
    },
  });

  // Log the view in audit log
  await prisma.auditLog.create({
    data: {
      entityType: 'Product',
      entityId: result.id,
      action: 'VIEW',
      createdAt: new Date(),
    },
  });

  // Cast to unknown first to avoid type checking issues
  return result as unknown as ProductWithRelations;
};

const getRelatedProducts = async (
  productId: string,
  limit = 4
): Promise<Product[]> => {
  // Get the product to find its category and tags
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      categoryId: true,
      tags: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // Find related products based on category and tags
  const relatedProducts = await prisma.product.findMany({
    where: {
      id: { not: productId },
      status: 'PUBLISHED',
      OR: [
        { categoryId: product.categoryId },
        {
          tags: {
            some: {
              id: {
                in: product.tags.map(tag => tag.id),
              },
            },
          },
        },
      ],
    },
    take: limit,
    orderBy: [
      { featured: 'desc' },
      { bestSeller: 'desc' },
      { newArrival: 'desc' },
      { averageRating: 'desc' },
      { viewCount: 'desc' },
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
        select: {
          stock: true,
          availableStock: true,
          lowStockThreshold: true,
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
          name: true,
          sku: true,
          basePrice: true,
          salePrice: true,
          stockStatus: true,
          imageUrl: true,
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
        },
      },
    },
  });

  return relatedProducts;
};

const getProductReviews = async (
  productId: string,
  options: IPaginationOptions
): Promise<IGenericResponse<any>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  const reviews = await prisma.review.findMany({
    where: {
      productId,
      isApproved: true,
    },
    skip,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
        },
      },
    },
  });

  const total = await prisma.review.count({
    where: {
      productId,
      isApproved: true,
    },
  });

  // Calculate review statistics
  const stats = await prisma.review.aggregate({
    where: {
      productId,
      isApproved: true,
    },
    _avg: {
      rating: true,
    },
    _count: {
      _all: true,
    },
  });

  const ratingDistribution = await prisma.review.groupBy({
    by: ['rating'],
    where: {
      productId,
      isApproved: true,
    },
    _count: {
      _all: true,
    },
  });

  const response = {
    meta: {
      total,
      page,
      limit,
      reviewStats: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count._all,
        ratingDistribution: ratingDistribution.reduce(
          (acc: Record<number, number>, curr) => {
            acc[curr.rating] = curr._count._all;
            return acc;
          },
          {}
        ),
      },
    },
    data: reviews,
  };

  return response;
};

const getProductAnalytics = async (productId: string) => {
  // Get basic product data
  const productData = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      viewCount: true,
      averageRating: true,
      createdAt: true,
    },
  });

  if (!productData) {
    throw new Error('Product not found');
  }

  // Get sales data
  const salesData = await prisma.orderItem.aggregate({
    where: {
      productId,
      order: {
        status: OrderStatus.COMPLETED,
      },
    },
    _sum: {
      quantity: true,
      total: true,
    },
    _count: {
      _all: true,
    },
  });

  // Get review data
  const reviewData = await prisma.review.aggregate({
    where: {
      productId,
      isApproved: true,
    },
    _avg: {
      rating: true,
    },
    _count: {
      _all: true,
    },
  });

  // Get inventory data
  const inventoryData = await prisma.inventory.findUnique({
    where: { productId },
    select: {
      stock: true,
      availableStock: true,
      reservedStock: true,
      lowStockThreshold: true,
    },
  });

  // Get promotion data
  const activePromotions = await prisma.promotion.count({
    where: {
      productId,
      isActive: true,
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    },
  });

  // Get view trends (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get daily views from audit log
  const viewLogs = await prisma.auditLog.findMany({
    where: {
      entityType: 'Product',
      entityId: productId,
      action: 'VIEW',
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Calculate daily views
  const dailyViews = viewLogs.reduce((acc: Record<string, number>, log) => {
    const date = log.createdAt.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  return {
    product: {
      id: productData.id,
      name: productData.name,
      totalViews: productData.viewCount,
      averageRating: productData.averageRating,
      createdAt: productData.createdAt,
    },
    sales: {
      totalQuantity: salesData._sum?.quantity || 0,
      totalRevenue: salesData._sum?.total || 0,
      totalOrders: salesData._count?._all || 0,
    },
    reviews: {
      totalReviews: reviewData._count._all,
      averageRating: reviewData._avg.rating || 0,
    },
    inventory: inventoryData
      ? {
          currentStock: inventoryData.stock,
          availableStock: inventoryData.availableStock,
          reservedStock: inventoryData.reservedStock,
          lowStockThreshold: inventoryData.lowStockThreshold,
          stockStatus:
            inventoryData.availableStock <= inventoryData.lowStockThreshold
              ? StockStatus.LOW_STOCK
              : inventoryData.availableStock === 0
              ? StockStatus.OUT_OF_STOCK
              : StockStatus.IN_STOCK,
        }
      : null,
    promotions: {
      activePromotions,
    },
    trends: {
      dailyViews,
    },
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
  getProductBySlug,
  getRelatedProducts,
  getProductReviews,
  getProductAnalytics,
};

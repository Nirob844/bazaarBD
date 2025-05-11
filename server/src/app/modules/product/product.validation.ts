import { z } from 'zod';

const createProductZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Product name is required',
    }),
    description: z.string().optional(),
    shortDescription: z.string().max(500).optional(),
    metaTitle: z.string().max(100).optional(),
    metaDescription: z.string().max(255).optional(),
    metaKeywords: z.string().max(255).optional(),
    canonicalUrl: z.string().max(255).optional(),
    basePrice: z
      .number({
        required_error: 'Base price is required',
      })
      .min(0),
    salePrice: z.number().min(0).optional(),
    costPrice: z.number().min(0).optional(),
    taxRate: z.number().min(0).max(100).optional(),
    taxClass: z.string().max(50).optional(),
    minimumOrder: z.number().min(1).optional(),
    maximumOrder: z.number().min(1).optional(),
    bulkPricing: z.record(z.number()).optional(),
    sku: z
      .string({
        required_error: 'SKU is required',
      })
      .max(50),
    barcode: z.string().max(50).optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
    stockStatus: z.enum(['IN_STOCK', 'OUT_OF_STOCK', 'LOW_STOCK']).optional(),
    lowStockThreshold: z.number().min(0).optional(),
    weight: z.number().min(0).optional(),
    dimensions: z
      .object({
        length: z.number().min(0),
        width: z.number().min(0),
        height: z.number().min(0),
      })
      .optional(),
    packageSize: z
      .object({
        length: z.number().min(0),
        width: z.number().min(0),
        height: z.number().min(0),
      })
      .optional(),
    shippingClass: z.string().max(50).optional(),
    isBackorder: z.boolean().optional(),
    backorderLimit: z.number().min(0).optional(),
    featured: z.boolean().optional(),
    bestSeller: z.boolean().optional(),
    newArrival: z.boolean().optional(),
    featuredUntil: z.string().datetime().optional(),
    categoryId: z.string({
      required_error: 'Category ID is required',
    }),
    vendorId: z.string({
      required_error: 'Vendor ID is required',
    }),
    shopId: z.string().optional(),
    inventory: z
      .object({
        stock: z.number().min(0),
        lowStockThreshold: z.number().min(0).optional(),
        reorderPoint: z.number().min(0).optional(),
        reorderQuantity: z.number().min(0).optional(),
      })
      .optional(),
    attributes: z
      .array(
        z.object({
          key: z.string(),
          value: z.string(),
        })
      )
      .optional(),
    variants: z
      .array(
        z.object({
          name: z.string(),
          sku: z.string(),
          price: z.number().min(0),
          stock: z.number().min(0),
          attributes: z.record(z.string()),
        })
      )
      .optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const updateProductZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    shortDescription: z.string().max(500).optional(),
    metaTitle: z.string().max(100).optional(),
    metaDescription: z.string().max(255).optional(),
    metaKeywords: z.string().max(255).optional(),
    canonicalUrl: z.string().max(255).optional(),
    basePrice: z.number().min(0).optional(),
    salePrice: z.number().min(0).optional(),
    costPrice: z.number().min(0).optional(),
    taxRate: z.number().min(0).max(100).optional(),
    taxClass: z.string().max(50).optional(),
    minimumOrder: z.number().min(1).optional(),
    maximumOrder: z.number().min(1).optional(),
    bulkPricing: z.record(z.number()).optional(),
    sku: z.string().max(50).optional(),
    barcode: z.string().max(50).optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
    stockStatus: z.enum(['IN_STOCK', 'OUT_OF_STOCK', 'LOW_STOCK']).optional(),
    lowStockThreshold: z.number().min(0).optional(),
    weight: z.number().min(0).optional(),
    dimensions: z
      .object({
        length: z.number().min(0),
        width: z.number().min(0),
        height: z.number().min(0),
      })
      .optional(),
    packageSize: z
      .object({
        length: z.number().min(0),
        width: z.number().min(0),
        height: z.number().min(0),
      })
      .optional(),
    shippingClass: z.string().max(50).optional(),
    isBackorder: z.boolean().optional(),
    backorderLimit: z.number().min(0).optional(),
    featured: z.boolean().optional(),
    bestSeller: z.boolean().optional(),
    newArrival: z.boolean().optional(),
    featuredUntil: z.string().datetime().optional(),
    categoryId: z.string().optional(),
    vendorId: z.string().optional(),
    shopId: z.string().optional(),
    inventory: z
      .object({
        stock: z.number().min(0),
        lowStockThreshold: z.number().min(0).optional(),
        reorderPoint: z.number().min(0).optional(),
        reorderQuantity: z.number().min(0).optional(),
      })
      .optional(),
    attributes: z
      .array(
        z.object({
          key: z.string(),
          value: z.string(),
        })
      )
      .optional(),
    variants: z
      .array(
        z.object({
          name: z.string(),
          sku: z.string(),
          price: z.number().min(0),
          stock: z.number().min(0),
          attributes: z.record(z.string()),
        })
      )
      .optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const deleteProductZodSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Product ID is required',
    }),
  }),
});

export const ProductValidation = {
  create: createProductZodSchema,
  update: updateProductZodSchema,
  delete: deleteProductZodSchema,
};

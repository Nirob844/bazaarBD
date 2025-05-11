import { StockStatus } from '@prisma/client';
import { z } from 'zod';

const createProductVariantZodSchema = z.object({
  body: z.object({
    productId: z.string({
      required_error: 'Product ID is required',
    }),
    name: z
      .string({
        required_error: 'Name is required',
      })
      .max(100, 'Name must be less than 100 characters'),
    sku: z.string().max(50, 'SKU must be less than 50 characters').optional(),
    basePrice: z.number().positive('Base price must be positive').optional(),
    salePrice: z.number().positive('Sale price must be positive').optional(),
    costPrice: z.number().positive('Cost price must be positive').optional(),
    taxRate: z
      .number()
      .min(0, 'Tax rate must be non-negative')
      .max(100, 'Tax rate must be less than 100')
      .default(0),
    taxClass: z
      .string()
      .max(50, 'Tax class must be less than 50 characters')
      .optional(),
    minimumOrder: z
      .number()
      .int()
      .positive('Minimum order must be positive')
      .default(1),
    maximumOrder: z
      .number()
      .int()
      .positive('Maximum order must be positive')
      .optional(),
    stockStatus: z
      .enum([...Object.values(StockStatus)] as [string, ...string[]])
      .default(StockStatus.IN_STOCK),
    isBackorder: z.boolean().default(false),
    backorderLimit: z
      .number()
      .int()
      .positive('Backorder limit must be positive')
      .optional(),
    weight: z.number().positive('Weight must be positive').optional(),
    dimensions: z
      .object({
        length: z.number().positive('Length must be positive'),
        width: z.number().positive('Width must be positive'),
        height: z.number().positive('Height must be positive'),
      })
      .optional(),
    attributes: z.record(z.any(), {
      required_error: 'Attributes are required',
    }),
    imageUrl: z.string().url('Invalid image URL').optional(),
    barcode: z
      .string()
      .max(50, 'Barcode must be less than 50 characters')
      .optional(),
    upc: z.string().max(50, 'UPC must be less than 50 characters').optional(),
    ean: z.string().max(50, 'EAN must be less than 50 characters').optional(),
    isActive: z.boolean().default(true),
    isDefault: z.boolean().default(false),
    isVisible: z.boolean().default(true),
  }),
});

const updateProductVariantZodSchema = z.object({
  body: z.object({
    name: z
      .string()
      .max(100, 'Name must be less than 100 characters')
      .optional(),
    sku: z.string().max(50, 'SKU must be less than 50 characters').optional(),
    basePrice: z.number().positive('Base price must be positive').optional(),
    salePrice: z.number().positive('Sale price must be positive').optional(),
    costPrice: z.number().positive('Cost price must be positive').optional(),
    taxRate: z
      .number()
      .min(0, 'Tax rate must be non-negative')
      .max(100, 'Tax rate must be less than 100')
      .optional(),
    taxClass: z
      .string()
      .max(50, 'Tax class must be less than 50 characters')
      .optional(),
    minimumOrder: z
      .number()
      .int()
      .positive('Minimum order must be positive')
      .optional(),
    maximumOrder: z
      .number()
      .int()
      .positive('Maximum order must be positive')
      .optional(),
    stockStatus: z
      .enum([...Object.values(StockStatus)] as [string, ...string[]])
      .optional(),
    isBackorder: z.boolean().optional(),
    backorderLimit: z
      .number()
      .int()
      .positive('Backorder limit must be positive')
      .optional(),
    weight: z.number().positive('Weight must be positive').optional(),
    dimensions: z
      .object({
        length: z.number().positive('Length must be positive'),
        width: z.number().positive('Width must be positive'),
        height: z.number().positive('Height must be positive'),
      })
      .optional(),
    attributes: z.record(z.any()).optional(),
    imageUrl: z.string().url('Invalid image URL').optional(),
    barcode: z
      .string()
      .max(50, 'Barcode must be less than 50 characters')
      .optional(),
    upc: z.string().max(50, 'UPC must be less than 50 characters').optional(),
    ean: z.string().max(50, 'EAN must be less than 50 characters').optional(),
    isActive: z.boolean().optional(),
    isDefault: z.boolean().optional(),
    isVisible: z.boolean().optional(),
  }),
});

const bulkCreateProductVariantZodSchema = z.object({
  body: z.object({
    productId: z.string({
      required_error: 'Product ID is required',
    }),
    variants: z.array(createProductVariantZodSchema.shape.body).min(1),
  }),
});

export const ProductVariantValidation = {
  createProductVariantZodSchema,
  updateProductVariantZodSchema,
  bulkCreateProductVariantZodSchema,
};

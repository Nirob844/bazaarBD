import { z } from 'zod';

const createInventoryZodSchema = z.object({
  body: z.object({
    productId: z.string({
      required_error: 'Product ID is required',
    }),
    variantId: z.string().optional(),
    sku: z.string({
      required_error: 'SKU is required',
    }),
    barcode: z.string().optional(),
    location: z.string().optional(),
    batchNumber: z.string().optional(),
    expiryDate: z
      .string()
      .optional()
      .transform(val => (val ? new Date(val) : undefined)),
    costPrice: z
      .number({
        required_error: 'Cost price is required',
      })
      .min(0, 'Cost price must be positive'),
    sellingPrice: z
      .number({
        required_error: 'Selling price is required',
      })
      .min(0, 'Selling price must be positive'),
    stock: z
      .number({
        required_error: 'Stock is required',
      })
      .min(0, 'Stock cannot be negative'),
    reservedStock: z
      .number()
      .min(0, 'Reserved stock cannot be negative')
      .optional(),
    reorderPoint: z
      .number()
      .min(0, 'Reorder point cannot be negative')
      .optional(),
    reorderQuantity: z
      .number()
      .min(0, 'Reorder quantity cannot be negative')
      .optional(),
    notes: z.string().optional(),
  }),
});

const updateInventoryZodSchema = z.object({
  body: z.object({
    productId: z.string().optional(),
    variantId: z.string().optional(),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    location: z.string().optional(),
    batchNumber: z.string().optional(),
    expiryDate: z
      .string()
      .optional()
      .transform(val => (val ? new Date(val) : undefined)),
    costPrice: z.number().min(0, 'Cost price must be positive').optional(),
    sellingPrice: z
      .number()
      .min(0, 'Selling price must be positive')
      .optional(),
    stock: z.number().min(0, 'Stock cannot be negative').optional(),
    reservedStock: z
      .number()
      .min(0, 'Reserved stock cannot be negative')
      .optional(),
    reorderPoint: z
      .number()
      .min(0, 'Reorder point cannot be negative')
      .optional(),
    reorderQuantity: z
      .number()
      .min(0, 'Reorder quantity cannot be negative')
      .optional(),
    notes: z.string().optional(),
  }),
});

const reserveStockZodSchema = z.object({
  body: z.object({
    quantity: z
      .number({
        required_error: 'Quantity is required',
      })
      .min(1, 'Quantity must be at least 1'),
  }),
});

const releaseStockZodSchema = z.object({
  body: z.object({
    quantity: z
      .number({
        required_error: 'Quantity is required',
      })
      .min(1, 'Quantity must be at least 1'),
  }),
});

export const InventoryValidation = {
  createInventoryZodSchema,
  updateInventoryZodSchema,
  reserveStockZodSchema,
  releaseStockZodSchema,
};

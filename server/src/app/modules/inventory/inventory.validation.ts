import { z } from 'zod';

const createInventoryZodSchema = z.object({
  body: z.object({
    productId: z.string({
      required_error: 'Product ID is required',
    }),
    variantId: z.string().optional(),
    warehouseId: z.string().optional(),
    stock: z
      .number({
        required_error: 'Stock is required',
      })
      .min(0, 'Stock cannot be negative'),
    reservedStock: z
      .number()
      .min(0, 'Reserved stock cannot be negative')
      .default(0),
    availableStock: z
      .number()
      .min(0, 'Available stock cannot be negative')
      .default(0),
    lowStockThreshold: z
      .number()
      .min(0, 'Low stock threshold must be positive')
      .default(5),
    reorderPoint: z
      .number()
      .min(0, 'Reorder point must be positive')
      .optional(),
    reorderQuantity: z
      .number()
      .min(0, 'Reorder quantity must be positive')
      .optional(),
    location: z
      .string()
      .max(100, 'Location must be less than 100 characters')
      .optional(),
    binNumber: z
      .string()
      .max(50, 'Bin number must be less than 50 characters')
      .optional(),
    lastCounted: z
      .string()
      .transform(val => (val ? new Date(val) : undefined))
      .optional(),
  }),
});

const updateInventoryZodSchema = z.object({
  body: z.object({
    productId: z.string().optional(),
    variantId: z.string().optional(),
    warehouseId: z.string().optional(),
    stock: z.number().min(0, 'Stock cannot be negative').optional(),
    reservedStock: z
      .number()
      .min(0, 'Reserved stock cannot be negative')
      .optional(),
    availableStock: z
      .number()
      .min(0, 'Available stock cannot be negative')
      .optional(),
    lowStockThreshold: z
      .number()
      .min(0, 'Low stock threshold must be positive')
      .optional(),
    reorderPoint: z
      .number()
      .min(0, 'Reorder point must be positive')
      .optional(),
    reorderQuantity: z
      .number()
      .min(0, 'Reorder quantity must be positive')
      .optional(),
    location: z
      .string()
      .max(100, 'Location must be less than 100 characters')
      .optional(),
    binNumber: z
      .string()
      .max(50, 'Bin number must be less than 50 characters')
      .optional(),
    lastCounted: z
      .string()
      .transform(val => (val ? new Date(val) : undefined))
      .optional(),
  }),
});

const adjustStockZodSchema = z.object({
  body: z.object({
    quantity: z
      .number({
        required_error: 'Quantity is required',
      })
      .int('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1'),
    type: z.enum(['ADD', 'REMOVE', 'SET'], {
      required_error: 'Adjustment type is required',
    }),
    reason: z
      .string()
      .min(1, 'Reason is required')
      .max(255, 'Reason must be less than 255 characters'),
    notes: z
      .string()
      .max(1000, 'Notes must be less than 1000 characters')
      .optional(),
  }),
});

const reserveStockZodSchema = z.object({
  body: z.object({
    quantity: z
      .number({
        required_error: 'Quantity is required',
      })
      .int('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1'),
    reason: z
      .string()
      .min(1, 'Reason is required')
      .max(255, 'Reason must be less than 255 characters'),
    notes: z
      .string()
      .max(1000, 'Notes must be less than 1000 characters')
      .optional(),
  }),
});

const releaseStockZodSchema = z.object({
  body: z.object({
    quantity: z
      .number({
        required_error: 'Quantity is required',
      })
      .int('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1'),
    reason: z
      .string()
      .min(1, 'Reason is required')
      .max(255, 'Reason must be less than 255 characters'),
    notes: z
      .string()
      .max(1000, 'Notes must be less than 1000 characters')
      .optional(),
  }),
});

const transferStockZodSchema = z.object({
  body: z.object({
    quantity: z
      .number({
        required_error: 'Quantity is required',
      })
      .int('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1'),
    sourceWarehouseId: z.string({
      required_error: 'Source warehouse ID is required',
    }),
    destinationWarehouseId: z.string({
      required_error: 'Destination warehouse ID is required',
    }),
    reason: z
      .string()
      .min(1, 'Reason is required')
      .max(255, 'Reason must be less than 255 characters'),
    notes: z
      .string()
      .max(1000, 'Notes must be less than 1000 characters')
      .optional(),
  }),
});

export const InventoryValidation = {
  createInventoryZodSchema,
  updateInventoryZodSchema,
  adjustStockZodSchema,
  reserveStockZodSchema,
  releaseStockZodSchema,
  transferStockZodSchema,
};

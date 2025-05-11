import { z } from 'zod';

const createInventoryHistoryZodSchema = z.object({
  body: z.object({
    inventoryId: z.string({
      required_error: 'Inventory ID is required',
    }),
    action: z.enum(['ADJUSTMENT', 'PURCHASE', 'SALE', 'RETURN', 'TRANSFER'], {
      required_error: 'Action is required',
    }),
    quantityChange: z.number({
      required_error: 'Quantity change is required',
    }),
    referenceId: z.string().optional(),
    referenceType: z
      .enum(['ORDER', 'PURCHASE', 'ADJUSTMENT', 'TRANSFER'])
      .optional(),
    notes: z.string().optional(),
    performedBy: z.string().optional(),
  }),
});

export const InventoryHistoryValidation = {
  createInventoryHistoryZodSchema,
};

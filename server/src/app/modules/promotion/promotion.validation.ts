import { PromotionType } from '@prisma/client';
import { z } from 'zod';

const createPromotionZodSchema = z.object({
  body: z
    .object({
      productId: z.string({
        required_error: 'Product ID is required',
      }),
      type: z.enum([...Object.values(PromotionType)] as [string, ...string[]], {
        required_error: 'Promotion type is required',
      }),
      discountValue: z
        .number({
          required_error: 'Discount value is required',
        })
        .positive('Discount value must be positive'),
      isPercentage: z.boolean().default(true),
      startDate: z
        .string({
          required_error: 'Start date is required',
        })
        .transform(str => new Date(str)),
      endDate: z
        .string({
          required_error: 'End date is required',
        })
        .transform(str => new Date(str)),
      isActive: z.boolean().default(true),
      maxUses: z
        .number()
        .int()
        .positive('Maximum uses must be positive')
        .optional(),
    })
    .refine(
      data => {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return end > start;
      },
      {
        message: 'End date must be after start date',
        path: ['endDate'],
      }
    )
    .refine(
      data => {
        if (data.isPercentage && data.discountValue > 100) {
          return false;
        }
        return true;
      },
      {
        message: 'Percentage discount cannot exceed 100%',
        path: ['discountValue'],
      }
    ),
});

const updatePromotionZodSchema = z.object({
  body: z
    .object({
      type: z
        .enum([...Object.values(PromotionType)] as [string, ...string[]])
        .optional(),
      discountValue: z
        .number()
        .positive('Discount value must be positive')
        .optional(),
      isPercentage: z.boolean().optional(),
      startDate: z
        .string()
        .transform(str => new Date(str))
        .optional(),
      endDate: z
        .string()
        .transform(str => new Date(str))
        .optional(),
      isActive: z.boolean().optional(),
      maxUses: z
        .number()
        .int()
        .positive('Maximum uses must be positive')
        .optional(),
    })
    .refine(
      data => {
        if (!data.startDate || !data.endDate) return true;
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return end > start;
      },
      {
        message: 'End date must be after start date',
        path: ['endDate'],
      }
    )
    .refine(
      data => {
        if (
          data.isPercentage &&
          data.discountValue &&
          data.discountValue > 100
        ) {
          return false;
        }
        return true;
      },
      {
        message: 'Percentage discount cannot exceed 100%',
        path: ['discountValue'],
      }
    ),
});

const bulkCreatePromotionZodSchema = z.object({
  body: z.object({
    promotions: z.array(createPromotionZodSchema.shape.body).min(1),
  }),
});

export const PromotionValidation = {
  createPromotionZodSchema,
  updatePromotionZodSchema,
  bulkCreatePromotionZodSchema,
};

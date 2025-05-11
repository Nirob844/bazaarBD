import { z } from 'zod';

const createProductImageZodSchema = z.object({
  body: z.object({
    productId: z.string({
      required_error: 'Product ID is required',
    }),
    url: z
      .string({
        required_error: 'Image URL is required',
      })
      .url('Invalid image URL'),
    altText: z
      .string()
      .max(255, 'Alt text cannot exceed 255 characters')
      .optional(),
    isPrimary: z.boolean().default(false),
  }),
});

const updateProductImageZodSchema = z.object({
  body: z.object({
    url: z.string().url('Invalid image URL').optional(),
    altText: z
      .string()
      .max(255, 'Alt text cannot exceed 255 characters')
      .optional(),
    isPrimary: z.boolean().optional(),
  }),
});

const bulkCreateProductImageZodSchema = z.object({
  body: z.object({
    productId: z.string({
      required_error: 'Product ID is required',
    }),
    images: z
      .array(
        z.object({
          url: z
            .string({
              required_error: 'Image URL is required',
            })
            .url('Invalid image URL'),
          altText: z
            .string()
            .max(255, 'Alt text cannot exceed 255 characters')
            .optional(),
          isPrimary: z.boolean().default(false),
        })
      )
      .min(1, 'At least one image is required'),
  }),
});

const setPrimaryImageZodSchema = z.object({
  body: z.object({
    isPrimary: z.literal(true),
  }),
});

export const ProductImageValidation = {
  createProductImageZodSchema,
  updateProductImageZodSchema,
  bulkCreateProductImageZodSchema,
  setPrimaryImageZodSchema,
};

import { z } from 'zod';

const createProductTagZodSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Tag name is required',
      })
      .min(1, 'Tag name cannot be empty')
      .max(50, 'Tag name cannot exceed 50 characters'),
  }),
});

const updateProductTagZodSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Tag name cannot be empty')
      .max(50, 'Tag name cannot exceed 50 characters')
      .optional(),
  }),
});

const bulkCreateProductTagZodSchema = z.object({
  body: z.object({
    tags: z
      .array(
        z.object({
          name: z
            .string({
              required_error: 'Tag name is required',
            })
            .min(1, 'Tag name cannot be empty')
            .max(50, 'Tag name cannot exceed 50 characters'),
        })
      )
      .min(1, 'At least one tag is required'),
  }),
});

export const ProductTagValidation = {
  createProductTagZodSchema,
  updateProductTagZodSchema,
  bulkCreateProductTagZodSchema,
};

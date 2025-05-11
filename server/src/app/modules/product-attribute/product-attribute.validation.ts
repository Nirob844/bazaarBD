import { z } from 'zod';

const createProductAttributeZodSchema = z.object({
  body: z.object({
    productId: z.string({
      required_error: 'Product ID is required',
    }),
    attributeId: z.string({
      required_error: 'Attribute ID is required',
    }),
    value: z
      .string({
        required_error: 'Value is required',
      })
      .max(255, 'Value must be less than 255 characters'),
    displayValue: z
      .string()
      .max(255, 'Display value must be less than 255 characters')
      .optional(),
    isFilterable: z.boolean().default(false),
    isVisible: z.boolean().default(true),
    displayOrder: z.number().int().min(0).default(0),
  }),
});

const updateProductAttributeZodSchema = z.object({
  body: z.object({
    value: z
      .string()
      .max(255, 'Value must be less than 255 characters')
      .optional(),
    displayValue: z
      .string()
      .max(255, 'Display value must be less than 255 characters')
      .optional(),
    isFilterable: z.boolean().optional(),
    isVisible: z.boolean().optional(),
    displayOrder: z.number().int().min(0).optional(),
  }),
});

const bulkCreateProductAttributeZodSchema = z.object({
  body: z.object({
    productId: z.string({
      required_error: 'Product ID is required',
    }),
    attributes: z.array(
      z.object({
        attributeId: z.string({
          required_error: 'Attribute ID is required',
        }),
        value: z
          .string({
            required_error: 'Value is required',
          })
          .max(255, 'Value must be less than 255 characters'),
        displayValue: z
          .string()
          .max(255, 'Display value must be less than 255 characters')
          .optional(),
        isFilterable: z.boolean().default(false),
        isVisible: z.boolean().default(true),
        displayOrder: z.number().int().min(0).default(0),
      })
    ),
  }),
});

export const ProductAttributeValidation = {
  createProductAttributeZodSchema,
  updateProductAttributeZodSchema,
  bulkCreateProductAttributeZodSchema,
};

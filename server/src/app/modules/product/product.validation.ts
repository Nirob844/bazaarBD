import { ProductStatus } from '@prisma/client';
import { z } from 'zod';

// Define enums since they're not exported from @prisma/client
const ProductType = {
  PHYSICAL: 'PHYSICAL',
  DIGITAL: 'DIGITAL',
  SERVICE: 'SERVICE',
  SUBSCRIPTION: 'SUBSCRIPTION',
} as const;

const TaxClass = {
  STANDARD: 'STANDARD',
  REDUCED: 'REDUCED',
  ZERO: 'ZERO',
  EXEMPT: 'EXEMPT',
} as const;

const createProductVariantZodSchema = z.object({
  name: z.string({
    required_error: 'Variant name is required',
  }),
  sku: z.string({
    required_error: 'SKU is required',
  }),
  basePrice: z
    .number({
      required_error: 'Base price is required',
    })
    .positive('Base price must be positive'),
  salePrice: z.number().positive('Sale price must be positive').optional(),
  costPrice: z.number().positive('Cost price must be positive').optional(),
  taxRate: z.number().min(0).max(100).optional(),
  taxClass: z
    .enum([...Object.values(TaxClass)] as [string, ...string[]])
    .optional(),
  minimumOrder: z.number().int().positive().optional(),
  maximumOrder: z.number().int().positive().optional(),
  stockStatus: z.enum(['IN_STOCK', 'OUT_OF_STOCK', 'BACKORDER']).optional(),
  isBackorder: z.boolean().optional(),
  backorderLimit: z.number().int().positive().optional(),
  weight: z.number().positive().optional(),
  dimensions: z.string().optional(),
  attributes: z.record(z.string()).optional(),
  imageUrl: z.string().url().optional(),
  barcode: z.string().optional(),
  upc: z.string().optional(),
  ean: z.string().optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  isVisible: z.boolean().optional(),
  inventory: z
    .object({
      stock: z.number().int().min(0),
      lowStockThreshold: z.number().int().positive().optional(),
      reorderPoint: z.number().int().positive().optional(),
      reorderQuantity: z.number().int().positive().optional(),
      location: z.string().optional(),
      binNumber: z.string().optional(),
      warehouseId: z.string().optional(),
    })
    .optional(),
});

const createProductAttributeZodSchema = z.object({
  attributeId: z.string({
    required_error: 'Attribute ID is required',
  }),
  value: z.string({
    required_error: 'Attribute value is required',
  }),
  displayValue: z.string().optional(),
  isFilterable: z.boolean().optional(),
  isVisible: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

const createProductInventoryZodSchema = z.object({
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  lowStockThreshold: z.number().int().positive().optional(),
  reorderPoint: z.number().int().positive().optional(),
  reorderQuantity: z.number().int().positive().optional(),
  location: z.string().optional(),
  binNumber: z.string().optional(),
  warehouseId: z.string().optional(),
});

const createProductPromotionZodSchema = z
  .object({
    type: z.enum(['FLASH_SALE', 'SEASONAL', 'CLEARANCE', 'BUNDLE', 'LOYALTY']),
    discountValue: z.number().positive(),
    isPercentage: z.boolean().default(true),
    startDate: z.string().transform(str => new Date(str)),
    endDate: z.string().transform(str => new Date(str)),
    isActive: z.boolean().default(true),
    maxUses: z.number().int().positive().optional(),
    currentUses: z.number().int().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isPercentage && data.discountValue > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Percentage discount cannot exceed 100%',
        path: ['discountValue'],
      });
    }
    if (data.endDate <= data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be after start date',
        path: ['endDate'],
      });
    }
  });

const createProductZodSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Product name is required',
      })
      .min(1, 'Product name cannot be empty'),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    categoryId: z.string({
      required_error: 'Category ID is required',
    }),
    vendorId: z.string({
      required_error: 'Vendor ID is required',
    }),
    shopId: z.string({
      required_error: 'Shop ID is required',
    }),
    type: z.enum([...Object.values(ProductType)] as [string, ...string[]], {
      required_error: 'Product type is required',
    }),
    status: z
      .enum([...Object.values(ProductStatus)] as [string, ...string[]])
      .default('DRAFT'),
    brand: z.string().optional(),
    model: z.string().optional(),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    upc: z.string().optional(),
    ean: z.string().optional(),
    isbn: z.string().optional(),
    weight: z.number().positive().optional(),
    dimensions: z.string().optional(),
    basePrice: z.number().positive().optional(),
    salePrice: z.number().positive().optional(),
    costPrice: z.number().positive().optional(),
    taxRate: z.number().min(0).max(100).optional(),
    taxClass: z
      .enum([...Object.values(TaxClass)] as [string, ...string[]])
      .optional(),
    minimumOrder: z.number().int().positive().optional(),
    maximumOrder: z.number().int().positive().optional(),
    stockStatus: z.enum(['IN_STOCK', 'OUT_OF_STOCK', 'BACKORDER']).optional(),
    isBackorder: z.boolean().optional(),
    backorderLimit: z.number().int().positive().optional(),
    isActive: z.boolean().default(true),
    isVisible: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    isNew: z.boolean().default(false),
    isBestSeller: z.boolean().default(false),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    metaKeywords: z.string().optional(),
    seoDescription: z.string().optional(),
    seoKeywords: z.string().optional(),
    warranty: z.string().optional(),
    warrantyPeriod: z.string().optional(),
    warrantyTerms: z.string().optional(),
    returnPolicy: z.string().optional(),
    shippingPolicy: z.string().optional(),
    inventory: createProductInventoryZodSchema.optional(),
    attributes: z.array(createProductAttributeZodSchema).optional(),
    variants: z.array(createProductVariantZodSchema).optional(),
    tags: z.array(z.string()).optional(),
    images: z.array(z.string().url()).optional(),
    promotions: z.array(createProductPromotionZodSchema).optional(),
  }),
});

const updateProductZodSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Product name cannot be empty').optional(),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    categoryId: z.string().optional(),
    vendorId: z.string().optional(),
    shopId: z.string().optional(),
    type: z
      .enum([...Object.values(ProductType)] as [string, ...string[]])
      .optional(),
    status: z
      .enum([...Object.values(ProductStatus)] as [string, ...string[]])
      .optional(),
    brand: z.string().optional(),
    model: z.string().optional(),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    upc: z.string().optional(),
    ean: z.string().optional(),
    isbn: z.string().optional(),
    weight: z.number().positive().optional(),
    dimensions: z.string().optional(),
    basePrice: z.number().positive().optional(),
    salePrice: z.number().positive().optional(),
    costPrice: z.number().positive().optional(),
    taxRate: z.number().min(0).max(100).optional(),
    taxClass: z
      .enum([...Object.values(TaxClass)] as [string, ...string[]])
      .optional(),
    minimumOrder: z.number().int().positive().optional(),
    maximumOrder: z.number().int().positive().optional(),
    stockStatus: z.enum(['IN_STOCK', 'OUT_OF_STOCK', 'BACKORDER']).optional(),
    isBackorder: z.boolean().optional(),
    backorderLimit: z.number().int().positive().optional(),
    isActive: z.boolean().optional(),
    isVisible: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    isNew: z.boolean().optional(),
    isBestSeller: z.boolean().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    metaKeywords: z.string().optional(),
    seoDescription: z.string().optional(),
    seoKeywords: z.string().optional(),
    warranty: z.string().optional(),
    warrantyPeriod: z.string().optional(),
    warrantyTerms: z.string().optional(),
    returnPolicy: z.string().optional(),
    shippingPolicy: z.string().optional(),
    inventory: createProductInventoryZodSchema.optional(),
    attributes: z.array(createProductAttributeZodSchema).optional(),
    variants: z.array(createProductVariantZodSchema).optional(),
    tags: z.array(z.string()).optional(),
    images: z.array(z.string().url()).optional(),
    promotions: z.array(createProductPromotionZodSchema).optional(),
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

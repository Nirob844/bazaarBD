import { z } from 'zod';

const createCategoryZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Category name is required',
    }),
    description: z.string().optional(),
    parentId: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    metaKeywords: z.string().optional(),
    canonicalUrl: z.string().optional(),
    displayOrder: z.number().optional(),
    isActive: z.boolean().optional(),
    showInMenu: z.boolean().optional(),
    showInFooter: z.boolean().optional(),
    menuPosition: z.string().optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
  }),
});

const updateCategoryZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    parentId: z.string().optional(),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    metaKeywords: z.string().optional(),
    canonicalUrl: z.string().optional(),
    displayOrder: z.number().optional(),
    isActive: z.boolean().optional(),
    showInMenu: z.boolean().optional(),
    showInFooter: z.boolean().optional(),
    menuPosition: z.string().optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
  }),
});

const deleteCategoryZodSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Category ID is required',
    }),
  }),
});

// Bulk operations validation
const bulkCreateCategoryZodSchema = z.object({
  body: z.object({
    categories: z.array(
      z.object({
        name: z.string({
          required_error: 'Category name is required',
        }),
        description: z.string().optional(),
        parentId: z.string().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        canonicalUrl: z.string().optional(),
        displayOrder: z.number().optional(),
        isActive: z.boolean().optional(),
        showInMenu: z.boolean().optional(),
        showInFooter: z.boolean().optional(),
        menuPosition: z.string().optional(),
        icon: z.string().optional(),
        color: z.string().optional(),
      })
    ),
  }),
});

const bulkUpdateCategoryZodSchema = z.object({
  body: z.object({
    categories: z.array(
      z.object({
        id: z.string({
          required_error: 'Category ID is required',
        }),
        name: z.string().optional(),
        description: z.string().optional(),
        parentId: z.string().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        metaKeywords: z.string().optional(),
        canonicalUrl: z.string().optional(),
        displayOrder: z.number().optional(),
        isActive: z.boolean().optional(),
        showInMenu: z.boolean().optional(),
        showInFooter: z.boolean().optional(),
        menuPosition: z.string().optional(),
        icon: z.string().optional(),
        color: z.string().optional(),
      })
    ),
  }),
});

const bulkDeleteCategoryZodSchema = z.object({
  body: z.object({
    ids: z.array(
      z.string({
        required_error: 'Category ID is required',
      })
    ),
  }),
});

// Status management validation
const updateStatusZodSchema = z.object({
  body: z.object({
    isActive: z.boolean({
      required_error: 'Status is required',
    }),
  }),
});

const updateOrderZodSchema = z.object({
  body: z.object({
    displayOrder: z.number({
      required_error: 'Display order is required',
    }),
  }),
});

// Menu management validation
const updateMenuVisibilityZodSchema = z.object({
  body: z.object({
    showInMenu: z.boolean({
      required_error: 'Menu visibility status is required',
    }),
    showInFooter: z.boolean().optional(),
  }),
});

const updateMenuPositionZodSchema = z.object({
  body: z.object({
    menuPosition: z.string({
      required_error: 'Menu position is required',
    }),
  }),
});

export const CategoryValidation = {
  create: createCategoryZodSchema,
  update: updateCategoryZodSchema,
  delete: deleteCategoryZodSchema,
  bulkCreate: bulkCreateCategoryZodSchema,
  bulkUpdate: bulkUpdateCategoryZodSchema,
  bulkDelete: bulkDeleteCategoryZodSchema,
  updateStatus: updateStatusZodSchema,
  updateOrder: updateOrderZodSchema,
  updateMenuVisibility: updateMenuVisibilityZodSchema,
  updateMenuPosition: updateMenuPositionZodSchema,
};

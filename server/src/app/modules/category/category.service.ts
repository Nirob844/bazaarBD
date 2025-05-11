import { Category, Prisma } from '@prisma/client';
import { Request } from 'express';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IUploadFile } from '../../../interfaces/file';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';

const insertIntoDB = async (req: Request): Promise<Category> => {
  const file = req.file as IUploadFile;
  const data = req.body;

  // Validate required fields
  if (!data.name) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Category name is required');
  }

  // Generate slug from name
  data.slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Check if category with same name or slug exists
  const existingCategory = await prisma.category.findFirst({
    where: {
      OR: [{ name: data.name }, { slug: data.slug }],
    },
  });

  if (existingCategory) {
    throw new ApiError(
      httpStatus.CONFLICT,
      'Category with this name or slug already exists'
    );
  }

  // Handle parent category if provided
  if (data.parentId) {
    const parentCategory = await prisma.category.findUnique({
      where: { id: data.parentId },
      select: { level: true, path: true, breadcrumb: true },
    });

    if (!parentCategory) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Parent category not found');
    }

    // Set level and path
    data.level = parentCategory.level + 1;
    data.path = [...parentCategory.path, data.parentId];
    data.breadcrumb = [...parentCategory.breadcrumb, data.name];
  } else {
    // Root category
    data.level = 0;
    data.path = [];
    data.breadcrumb = [data.name];
  }

  // Handle image upload
  if (file) {
    const uploadImage = await FileUploadHelper.uploadToCloudinary(file);
    data.imageUrl = uploadImage?.secure_url;
  }

  const result = await prisma.category.create({
    data,
    include: {
      parent: true,
      children: true,
    },
  });

  return result;
};

const getAllFromDB = async (
  filters: { searchTerm?: string; isActive?: boolean },
  options: IPaginationOptions
): Promise<IGenericResponse<Category[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, isActive } = filters;

  const andConditions: Prisma.CategoryWhereInput[] = [];

  // Handle search term
  if (searchTerm) {
    andConditions.push({
      OR: [
        {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          slug: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ],
    });
  }

  // Handle active status filter
  if (typeof isActive === 'boolean') {
    andConditions.push({
      isActive,
    });
  }

  const whereConditions: Prisma.CategoryWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.category.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: [{ level: 'asc' }, { displayOrder: 'asc' }, { name: 'asc' }],
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      children: {
        select: {
          id: true,
          name: true,
          slug: true,
          level: true,
        },
      },
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  const total = await prisma.category.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getDataById = async (id: string): Promise<Category | null> => {
  const result = await prisma.category.findUnique({
    where: { id },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
          level: true,
        },
      },
      children: {
        select: {
          id: true,
          name: true,
          slug: true,
          level: true,
          imageUrl: true,
          isActive: true,
        },
      },
      products: {
        where: {
          status: 'PUBLISHED',
          deletionStatus: 'ACTIVE',
        },
        select: {
          id: true,
          name: true,
          slug: true,
          basePrice: true,
          salePrice: true,
          images: true,
          stockStatus: true,
        },
        take: 10,
      },
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }

  return result;
};

const updateOneInDB = async (req: Request): Promise<Category> => {
  const { id } = req.params;
  const file = req.file as IUploadFile;
  const data = req.body;

  // Check if category exists
  const existingCategory = await prisma.category.findUnique({
    where: { id },
    include: {
      children: true,
    },
  });

  if (!existingCategory) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }

  // If updating name, update slug
  if (data.name) {
    data.slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if new slug is already in use
    const slugExists = await prisma.category.findFirst({
      where: {
        slug: data.slug,
        id: { not: id },
      },
    });

    if (slugExists) {
      throw new ApiError(
        httpStatus.CONFLICT,
        'Category name is too similar to an existing category'
      );
    }
  }

  // Handle parent category change
  if (data.parentId && data.parentId !== existingCategory.parentId) {
    const newParent = await prisma.category.findUnique({
      where: { id: data.parentId },
      select: { level: true, path: true, breadcrumb: true },
    });

    if (!newParent) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Parent category not found');
    }

    // Prevent circular reference
    if (newParent.path.includes(id)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Cannot set a child category as parent'
      );
    }

    // Update level and path
    data.level = newParent.level + 1;
    data.path = [...newParent.path, data.parentId];
    data.breadcrumb = [
      ...newParent.breadcrumb,
      data.name || existingCategory.name,
    ];

    // Update children's paths and levels
    const updateChildren = async (
      categoryId: string,
      newPath: string[],
      newLevel: number
    ) => {
      const children = await prisma.category.findMany({
        where: { parentId: categoryId },
      });

      for (const child of children) {
        await prisma.category.update({
          where: { id: child.id },
          data: {
            level: newLevel + 1,
            path: [...newPath, categoryId],
            breadcrumb: [...data.breadcrumb, child.name],
          },
        });
        await updateChildren(child.id, [...newPath, categoryId], newLevel + 1);
      }
    };

    await updateChildren(id, data.path, data.level);
  }

  // Handle image upload
  if (file) {
    const uploadImage = await FileUploadHelper.uploadToCloudinary(file);
    data.imageUrl = uploadImage?.secure_url;
  }

  const result = await prisma.category.update({
    where: { id },
    data,
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      children: {
        select: {
          id: true,
          name: true,
          slug: true,
          level: true,
        },
      },
    },
  });

  return result;
};

const deleteByIdFromDB = async (id: string): Promise<Category> => {
  // Check if category exists and has children
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      children: true,
      products: {
        where: {
          status: 'PUBLISHED',
          deletionStatus: 'ACTIVE',
        },
      },
    },
  });

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }

  if (category.children.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cannot delete category with subcategories'
    );
  }

  if (category.products.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cannot delete category with active products'
    );
  }

  const result = await prisma.category.delete({
    where: { id },
  });

  return result;
};

// Get category tree
const getCategoryTree = async (): Promise<Category[]> => {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    orderBy: [{ level: 'asc' }, { displayOrder: 'asc' }, { name: 'asc' }],
    include: {
      children: {
        where: {
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          level: true,
          imageUrl: true,
          isActive: true,
          children: {
            where: {
              isActive: true,
            },
            select: {
              id: true,
              name: true,
              slug: true,
              level: true,
              imageUrl: true,
              isActive: true,
            },
          },
        },
      },
    },
  });

  // Filter only root categories (level 0)
  return categories.filter(category => category.level === 0);
};

// Get menu categories
const getMenuCategories = async (): Promise<Partial<Category>[]> => {
  return prisma.category.findMany({
    where: {
      isActive: true,
      showInMenu: true,
    },
    orderBy: [
      { menuPosition: 'asc' },
      { displayOrder: 'asc' },
      { name: 'asc' },
    ],
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      icon: true,
      color: true,
      children: {
        where: {
          isActive: true,
          showInMenu: true,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
          icon: true,
          color: true,
        },
      },
    },
  });
};

// Get category by slug
const getBySlug = async (slug: string): Promise<Category | null> => {
  const result = await prisma.category.findUnique({
    where: { slug },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          slug: true,
          level: true,
        },
      },
      children: {
        where: {
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          level: true,
          imageUrl: true,
          isActive: true,
        },
      },
      products: {
        where: {
          status: 'PUBLISHED',
          deletionStatus: 'ACTIVE',
        },
        select: {
          id: true,
          name: true,
          slug: true,
          basePrice: true,
          salePrice: true,
          images: true,
          stockStatus: true,
        },
        take: 10,
      },
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }

  return result;
};

// Bulk create categories
const bulkCreate = async (req: Request): Promise<Category[]> => {
  const files = req.files as IUploadFile[];
  const { categories } = req.body;

  const results = await Promise.all(
    categories.map(async (category: any, index: number) => {
      // Generate slug
      category.slug = category.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check for existing category
      const existingCategory = await prisma.category.findFirst({
        where: {
          OR: [{ name: category.name }, { slug: category.slug }],
        },
      });

      if (existingCategory) {
        throw new ApiError(
          httpStatus.CONFLICT,
          `Category "${category.name}" already exists`
        );
      }

      // Handle parent category
      if (category.parentId) {
        const parentCategory = await prisma.category.findUnique({
          where: { id: category.parentId },
          select: { level: true, path: true, breadcrumb: true },
        });

        if (!parentCategory) {
          throw new ApiError(
            httpStatus.NOT_FOUND,
            `Parent category not found for "${category.name}"`
          );
        }

        category.level = parentCategory.level + 1;
        category.path = [...parentCategory.path, category.parentId];
        category.breadcrumb = [...parentCategory.breadcrumb, category.name];
      } else {
        category.level = 0;
        category.path = [];
        category.breadcrumb = [category.name];
      }

      // Handle image upload
      if (files && files[index]) {
        const uploadImage = await FileUploadHelper.uploadToCloudinary(
          files[index]
        );
        category.imageUrl = uploadImage?.secure_url;
      }

      return prisma.category.create({
        data: category,
        include: {
          parent: true,
          children: true,
        },
      });
    })
  );

  return results;
};

// Bulk update categories
const bulkUpdate = async (req: Request): Promise<Category[]> => {
  const { categories } = req.body;

  const results = await Promise.all(
    categories.map(async (category: any) => {
      const existingCategory = await prisma.category.findUnique({
        where: { id: category.id },
      });

      if (!existingCategory) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          `Category with ID ${category.id} not found`
        );
      }

      // Handle name/slug update
      if (category.name) {
        category.slug = category.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        const slugExists = await prisma.category.findFirst({
          where: {
            slug: category.slug,
            id: { not: category.id },
          },
        });

        if (slugExists) {
          throw new ApiError(
            httpStatus.CONFLICT,
            `Category name "${category.name}" is too similar to an existing category`
          );
        }
      }

      // Handle parent category change
      if (
        category.parentId &&
        category.parentId !== existingCategory.parentId
      ) {
        const newParent = await prisma.category.findUnique({
          where: { id: category.parentId },
          select: { level: true, path: true, breadcrumb: true },
        });

        if (!newParent) {
          throw new ApiError(
            httpStatus.NOT_FOUND,
            `Parent category not found for "${
              category.name || existingCategory.name
            }"`
          );
        }

        if (newParent.path.includes(category.id)) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            `Cannot set a child category as parent for "${
              category.name || existingCategory.name
            }"`
          );
        }

        category.level = newParent.level + 1;
        category.path = [...newParent.path, category.parentId];
        category.breadcrumb = [
          ...newParent.breadcrumb,
          category.name || existingCategory.name,
        ];

        // Update children's paths and levels
        await updateChildrenPaths(category.id, category.path, category.level);
      }

      return prisma.category.update({
        where: { id: category.id },
        data: category,
        include: {
          parent: true,
          children: true,
        },
      });
    })
  );

  return results;
};

// Helper function to update children paths
const updateChildrenPaths = async (
  categoryId: string,
  newPath: string[],
  newLevel: number
): Promise<void> => {
  const children = await prisma.category.findMany({
    where: { parentId: categoryId },
    select: { id: true, name: true },
  });

  for (const child of children) {
    await prisma.category.update({
      where: { id: child.id },
      data: {
        level: newLevel + 1,
        path: [...newPath, categoryId],
        breadcrumb: [...newPath.map(() => child.name), child.name],
      },
    });
    await updateChildrenPaths(child.id, [...newPath, categoryId], newLevel + 1);
  }
};

// Bulk delete categories
const bulkDelete = async (req: Request): Promise<Category[]> => {
  const { ids } = req.body;

  const categories = await prisma.category.findMany({
    where: { id: { in: ids } },
    include: {
      children: true,
      products: {
        where: {
          status: 'PUBLISHED',
          deletionStatus: 'ACTIVE',
        },
      },
    },
  });

  // Validate categories can be deleted
  for (const category of categories) {
    if (category.children.length > 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Cannot delete category "${category.name}" with subcategories`
      );
    }
    if (category.products.length > 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Cannot delete category "${category.name}" with active products`
      );
    }
  }
  const results = await Promise.all(
    ids.map((id: string) =>
      prisma.category.delete({
        where: { id },
      })
    )
  );

  return results;
};

// Update category status
const updateStatus = async (
  id: string,
  isActive: boolean
): Promise<Category> => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }

  return prisma.category.update({
    where: { id },
    data: { isActive },
  });
};

// Update category order
const updateOrder = async (
  id: string,
  displayOrder: number
): Promise<Category> => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }

  return prisma.category.update({
    where: { id },
    data: { displayOrder },
  });
};

// Update menu visibility
const updateMenuVisibility = async (
  id: string,
  data: { showInMenu: boolean; showInFooter?: boolean }
): Promise<Category> => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }

  return prisma.category.update({
    where: { id },
    data,
  });
};

// Update menu position
const updateMenuPosition = async (
  id: string,
  menuPosition: string
): Promise<Category> => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  }

  return prisma.category.update({
    where: { id },
    data: { menuPosition },
  });
};

export const CategoryService = {
  insertIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
  getCategoryTree,
  getMenuCategories,
  getBySlug,
  bulkCreate,
  bulkUpdate,
  bulkDelete,
  updateStatus,
  updateOrder,
  updateMenuVisibility,
  updateMenuPosition,
};

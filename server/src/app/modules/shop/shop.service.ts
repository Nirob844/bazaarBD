import { Prisma, Shop } from '@prisma/client';
import { Request } from 'express';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IUploadFilesMap } from '../../../interfaces/file';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { SHOP_CONSTANTS, shopFilterAbleFields } from './shop.constants';
import { IShopFilterRequest } from './shop.interface';

const insertIntoDB = async (req: Request): Promise<Shop> => {
  const files = req.files as IUploadFilesMap;

  const data = req.body;

  // Validate required fields
  if (!data.name || !data.address || !data.contactEmail || !data.contactPhone) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Missing required fields: name, address, contactEmail, contactPhone'
    );
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.contactEmail)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid email format');
  }

  // Validate phone format (basic validation)
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  if (!phoneRegex.test(data.contactPhone)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid phone number format');
  }

  // Handle banner upload
  if (files?.banner?.[0]) {
    const bannerUpload = await FileUploadHelper.uploadToCloudinary(
      files.banner[0]
    );
    data.banner = bannerUpload?.secure_url;
  }

  // Handle logo upload
  if (files?.logo?.[0]) {
    const logoUpload = await FileUploadHelper.uploadToCloudinary(files.logo[0]);
    data.logo = logoUpload?.secure_url;
  }

  // Generate slug from name
  data.slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Check if shop with same name or slug exists
  const existingShop = await prisma.shop.findFirst({
    where: {
      OR: [
        { name: data.name },
        { slug: data.slug },
        { contactEmail: data.contactEmail },
      ],
    },
  });

  if (existingShop) {
    throw new ApiError(
      httpStatus.CONFLICT,
      'Shop with this name, slug, or email already exists'
    );
  }

  const result = await prisma.shop.create({
    data,
    include: {
      vendor: true,
    },
  });
  console.log('shop create result', result);
  return result;
};

const getAllFromDB = async (
  filters: IShopFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Shop[]>> => {
  try {
    const { limit, page, skip } =
      paginationHelpers.calculatePagination(options);
    const { searchTerm, ...filterData } = filters;

    const andConditions: Prisma.ShopWhereInput[] = [
      {
        deletionStatus: SHOP_CONSTANTS.DELETION_STATUS.ACTIVE,
      },
    ];

    // Handle search term
    if (searchTerm) {
      andConditions.push({
        OR: [
          // Search in shop fields
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
            address: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            contactEmail: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            contactPhone: {
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
          // Search in vendor fields
          {
            vendor: {
              OR: [
                {
                  businessName: {
                    contains: searchTerm,
                    mode: 'insensitive',
                  },
                },
                {
                  businessEmail: {
                    contains: searchTerm,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          },
        ],
      });
    }

    // Handle filters
    if (Object.keys(filterData).length > 0) {
      andConditions.push({
        AND: Object.keys(filterData).map(key => {
          if (shopFilterAbleFields.includes(key)) {
            // Handle date range filters
            if (key === 'createdAt' || key === 'updatedAt') {
              const [startDate, endDate] = (filterData as any)[key].split(',');
              return {
                [key]: {
                  gte: startDate ? new Date(startDate) : undefined,
                  lte: endDate ? new Date(endDate) : undefined,
                },
              };
            }
            // Handle boolean filters
            if (key === 'isActive') {
              return {
                [key]: (filterData as any)[key] === 'true',
              };
            }
            // Handle vendor relation
            if (key === 'vendorId') {
              return {
                vendor: {
                  id: (filterData as any)[key],
                },
              };
            }
            // Handle other filters
            return {
              [key]: {
                equals: (filterData as any)[key],
              },
            };
          }
          return {};
        }),
      });
    }

    const whereConditions: Prisma.ShopWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.shop.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy:
        options.sortBy && options.sortOrder
          ? { [options.sortBy]: options.sortOrder }
          : {
              createdAt: 'desc',
            },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            businessEmail: true,
            businessPhone: true,
            isVerified: true,
          },
        },
        analytics: {
          select: {
            totalSales: true,
            totalProducts: true,
            totalOrders: true,
            visitorCount: true,
          },
        },
      },
    });

    const total = await prisma.shop.count({
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
  } catch (error) {
    console.error('Shop fetch error:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to fetch shops'
    );
  }
};

const getDataById = async (id: string): Promise<Shop | null> => {
  try {
    const result = await prisma.shop.findUnique({
      where: {
        id,
      },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            businessEmail: true,
            businessPhone: true,
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
            basePrice: true,
            salePrice: true,
            stockStatus: true,
            images: true,
          },
        },
        analytics: true,
      },
    });

    if (!result) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Shop not found');
    }

    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to fetch shop details'
    );
  }
};

const updateOneInDB = async (
  id: string,
  payload: Partial<Shop>
): Promise<Shop> => {
  try {
    // Check if shop exists
    const existingShop = await prisma.shop.findUnique({
      where: { id },
    });

    if (!existingShop) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Shop not found');
    }

    // If updating email, validate format
    if (payload.contactEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payload.contactEmail)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid email format');
      }

      // Check if email is already in use
      const emailExists = await prisma.shop.findFirst({
        where: {
          contactEmail: payload.contactEmail,
          id: { not: id },
        },
      });

      if (emailExists) {
        throw new ApiError(
          httpStatus.CONFLICT,
          'Email is already in use by another shop'
        );
      }
    }

    // If updating phone, validate format
    if (payload.contactPhone) {
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(payload.contactPhone)) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Invalid phone number format'
        );
      }
    }

    // If updating name, update slug
    if (payload.name) {
      payload.slug = payload.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check if slug is already in use
      const slugExists = await prisma.shop.findFirst({
        where: {
          slug: payload.slug,
          id: { not: id },
        },
      });

      if (slugExists) {
        throw new ApiError(
          httpStatus.CONFLICT,
          'Shop name is too similar to an existing shop'
        );
      }
    }

    const result = await prisma.shop.update({
      where: {
        id,
      },
      data: payload,
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            businessEmail: true,
            businessPhone: true,
          },
        },
      },
    });

    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to update shop'
    );
  }
};

const deleteByIdFromDB = async (id: string): Promise<Shop> => {
  try {
    // Check if shop exists
    const existingShop = await prisma.shop.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!existingShop) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Shop not found');
    }

    // Check if shop has active products
    if (existingShop.products.length > 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Cannot delete shop with active products'
      );
    }

    const result = await prisma.shop.delete({
      where: {
        id,
      },
    });

    return result;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to delete shop'
    );
  }
};

const getShopProducts = async (shopId: string, options: IPaginationOptions) => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  const result = await prisma.product.findMany({
    where: {
      shopId,
      status: 'PUBLISHED',
      deletionStatus: 'ACTIVE',
    },
    skip,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      name: true,
      slug: true,
      basePrice: true,
      salePrice: true,
      stockStatus: true,
      images: true,
      averageRating: true,
      ratingCount: true,
    },
  });

  const total = await prisma.product.count({
    where: {
      shopId,
      status: 'PUBLISHED',
      deletionStatus: 'ACTIVE',
    },
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

const getFeaturedShops = async () => {
  const result = await prisma.shop.findMany({
    where: {
      isActive: true,
      deletionStatus: 'ACTIVE',
    },
    take: 10,
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      banner: true,
      address: true,
      analytics: {
        select: {
          totalSales: true,
          totalProducts: true,
          totalOrders: true,
          visitorCount: true,
        },
      },
    },
  });

  return result;
};

const getShopAnalytics = async (shopId: string) => {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: {
      id: true,
      name: true,
      analytics: {
        select: {
          totalSales: true,
          totalProducts: true,
          totalOrders: true,
          visitorCount: true,
        },
      },
    },
  });

  if (!shop) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shop not found');
  }

  return shop;
};

const getVendorDashboard = async (vendorId: string) => {
  const shop = await prisma.shop.findFirst({
    where: { vendorId },
    select: {
      id: true,
      name: true,
      analytics: {
        select: {
          totalSales: true,
          totalProducts: true,
          totalOrders: true,
          visitorCount: true,
        },
      },
      products: {
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          name: true,
          basePrice: true,
          salePrice: true,
          stockStatus: true,
          images: true,
        },
      },
    },
  });

  if (!shop) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shop not found');
  }

  return shop;
};

const updateShopStatus = async (shopId: string, isActive: boolean) => {
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
  });

  if (!shop) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shop not found');
  }

  const result = await prisma.shop.update({
    where: { id: shopId },
    data: { isActive },
    select: {
      id: true,
      name: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return result;
};

const getVendorStats = async (vendorId: string) => {
  const shop = await prisma.shop.findFirst({
    where: { vendorId },
    select: {
      id: true,
      name: true,
      analytics: {
        select: {
          totalSales: true,
          totalProducts: true,
          totalOrders: true,
          visitorCount: true,
        },
      },
      products: {
        select: {
          id: true,
          name: true,
          basePrice: true,
          salePrice: true,
          stockStatus: true,
          averageRating: true,
          ratingCount: true,
        },
      },
    },
  });

  if (!shop) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shop not found');
  }

  return shop;
};

const getShopTimeStats = async (
  shopId: string,
  period: 'daily' | 'weekly' | 'monthly'
) => {
  // Get shop details
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: {
      id: true,
      name: true,
      analytics: {
        select: {
          totalSales: true,
          totalOrders: true,
          visitorCount: true,
        },
      },
    },
  });

  if (!shop) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shop not found');
  }

  // Calculate time range
  const now = new Date();
  let startDate: Date;
  const endDate = new Date();

  switch (period) {
    case 'daily':
      startDate = new Date(now.setDate(now.getDate() - 1));
      break;
    case 'weekly':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'monthly':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    default:
      startDate = new Date(now.setDate(now.getDate() - 1));
  }

  // Get orders within the period
  const orders = await prisma.order.findMany({
    where: {
      items: {
        some: {
          product: {
            shopId: shopId,
          },
        },
      },
      placedAt: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        not: 'CANCELLED',
      },
    },
    select: {
      id: true,
      total: true,
      status: true,
      placedAt: true,
      items: {
        select: {
          quantity: true,
          product: {
            select: {
              name: true,
              images: true,
              basePrice: true,
            },
          },
        },
      },
    },
    orderBy: {
      placedAt: 'desc',
    },
  });

  // Calculate statistics
  const stats = {
    period,
    timeRange: {
      start: startDate,
      end: endDate,
    },
    totalSales: orders.reduce((sum, order) => sum + Number(order.total), 0),
    totalOrders: orders.length,
    completedOrders: orders.filter(order => order.status === 'COMPLETED')
      .length,
    cancelledOrders: orders.filter(order => order.status === 'CANCELLED')
      .length,
    averageOrderValue:
      orders.length > 0
        ? orders.reduce((sum, order) => sum + Number(order.total), 0) /
          orders.length
        : 0,
    topSellingProducts: Object.values(
      orders
        .flatMap(order => order.items)
        .reduce((acc, item) => {
          const key = item.product.name;
          if (!acc[key]) {
            acc[key] = {
              name: item.product.name,
              image: item.product.images[0]?.url || '',
              quantity: 0,
              revenue: 0,
            };
          }
          acc[key].quantity += item.quantity;
          acc[key].revenue += item.quantity * Number(item.product.basePrice);
          return acc;
        }, {} as Record<string, { name: string; image: string; quantity: number; revenue: number }>)
    )
      .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
      .slice(0, 5),
  };

  return {
    shop,
    stats,
  };
};

const updateShopVerification = async (shopId: string, isVerified: boolean) => {
  // Get shop with vendor details
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    include: {
      vendor: true,
    },
  });

  if (!shop) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shop not found');
  }

  // Update vendor verification status
  const result = await prisma.vendor.update({
    where: { id: shop.vendorId },
    data: {
      isVerified,
      verificationDocuments: {
        status: isVerified ? 'VERIFIED' : 'UNVERIFIED',
        verifiedAt: isVerified ? new Date() : null,
        verifiedBy: isVerified ? 'ADMIN' : null,
        notes: isVerified
          ? 'Verified by admin'
          : 'Verification revoked by admin',
      },
    },
    select: {
      id: true,
      businessName: true,
      isVerified: true,
      verificationDocuments: true,
      updatedAt: true,
    },
  });

  // If verification is revoked, update shop status
  if (!isVerified) {
    await prisma.shop.update({
      where: { id: shopId },
      data: {
        isActive: false,
      },
    });
  }

  return result;
};

const getShopReviews = async (shopId: string, options: IPaginationOptions) => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  // Get shop reviews with customer and product details
  const result = await prisma.review.findMany({
    where: {
      product: {
        shopId: shopId,
      },
      isApproved: true,
    },
    skip,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      rating: true,
      title: true,
      comment: true,
      createdAt: true,
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          images: true,
          basePrice: true,
          salePrice: true,
        },
      },
    },
  });

  // Get total count for pagination
  const total = await prisma.review.count({
    where: {
      product: {
        shopId: shopId,
      },
      isApproved: true,
    },
  });

  // Calculate average rating
  const averageRating = await prisma.review.aggregate({
    where: {
      product: {
        shopId: shopId,
      },
      isApproved: true,
    },
    _avg: {
      rating: true,
    },
  });

  return {
    meta: {
      total,
      page,
      limit,
      averageRating: averageRating._avg?.rating || 0,
    },
    data: result,
  };
};

export const ShopService = {
  insertIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
  getShopProducts,
  getFeaturedShops,
  getShopAnalytics,
  getVendorDashboard,
  updateShopStatus,
  getVendorStats,
  getShopTimeStats,
  updateShopVerification,
  getShopReviews,
};

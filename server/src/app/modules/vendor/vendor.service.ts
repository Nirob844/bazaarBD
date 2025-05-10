import { Prisma, Vendor } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import {
  VENDOR_CONSTANTS,
  vendorFilterableFields,
  vendorProfileFields,
} from './vendor.constants';
import { IVendorFilterRequest } from './vendor.interface';
import { validateBankAccount } from './vendor.validation';

const createVendor = async (
  data: Prisma.VendorCreateInput
): Promise<Vendor> => {
  const result = await prisma.vendor.create({
    data,
  });
  return result;
};

const getAllVendors = async (
  filters: IVendorFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Vendor[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.VendorWhereInput[] = [
    {
      user: {
        deletionStatus: VENDOR_CONSTANTS.DELETION_STATUS.ACTIVE,
      },
    },
  ];

  if (searchTerm) {
    andConditions.push({
      OR: [
        // Search in vendor fields
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
        {
          businessPhone: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          taxId: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        // Search in user fields
        {
          user: {
            email: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        },
      ],
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map(key => {
        if (vendorFilterableFields.includes(key)) {
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
          if (key === 'isVerified') {
            return {
              [key]: (filterData as any)[key] === 'true',
            };
          }
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

  const whereConditions: Prisma.VendorWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.vendor.findMany({
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
      shops: {
        where: {
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          analytics: true,
        },
      },
      user: {
        select: vendorProfileFields.user,
      },
    },
  });

  const total = await prisma.vendor.count({
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

const getSingleVendor = async (id: string): Promise<Vendor | null> => {
  const result = await prisma.vendor.findUnique({
    where: {
      id,
    },
  });
  return result;
};

const updateVendor = async (
  id: string,
  payload: Omit<
    Prisma.VendorUpdateInput,
    'userId' | 'id' | 'createdAt' | 'updatedAt' | 'deletionStatus' | 'deletedAt'
  >
): Promise<Vendor> => {
  const result = await prisma.vendor.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

const deleteVendor = async (id: string): Promise<Vendor> => {
  const result = await prisma.vendor.delete({
    where: {
      id,
    },
  });
  return result;
};

const getVendorProfile = async (userId: string): Promise<Vendor | null> => {
  const result = await prisma.vendor.findFirst({
    where: {
      userId,
      deletionStatus: 'ACTIVE',
    },
    include: {
      shops: {
        where: {
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          analytics: true,
        },
      },
      bankAccounts: {
        where: {
          isVerified: true,
        },
      },
    },
  });

  return result;
};

const getFeaturedVendors = async (): Promise<Vendor[]> => {
  const result = await prisma.vendor.findMany({
    where: {
      isVerified: true,
      deletionStatus: 'ACTIVE',
    },
    take: 10,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      shops: {
        where: {
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          analytics: true,
        },
      },
    },
  });

  return result;
};

const getPublicVendorProfile = async (id: string): Promise<Vendor | null> => {
  const result = await prisma.vendor.findUnique({
    where: {
      id,
      deletionStatus: 'ACTIVE',
    },
    include: {
      shops: {
        where: {
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          analytics: true,
        },
      },
    },
  });
  return result;
};

const verifyVendor = async (id: string): Promise<Vendor> => {
  const result = await prisma.vendor.update({
    where: {
      id,
    },
    data: {
      isVerified: true,
    },
  });
  return result;
};

const getVendorsAnalytics = async () => {
  const totalVendors = await prisma.vendor.count({
    where: {
      deletionStatus: 'ACTIVE',
    },
  });

  const verifiedVendors = await prisma.vendor.count({
    where: {
      isVerified: true,
      deletionStatus: 'ACTIVE',
    },
  });

  const totalShops = await prisma.shop.count({
    where: {
      vendor: {
        deletionStatus: 'ACTIVE',
      },
    },
  });

  const activeShops = await prisma.shop.count({
    where: {
      isActive: true,
      vendor: {
        deletionStatus: 'ACTIVE',
      },
    },
  });

  return {
    totalVendors,
    verifiedVendors,
    totalShops,
    activeShops,
  };
};

const getVendorAnalytics = async (userId: string) => {
  const vendor = await prisma.vendor.findFirst({
    where: {
      userId,
      deletionStatus: 'ACTIVE',
    },
    include: {
      shops: {
        where: {
          isActive: true,
        },
        select: {
          analytics: true,
        },
      },
    },
  });

  if (!vendor) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found');
  }

  const analytics = vendor.shops.reduce(
    (acc, shop) => {
      if (shop.analytics) {
        acc.totalSales =
          Number(acc.totalSales) + Number(shop.analytics.totalSales);
        acc.totalOrders =
          Number(acc.totalOrders) + Number(shop.analytics.totalOrders);
        acc.totalProducts =
          Number(acc.totalProducts) + Number(shop.analytics.totalProducts);
        acc.visitorCount =
          Number(acc.visitorCount) + Number(shop.analytics.visitorCount);
      }
      return acc;
    },
    {
      totalSales: 0,
      totalOrders: 0,
      totalProducts: 0,
      visitorCount: 0,
    }
  );

  return {
    vendorId: vendor.id,
    businessName: vendor.businessName,
    ...analytics,
  };
};

const getVendorStats = async (userId: string) => {
  const vendor = await prisma.vendor.findFirst({
    where: {
      userId,
      deletionStatus: 'ACTIVE',
    },
    include: {
      shops: {
        where: {
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          analytics: true,
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
      },
    },
  });

  if (!vendor) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found');
  }

  return {
    vendorId: vendor.id,
    businessName: vendor.businessName,
    shops: vendor.shops.map(shop => ({
      id: shop.id,
      name: shop.name,
      analytics: shop.analytics,
      products: shop.products,
    })),
  };
};

const updateVendorProfile = async (
  userId: string,
  payload: Omit<
    Prisma.VendorUpdateInput,
    'userId' | 'id' | 'createdAt' | 'updatedAt' | 'deletionStatus' | 'deletedAt'
  >
): Promise<Vendor> => {
  const vendor = await prisma.vendor.findFirst({
    where: {
      userId,
      deletionStatus: 'ACTIVE',
    },
  });

  if (!vendor) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found');
  }

  const result = await prisma.vendor.update({
    where: {
      id: vendor.id,
    },
    data: payload,
  });

  return result;
};

const getVendorBankAccounts = async (userId: string) => {
  const vendor = await prisma.vendor.findFirst({
    where: {
      userId,
      deletionStatus: 'ACTIVE',
    },
    include: {
      bankAccounts: true,
    },
  });

  if (!vendor) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found');
  }

  return vendor.bankAccounts;
};

const addBankAccount = async (
  userId: string,
  data: Prisma.BankAccountCreateInput
) => {
  // Validate bank account data
  const validatedData = validateBankAccount(
    data as Prisma.BankAccountCreateInput
  );

  const vendor = await prisma.vendor.findFirst({
    where: {
      userId,
      deletionStatus: 'ACTIVE',
    },
  });

  if (!vendor) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found');
  }

  // Check if account number already exists
  const existingAccount = await prisma.bankAccount.findFirst({
    where: {
      accountNumber: validatedData.accountNumber,
      vendorId: vendor.id,
    },
  });

  if (existingAccount) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Bank account already exists');
  }

  const result = await prisma.bankAccount.create({
    data: {
      ...validatedData,
      vendorId: vendor.id,
    },
  });

  return result;
};

const updateBankAccount = async (
  userId: string,
  accountId: string,
  data: Prisma.BankAccountUpdateInput
) => {
  // Validate bank account data
  const validatedData = validateBankAccount(
    data as Prisma.BankAccountCreateInput
  );

  const vendor = await prisma.vendor.findFirst({
    where: {
      userId,
      deletionStatus: 'ACTIVE',
    },
  });

  if (!vendor) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found');
  }

  // Check if account exists and belongs to vendor
  const existingAccount = await prisma.bankAccount.findFirst({
    where: {
      id: accountId,
      vendorId: vendor.id,
    },
  });

  if (!existingAccount) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Bank account not found');
  }

  const result = await prisma.bankAccount.update({
    where: {
      id: accountId,
      vendorId: vendor.id,
    },
    data: validatedData,
  });

  return result;
};

const deleteBankAccount = async (userId: string, accountId: string) => {
  const vendor = await prisma.vendor.findFirst({
    where: {
      userId,
      deletionStatus: 'ACTIVE',
    },
  });

  if (!vendor) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Vendor not found');
  }

  // Check if account exists and belongs to vendor
  const existingAccount = await prisma.bankAccount.findFirst({
    where: {
      id: accountId,
      vendorId: vendor.id,
    },
  });

  if (!existingAccount) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Bank account not found');
  }

  const result = await prisma.bankAccount.delete({
    where: {
      id: accountId,
      vendorId: vendor.id,
    },
  });

  return result;
};

export const VendorService = {
  createVendor,
  getAllVendors,
  getSingleVendor,
  updateVendor,
  deleteVendor,
  getVendorProfile,
  getFeaturedVendors,
  getPublicVendorProfile,
  verifyVendor,
  getVendorsAnalytics,
  getVendorAnalytics,
  getVendorStats,
  updateVendorProfile,
  getVendorBankAccounts,
  addBankAccount,
  updateBankAccount,
  deleteBankAccount,
};

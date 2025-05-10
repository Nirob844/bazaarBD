import { Prisma, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import {
  USER_PAGINATION,
  USER_SEARCH,
  userFilterableFields,
  userProfileFields,
  userSearchableFields,
} from './user.constants';
import { IUserFilterRequest } from './user.interface';

// const getAllUsers = async (): Promise<User[]> => {
//   const result = await prisma.user.findMany();
//   return result;
// };

const getAllUsers = async (
  filters: IUserFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<User[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination({
    ...options,
    limit: options.limit || USER_PAGINATION.DEFAULT_LIMIT,
    page: options.page || USER_PAGINATION.DEFAULT_PAGE,
  });

  const { searchTerm, ...filterData } = filters;

  // Validate search term length
  if (searchTerm && searchTerm.length < USER_SEARCH.MIN_SEARCH_LENGTH) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Search term must be at least ${USER_SEARCH.MIN_SEARCH_LENGTH} characters long`
    );
  }

  if (searchTerm && searchTerm.length > USER_SEARCH.MAX_SEARCH_LENGTH) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Search term cannot exceed ${USER_SEARCH.MAX_SEARCH_LENGTH} characters`
    );
  }

  const andConditions: Prisma.UserWhereInput[] = [
    {
      deletionStatus: 'ACTIVE',
    },
  ];

  // Handle search term
  if (searchTerm) {
    andConditions.push({
      OR: userSearchableFields.map(field => {
        const [relation, fieldName] = field.split('.');
        if (relation && fieldName) {
          return {
            [relation]: {
              [fieldName]: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          };
        }
        return {
          [field]: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        };
      }),
    });
  }

  // Handle filters
  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.entries(filterData).map(([key, value]) => {
      if (userFilterableFields.includes(key)) {
        // Handle date range filters
        if (key === 'createdAt' || key === 'updatedAt' || key === 'lastLogin') {
          const [startDate, endDate] = (value as string).split(',');
          return {
            [key]: {
              gte: startDate ? new Date(startDate) : undefined,
              lte: endDate ? new Date(endDate) : undefined,
            },
          };
        }
        // Handle boolean filters
        if (key === 'isEmailVerified' || key === 'isLocked') {
          return {
            [key]: value === 'true',
          };
        }
        // Handle enum filters
        if (key === 'role' || key === 'deletionStatus') {
          return {
            [key]: value,
          };
        }
      }
      return {};
    });

    if (filterConditions.length > 0) {
      andConditions.push({
        AND: filterConditions,
      });
    }
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.user.findMany({
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
      customer: {
        select: userProfileFields.customer,
      },
      vendor: {
        select: userProfileFields.vendor,
      },
      admin: {
        select: userProfileFields.admin,
      },
    },
  });

  const total = await prisma.user.count({
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

const getSingleUser = async (id: string): Promise<User | null> => {
  const result = await prisma.user.findFirst({
    where: {
      id,
      deletionStatus: 'ACTIVE',
    },
    include: {
      customer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          addresses: true,
        },
      },
      vendor: {
        select: {
          id: true,
          businessName: true,
          businessEmail: true,
          businessPhone: true,
          isVerified: true,
          shops: {
            where: {
              isActive: true,
            },
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      admin: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return result;
};

const updateUser = async (
  id: string,
  payload: Omit<
    Prisma.UserUpdateInput,
    'id' | 'createdAt' | 'updatedAt' | 'deletionStatus' | 'deletedAt'
  >
): Promise<User> => {
  const user = await prisma.user.findFirst({
    where: {
      id,
      deletionStatus: 'ACTIVE',
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if email is being updated and if it's already in use
  if (payload.email && payload.email !== user.email) {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: payload.email as string,
        deletionStatus: 'ACTIVE',
      },
    });

    if (existingUser) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already in use');
    }
  }

  const result = await prisma.user.update({
    where: {
      id,
    },
    data: payload,
  });

  return result;
};

const deleteUser = async (id: string): Promise<User> => {
  const user = await prisma.user.findFirst({
    where: {
      id,
      deletionStatus: 'ACTIVE',
    },
    include: {
      vendor: {
        include: {
          shops: {
            where: {
              isActive: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if vendor has active shops
  if (user.vendor?.shops && user.vendor.shops.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cannot delete vendor with active shops'
    );
  }

  // Soft delete the user
  const result = await prisma.user.update({
    where: {
      id,
    },
    data: {
      deletionStatus: 'DELETED',
      deletedAt: new Date(),
    },
  });

  return result;
};

const getUserStats = async () => {
  const [
    totalUsers,
    activeUsers,
    verifiedVendors,
    totalCustomers,
    totalAdmins,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        deletionStatus: 'ACTIVE',
      },
    }),
    prisma.user.count({
      where: {
        deletionStatus: 'ACTIVE',
        lastLogin: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    }),
    prisma.user.count({
      where: {
        deletionStatus: 'ACTIVE',
        role: 'VENDOR',
        vendor: {
          isVerified: true,
        },
      },
    }),
    prisma.user.count({
      where: {
        deletionStatus: 'ACTIVE',
        role: 'CUSTOMER',
      },
    }),
    prisma.user.count({
      where: {
        deletionStatus: 'ACTIVE',
        role: 'ADMIN',
      },
    }),
  ]);

  return {
    totalUsers,
    activeUsers,
    verifiedVendors,
    totalCustomers,
    totalAdmins,
  };
};

// Get active users
const getActiveUsers = async (query: any) => {
  const { period = '30d' } = query;
  const days = parseInt(period);
  const date = new Date();
  date.setDate(date.getDate() - days);

  const result = await prisma.user.findMany({
    where: {
      deletionStatus: 'ACTIVE',
      lastLogin: {
        gte: date,
      },
    },
    include: {
      customer: {
        select: userProfileFields.customer,
      },
      vendor: {
        select: userProfileFields.vendor,
      },
      admin: {
        select: userProfileFields.admin,
      },
    },
  });

  return result;
};

// Get role distribution
const getRoleDistribution = async () => {
  const result = await prisma.user.groupBy({
    by: ['role'],
    where: {
      deletionStatus: 'ACTIVE',
    },
    _count: {
      role: true,
    },
  });

  return result.map(item => ({
    role: item.role,
    count: item._count.role,
  }));
};

// Get my profile
const getMyProfile = async (userId: string) => {
  const result = await prisma.user.findFirst({
    where: {
      id: userId,
      deletionStatus: 'ACTIVE',
    },
    include: {
      customer: {
        select: userProfileFields.customer,
      },
      vendor: {
        select: userProfileFields.vendor,
      },
      admin: {
        select: userProfileFields.admin,
      },
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  return result;
};

// Update my profile
const updateMyProfile = async (
  userId: string,
  payload: Omit<
    Prisma.UserUpdateInput,
    'id' | 'createdAt' | 'updatedAt' | 'deletionStatus' | 'deletedAt' | 'role'
  >
) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletionStatus: 'ACTIVE',
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: payload,
  });

  return result;
};

// Change password
const changePassword = async (
  userId: string,
  payload: { oldPassword: string; newPassword: string }
) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletionStatus: 'ACTIVE',
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Verify old password
  const isPasswordMatched = await bcrypt.compare(
    payload.oldPassword,
    user.password
  );
  if (!isPasswordMatched) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Old password is incorrect');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(payload.newPassword, 12);

  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  });

  return result;
};

// Update email
const updateEmail = async (
  userId: string,
  payload: { email: string; password: string }
) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletionStatus: 'ACTIVE',
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Verify password
  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password
  );
  if (!isPasswordMatched) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect');
  }

  // Check if email is already in use
  const existingUser = await prisma.user.findFirst({
    where: {
      email: payload.email,
      deletionStatus: 'ACTIVE',
      id: {
        not: userId,
      },
    },
  });

  if (existingUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already in use');
  }

  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      email: payload.email,
      isEmailVerified: false,
    },
  });

  return result;
};

// Search users
const searchUsers = async (query: any) => {
  const { searchTerm } = query;
  const result = await prisma.user.findMany({
    where: {
      deletionStatus: 'ACTIVE',
      OR: userSearchableFields.map(field => {
        const [relation, fieldName] = field.split('.');
        if (relation && fieldName) {
          return {
            [relation]: {
              [fieldName]: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          };
        }
        return {
          [field]: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        };
      }),
    },
    include: {
      customer: {
        select: userProfileFields.customer,
      },
      vendor: {
        select: userProfileFields.vendor,
      },
      admin: {
        select: userProfileFields.admin,
      },
    },
  });

  return result;
};

// Filter users
const filterUsers = async (query: any) => {
  const { ...filterData } = query;
  const result = await prisma.user.findMany({
    where: {
      deletionStatus: 'ACTIVE',
      ...filterData,
    },
    include: {
      customer: {
        select: userProfileFields.customer,
      },
      vendor: {
        select: userProfileFields.vendor,
      },
      admin: {
        select: userProfileFields.admin,
      },
    },
  });

  return result;
};

// Verify user
const verifyUser = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletionStatus: 'ACTIVE',
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isEmailVerified: true,
    },
  });

  return result;
};

// Lock user
const lockUser = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletionStatus: 'ACTIVE',
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isLocked: true,
    },
  });

  return result;
};

// Unlock user
const unlockUser = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletionStatus: 'ACTIVE',
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const result = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isLocked: false,
    },
  });

  return result;
};

export const UserService = {
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  getUserStats,
  getActiveUsers,
  getRoleDistribution,
  getMyProfile,
  updateMyProfile,
  changePassword,
  updateEmail,
  searchUsers,
  filterUsers,
  verifyUser,
  lockUser,
  unlockUser,
};

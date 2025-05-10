import { Admin, Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { adminSearchableFields } from './admin.constant';
import { IAdminFilterRequest } from './admin.interface';

const createAdmin = async (data: Prisma.AdminCreateInput): Promise<Admin> => {
  const result = await prisma.admin.create({
    data,
  });
  return result;
};

const getAllAdmins = async (
  filters: IAdminFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Admin[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: adminSearchableFields.map((field: string) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map(key => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.AdminWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.admin.findMany({
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
      user: {
        select: {
          email: true,
          role: true,
          isEmailVerified: true,
          lastLogin: true,
        },
      },
    },
  });

  const total = await prisma.admin.count({
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

const getSingleAdmin = async (id: string): Promise<Admin | null> => {
  const result = await prisma.admin.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          email: true,
          role: true,
          isEmailVerified: true,
          lastLogin: true,
        },
      },
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }

  return result;
};

const updateAdmin = async (
  id: string,
  payload: Partial<Admin>
): Promise<Admin> => {
  const result = await prisma.admin.update({
    where: {
      id,
    },
    data: {
      firstName: payload.firstName,
      lastName: payload.lastName,
      phoneNumber: payload.phoneNumber,
      designation: payload.designation,
      department: payload.department,
      isActive: payload.isActive,
      permissions: payload.permissions as Prisma.InputJsonValue,
      notes: payload.notes,
    },
    include: {
      user: {
        select: {
          email: true,
          role: true,
          isEmailVerified: true,
          lastLogin: true,
        },
      },
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }

  return result;
};

const deleteAdmin = async (id: string): Promise<Admin> => {
  const result = await prisma.admin.delete({
    where: {
      id,
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }

  return result;
};

const getAdminStats = async () => {
  const [totalAdmins, activeAdmins, adminsByDepartment, recentAdmins] =
    await Promise.all([
      prisma.admin.count(),
      prisma.admin.count({
        where: {
          isActive: true,
        },
      }),
      prisma.admin.groupBy({
        by: ['designation'],
        _count: {
          designation: true,
        },
      }),
      prisma.admin.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              email: true,
              lastLogin: true,
            },
          },
        },
      }),
    ]);

  return {
    totalAdmins,
    activeAdmins,
    adminsByDepartment,
    recentAdmins,
  };
};

export const AdminService = {
  createAdmin,
  getAllAdmins,
  getSingleAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminStats,
};

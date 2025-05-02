import { Prisma, Vendor } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { vendorSearchableFields } from './vendor.constants';
import { IVendorFilterRequest } from './vendor.interface';

const getAllVendors = async (
  filters: IVendorFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Vendor[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: vendorSearchableFields.map(field => ({
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
      shops: true,
      bankAccounts: true,
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

const getVendorProfile = async (id: string): Promise<Vendor | null> => {
  const result = await prisma.vendor.findFirst({
    where: {
      userId: id,
    },
    include: {
      shops: true,
      products: true,
      analytics: true,
      bankAccounts: true,
    },
  });

  return result;
};

const updateVendor = async (id: string, payload: any): Promise<Vendor> => {
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

export const VendorService = {
  getAllVendors,
  getSingleVendor,
  getVendorProfile,
  updateVendor,
  deleteVendor,
};

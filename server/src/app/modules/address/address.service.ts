import { Address, Prisma } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';

const insertIntoDB = async (data: Address): Promise<Address> => {
  return prisma.$transaction(async tx => {
    if (data.isDefault) {
      await tx.address.updateMany({
        where: { customerId: data.customerId },
        data: { isDefault: false },
      });
    }

    const result = await tx.address.create({
      data,
    });

    return result;
  });
};

const getAllFromDB = async (
  options: IPaginationOptions
): Promise<IGenericResponse<Address[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  const andConditions: Prisma.AddressWhereInput[] = [];

  const whereConditions: Prisma.AddressWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.address.findMany({
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
      customer: true,
    },
  });
  const total = await prisma.address.count({
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

const getDataById = async (id: string): Promise<Address | null> => {
  const result = await prisma.address.findUnique({
    where: {
      id,
    },
    include: {
      customer: true,
    },
  });

  return result;
};

const updateOneInDB = async (
  id: string,
  payload: Partial<Address>
): Promise<Address> => {
  return prisma.$transaction(async tx => {
    const existingAddress = await tx.address.findUnique({
      where: { id },
    });

    if (!existingAddress) {
      throw new Error('Address not found');
    }

    if (payload.isDefault) {
      await tx.address.updateMany({
        where: { customerId: existingAddress.customerId },
        data: { isDefault: false },
      });
    }

    const result = await tx.address.update({
      where: {
        id,
      },
      data: payload,
    });

    return result;
  });
};

const deleteByIdFromDB = async (id: string): Promise<Address> => {
  const result = await prisma.address.delete({
    where: {
      id,
    },
  });
  return result;
};

export const AddressService = {
  insertIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
};

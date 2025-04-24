import { Customer, Prisma } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { customerSearchableFields } from './customer.constants';
import { ICustomerFilterRequest } from './customer.interface';

const getAllCustomers = async (
  filters: ICustomerFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Customer[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: customerSearchableFields.map(field => ({
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

  const whereConditions: Prisma.CustomerWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.customer.findMany({
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
      addresses: true,
    },
  });
  const total = await prisma.customer.count({
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

const getSingleCustomer = async (id: string): Promise<Customer | null> => {
  const result = await prisma.customer.findUnique({
    where: {
      id,
    },
    include: {
      addresses: true,
      cart: true,
      orders: true,
      reviews: true,
    },
  });

  return result;
};

const getCustomerProfile = async (id: string): Promise<Customer | null> => {
  const result = await prisma.customer.findFirst({
    where: {
      userId: id,
    },
    include: {
      addresses: true,
      cart: true,
      orders: true,
      reviews: true,
    },
  });

  return result;
};

const updateCustomer = async (
  id: string,
  payload: Partial<Customer>
): Promise<Customer> => {
  console.log('payload', payload);
  const result = await prisma.customer.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

const deleteCustomer = async (id: string): Promise<Customer> => {
  const result = await prisma.customer.delete({
    where: {
      id,
    },
  });
  return result;
};

export const CustomerService = {
  getAllCustomers,
  getSingleCustomer,
  getCustomerProfile,
  updateCustomer,
  deleteCustomer,
};

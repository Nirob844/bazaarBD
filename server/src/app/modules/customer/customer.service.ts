import { Customer, OrderStatus, Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import {
  CUSTOMER_CONSTANTS,
  customerFilterableFields,
  customerProfileFields,
  customerSearchableFields,
} from './customer.constants';
import { ICustomerFilterRequest } from './customer.interface';

const getAllCustomers = async (
  filters: ICustomerFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Customer[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.CustomerWhereInput[] = [
    {
      user: {
        deletionStatus: CUSTOMER_CONSTANTS.DELETION_STATUS.ACTIVE,
      },
    },
  ];

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
      AND: Object.keys(filterData).map(key => {
        if (customerFilterableFields.includes(key)) {
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
      user: {
        select: customerProfileFields.user,
      },
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
  const result = await prisma.customer.findFirst({
    where: {
      id,
      user: {
        deletionStatus: CUSTOMER_CONSTANTS.DELETION_STATUS.ACTIVE,
      },
    },
    include: {
      addresses: true,
      cart: {
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  basePrice: true,
                  images: true,
                },
              },
            },
          },
        },
      },
      orders: {
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  basePrice: true,
                  images: true,
                },
              },
            },
          },
        },
      },
      reviews: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
            },
          },
        },
      },
      user: {
        select: customerProfileFields.user,
      },
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
  }

  return result;
};

const getCustomerProfile = async (userId: string): Promise<Customer | null> => {
  const result = await prisma.customer.findFirst({
    where: {
      userId,
      user: {
        deletionStatus: CUSTOMER_CONSTANTS.DELETION_STATUS.ACTIVE,
      },
    },
    include: {
      addresses: true,
      cart: {
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  basePrice: true,
                  images: true,
                },
              },
            },
          },
        },
      },
      orders: {
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  basePrice: true,
                  images: true,
                },
              },
            },
          },
        },
      },
      reviews: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
            },
          },
        },
      },
      user: {
        select: customerProfileFields.user,
      },
    },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Customer profile not found');
  }

  return result;
};

const updateCustomer = async (
  id: string,
  payload: Omit<
    Prisma.CustomerUpdateInput,
    'id' | 'userId' | 'createdAt' | 'updatedAt'
  >
): Promise<Customer> => {
  const customer = await prisma.customer.findFirst({
    where: {
      id,
      user: {
        deletionStatus: CUSTOMER_CONSTANTS.DELETION_STATUS.ACTIVE,
      },
    },
  });

  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
  }

  const result = await prisma.customer.update({
    where: {
      id,
    },
    data: payload,
    include: {
      addresses: true,
      user: {
        select: customerProfileFields.user,
      },
    },
  });

  return result;
};

const deleteCustomer = async (id: string): Promise<Customer> => {
  const customer = await prisma.customer.findFirst({
    where: {
      id,
      user: {
        deletionStatus: CUSTOMER_CONSTANTS.DELETION_STATUS.ACTIVE,
      },
    },
    include: {
      orders: {
        where: {
          status: {
            notIn: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
          },
        },
      },
    },
  });

  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
  }

  // Check if customer has active orders
  if (customer.orders.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Cannot delete customer with active orders'
    );
  }

  // Soft delete the user
  await prisma.user.update({
    where: {
      id: customer.userId,
    },
    data: {
      deletionStatus: CUSTOMER_CONSTANTS.DELETION_STATUS.DELETED,
      deletedAt: new Date(),
    },
  });

  return customer;
};

const getCustomerStats = async (customerId: string) => {
  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      user: {
        deletionStatus: CUSTOMER_CONSTANTS.DELETION_STATUS.ACTIVE,
      },
    },
  });

  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
  }

  const [
    totalOrders,
    totalSpent,
    totalReviews,
    averageRating,
    orderStatusCounts,
  ] = await Promise.all([
    prisma.order.count({
      where: {
        customerId,
      },
    }),
    prisma.order.aggregate({
      where: {
        customerId,
        status: OrderStatus.COMPLETED,
      },
      _sum: {
        total: true,
      },
    }),
    prisma.review.count({
      where: {
        customerId,
      },
    }),
    prisma.review.aggregate({
      where: {
        customerId,
      },
      _avg: {
        rating: true,
      },
    }),
    prisma.order.groupBy({
      by: ['status'],
      where: {
        customerId,
      },
      _count: true,
    }),
  ]);

  return {
    totalOrders,
    totalSpent: totalSpent._sum?.total || 0,
    totalReviews,
    averageRating: averageRating._avg?.rating || 0,
    orderStatusBreakdown: orderStatusCounts.reduce((acc, curr) => {
      acc[curr.status] = curr._count;
      return acc;
    }, {} as Record<OrderStatus, number>),
  };
};

const getCustomerOrders = async (
  customerId: string,
  options: IPaginationOptions
) => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  const customer = await prisma.customer.findFirst({
    where: {
      id: customerId,
      user: {
        deletionStatus: CUSTOMER_CONSTANTS.DELETION_STATUS.ACTIVE,
      },
    },
  });

  if (!customer) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Customer not found');
  }

  const result = await prisma.order.findMany({
    where: {
      customerId,
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              basePrice: true,
              images: true,
            },
          },
        },
      },
    },
  });

  const total = await prisma.order.count({
    where: {
      customerId,
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

export const CustomerService = {
  getAllCustomers,
  getSingleCustomer,
  getCustomerProfile,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
  getCustomerOrders,
};

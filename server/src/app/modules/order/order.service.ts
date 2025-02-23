import { Order, Prisma } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';

const cartToOrder = async (userId: string): Promise<Order> => {
  // Fetch the user's cart with items
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error('Cart is empty or not found.');
  }

  // Calculate total price
  const totalAmount = cart.items.reduce(
    (sum, item) => sum + item.quantity * Number(item.product.price),
    0
  );

  // Create the order with items
  const order = await prisma.order.create({
    data: {
      userId,
      total: totalAmount,
      status: 'PENDING',
      items: {
        create: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        })),
      },
    },
    include: {
      items: true,
    },
  });

  // Remove items from the cart
  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  return order;
};

const getUserOrders = async (
  userId: string,
  options: IPaginationOptions
): Promise<IGenericResponse<Order[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  const whereConditions: Prisma.OrderWhereInput = {
    userId,
  };

  const result = await prisma.order.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  const total = await prisma.order.count({ where: whereConditions });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

export const OrderService = {
  cartToOrder,
  getUserOrders,
};

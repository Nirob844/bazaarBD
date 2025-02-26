import { Order, OrderStatus, Prisma } from '@prisma/client';
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

  return prisma.$transaction(async tx => {
    // Create the order with items
    const order = await tx.order.create({
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

    // Update inventory stock
    for (const item of cart.items) {
      const inventory = await tx.inventory.findUnique({
        where: { productId: item.productId },
      });

      if (!inventory) {
        throw new Error(
          `Inventory not found for product ID: ${item.productId}`
        );
      }

      if (inventory.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for product ID: ${item.productId}. Available: ${inventory.stock}, Required: ${item.quantity}`
        );
      }

      await tx.inventory.update({
        where: { productId: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
          history: {
            create: {
              action: 'OUT',
              quantityChange: item.quantity,
              previousStock: inventory.stock,
              newStock: inventory.stock - item.quantity,
            },
          },
        },
      });
    }

    // Remove items from the cart
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return order;
  });
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

const getAllOrders = async (
  options: IPaginationOptions
): Promise<IGenericResponse<Order[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  const andConditions: Prisma.OrderWhereInput[] = [];

  const whereConditions: Prisma.OrderWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.order.findMany({
    where: whereConditions,
    skip,
    take: limit,
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
  });
  const total = await prisma.order.count({
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

const getDataById = async (id: string): Promise<Order | null> => {
  const result = await prisma.order.findUnique({
    where: {
      id,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      payments: true,
    },
  });

  return result;
};

const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus
): Promise<Order> => {
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!existingOrder) {
    throw new Error('Order not found!');
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
};

const deleteOrder = async (orderId: string): Promise<void> => {
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!existingOrder) {
    throw new Error('Order not found!');
  }

  await prisma.$transaction(async tx => {
    // Delete associated items first
    await tx.orderItem.deleteMany({
      where: { orderId },
    });

    // Delete associated payments (if applicable)
    await tx.payment.deleteMany({
      where: { orderId },
    });

    // Delete the order itself
    await tx.order.delete({
      where: { id: orderId },
    });
  });
};

export const OrderService = {
  cartToOrder,
  getUserOrders,
  getAllOrders,
  getDataById,
  updateOrderStatus,
  deleteOrder,
};

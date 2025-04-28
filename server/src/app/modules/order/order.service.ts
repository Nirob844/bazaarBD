import { Order, OrderStatus, Prisma } from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { AdminAnalyticsService } from '../adminAnalytics/adminAnalytics.service';
import { ShopAnalyticsService } from '../shopAnalytics/shopAnalytics.service';
import { VendorAnalyticsService } from '../vendorAnalytics/vendorAnalytics.service';

const cartToOrder = async (userId: string): Promise<Order> => {
  const customer = await prisma.customer.findUnique({
    where: { userId },
  });

  if (!customer) {
    throw new Error('customer not found');
  }

  const customerId = customer.id;

  const address = await prisma.address.findFirst({
    where: { customerId },
  });

  if (!address) {
    throw new Error('address not found');
  }

  const addressId = address.id;

  const cart = await prisma.cart.findUnique({
    where: { customerId },
    include: {
      items: {
        include: {
          product: {
            include: {
              promotions: {
                select: {
                  discountValue: true,
                  type: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error('Cart is empty or not found.');
  }

  const totalAmount = cart.items.reduce((sum, item) => {
    const product = item.product;
    const basePrice = Number(product.basePrice);
    const promotionDiscounts = product.promotions.map(p =>
      Number(p.discountValue)
    );
    const maxPromotionDiscount = promotionDiscounts.length
      ? Math.max(...promotionDiscounts)
      : 0;
    const discountedPrice =
      basePrice - (basePrice * maxPromotionDiscount) / 100;
    return sum + item.quantity * discountedPrice;
  }, 0);

  const orderNumber = `ORD-${new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  return prisma.$transaction(async tx => {
    const order = await tx.order.create({
      data: {
        customerId,
        addressId,
        orderNumber,
        subtotal: totalAmount,
        shipping: 0,
        tax: 0,
        discount: 0,
        total: totalAmount,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        shippingStatus: 'PENDING',
        items: {
          create: cart.items.map(item => {
            const product = item.product;
            const basePrice = Number(product.basePrice);

            const promotionDiscounts = product.promotions.map(p =>
              Number(p.discountValue)
            );
            const maxPromotionDiscount = promotionDiscounts.length
              ? Math.max(...promotionDiscounts)
              : 0;

            const discountedPrice =
              basePrice - (basePrice * maxPromotionDiscount) / 100;

            return {
              productId: item.productId,
              quantity: item.quantity,
              price: discountedPrice,
            };
          }),
        },
      },
      include: {
        items: true,
      },
    });

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
  const customer = await prisma.customer.findUnique({
    where: { userId },
  });

  if (!customer) {
    throw new Error('customer not found');
  }

  const customerId = customer.id;

  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  const whereConditions: Prisma.OrderWhereInput = {
    customerId,
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
          product: {
            include: {
              images: {
                select: {
                  url: true,
                  altText: true,
                },
              },
              promotions: {
                select: {
                  type: true,
                  discountValue: true,
                },
              },
            },
          },
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
          product: {
            include: {
              promotions: true,
            },
          },
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
          product: {
            include: {
              promotions: true,
            },
          },
        },
      },
      payments: true,
    },
  });

  return result;
};

const updateOrderStatus = async (
  id: string,
  status: OrderStatus
): Promise<Order> => {
  console.log('updateOrderStatus', id, status);

  const existingOrder = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true, // 🛒 Need order items to update inventory later
    },
  });

  if (!existingOrder) {
    throw new Error('Order not found!');
  }

  // If updating to CONFIRMED, adjust inventory
  if (status === OrderStatus.COMPLETED) {
    await prisma.$transaction(async tx => {
      for (const item of existingOrder.items) {
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
            stock: { decrement: item.quantity },
            history: {
              create: {
                action: 'SALE',
                quantityChange: item.quantity,
                previousStock: inventory.stock,
                newStock: inventory.stock - item.quantity,
              },
            },
          },
        });

        // Update shop analytics
        await ShopAnalyticsService.updateShopAnalytics(
          item.productId,
          item.quantity,
          item.price.toNumber()
        );

        // Update vendor analytics
        await VendorAnalyticsService.updateVendorAnalytics(
          item.productId,
          item.quantity,
          item.price.toNumber()
        );

        // Update admin analytics
        await AdminAnalyticsService.updateAdminAnalytics();
      }

      // Then update the order status
      await tx.order.update({
        where: { id },
        data: { status },
      });
    });

    // Return the updated order after transaction
    return (await prisma.order.findUnique({ where: { id } })) as Order;
  }

  // If updating to anything other than CONFIRMED, just update status
  return prisma.order.update({
    where: { id },
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

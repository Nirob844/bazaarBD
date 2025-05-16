import {
  Order,
  OrderStatus,
  PaymentStatus,
  Prisma,
  ShippingStatus,
} from '@prisma/client';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { EmailType as EmailTypeConstant } from '../emailNotification/emailNotification.constant';
import { sendEmailNotification } from '../emailNotification/emailNotification.utils';
import { ShopAnalyticsService } from '../shopAnalytics/shopAnalytics.service';
import { VendorAnalyticsService } from '../vendorAnalytics/vendorAnalytics.service';

// Helper function to calculate order totals
const calculateOrderTotals = (items: any[], shippingCost = 0) => {
  const subtotal = items.reduce((sum, item) => {
    const unitPrice = Number(item.unitPrice || 0);
    const discount = Number(item.discount || 0);
    const tax = Number(item.tax || 0);
    const itemTotal = (unitPrice - discount + tax) * item.quantity;
    return sum + itemTotal;
  }, 0);

  const totalDiscount = items.reduce(
    (sum, item) => sum + Number(item.discount || 0) * item.quantity,
    0
  );
  const totalTax = items.reduce(
    (sum, item) => sum + Number(item.tax || 0) * item.quantity,
    0
  );

  return {
    subtotal,
    totalDiscount,
    totalTax,
    shipping: shippingCost,
    total: subtotal + shippingCost,
  };
};

const cartToOrder = async (userId: string): Promise<Order> => {
  const customer = await prisma.customer.findUnique({
    where: { userId },
    include: {
      addresses: {
        where: { isDefault: true },
        take: 1,
      },
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!customer) {
    throw new Error('Customer not found');
  }

  if (!customer.addresses.length) {
    throw new Error('No default shipping address found');
  }

  const addressId = customer.addresses[0].id;

  const cart = await prisma.cart.findUnique({
    where: { customerId: customer.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              promotions: {
                where: {
                  isActive: true,
                  startDate: { lte: new Date() },
                  endDate: { gte: new Date() },
                },
              },
              variants: true,
            },
          },
          variant: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error('Cart is empty or not found');
  }

  // Calculate shipping cost (you can implement your shipping logic here)
  const shippingCost = 0; // Default shipping cost

  // Prepare order items with proper pricing
  const orderItems = cart.items.map(item => {
    const product = item.product;
    const variant = item.variant;

    // Use variant price if available, otherwise use product price
    const basePrice = variant?.basePrice || product.basePrice;
    const salePrice = variant?.salePrice || product.salePrice;

    // Calculate unit price considering promotions
    const unitPrice = Number(salePrice || basePrice);
    let discount = 0;

    if (product.promotions.length > 0) {
      const activePromotion = product.promotions[0];
      if (activePromotion.isPercentage) {
        discount = (unitPrice * Number(activePromotion.discountValue)) / 100;
      } else {
        discount = Number(activePromotion.discountValue);
      }
    }

    // Calculate tax
    const taxRate = variant?.taxRate || product.taxRate || 0;
    const tax = (unitPrice - discount) * (Number(taxRate) / 100);

    return {
      productId: item.productId,
      variantId: item.variantId,
      name: product.name + (variant ? ` - ${variant.name}` : ''),
      sku: variant?.sku || product.sku,
      quantity: item.quantity,
      unitPrice,
      discount,
      tax,
      total: (unitPrice - discount + tax) * item.quantity,
    };
  });

  const totals = calculateOrderTotals(orderItems, shippingCost);

  const orderNumber = `ORD-${new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  return prisma.$transaction(async tx => {
    const order = await tx.order.create({
      data: {
        customerId: customer.id,
        addressId,
        orderNumber,
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        tax: totals.totalTax,
        discount: totals.totalDiscount,
        total: totals.total,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        shippingStatus: ShippingStatus.PENDING,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    // Clear the cart
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // Update cart status
    await tx.cart.update({
      where: { id: cart.id },
      data: { status: 'CONVERTED' },
    });

    // Send order confirmation email
    try {
      await sendEmailNotification({
        userId: customer.userId,
        toEmail: customer.user.email,
        type: EmailTypeConstant.ORDER_CONFIRMATION,
        subject: 'Your order has been placed successfully!',
        body: `<p>Dear ${customer.firstName},</p>
               <p>Your order <strong>${orderNumber}</strong> has been placed successfully.</p>
               <p>Order Total: ${totals.total}</p>
               <p>Thank you for shopping with us!</p>`,
      });
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
    }

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
  const existingOrder = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            include: {
              inventory: true,
              vendor: {
                include: {
                  user: {
                    select: {
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      customer: {
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      },
    },
  });

  if (!existingOrder) {
    throw new Error('Order not found!');
  }

  // Handle different status updates
  switch (status) {
    case OrderStatus.COMPLETED:
      return await handleOrderCompletion(existingOrder);
    case OrderStatus.CANCELLED:
      return await handleOrderCancellation(existingOrder);
    case OrderStatus.REFUNDED:
      return await handleOrderRefund(existingOrder);
    default:
      return await prisma.order.update({
        where: { id },
        data: { status },
      });
  }
};

// Helper function to handle order completion
const handleOrderCompletion = async (order: any): Promise<Order> => {
  return prisma.$transaction(async tx => {
    // Update inventory
    for (const item of order.items) {
      const inventory = item.product.inventory;
      if (!inventory) {
        throw new Error(
          `Inventory not found for product ID: ${item.productId}`
        );
      }

      if (inventory.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ID: ${item.productId}`);
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

      // Update analytics
      await ShopAnalyticsService.updateShopAnalytics(
        item.productId,
        item.quantity,
        item.unitPrice
      );

      await VendorAnalyticsService.updateVendorAnalytics(
        item.productId,
        item.quantity,
        item.unitPrice
      );
    }

    // Update order status
    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.COMPLETED,
        paymentStatus: PaymentStatus.CAPTURED,
        shippingStatus: ShippingStatus.DELIVERED,
        deliveredAt: new Date(),
      },
    });

    // Send notifications
    await sendOrderNotifications(updatedOrder, 'COMPLETED');

    return updatedOrder;
  });
};

// Helper function to handle order cancellation
const handleOrderCancellation = async (order: any): Promise<Order> => {
  return prisma.$transaction(async tx => {
    // Restore inventory
    for (const item of order.items) {
      const inventory = item.product.inventory;
      if (inventory) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            stock: { increment: item.quantity },
            history: {
              create: {
                action: 'RETURN',
                quantityChange: item.quantity,
                previousStock: inventory.stock,
                newStock: inventory.stock + item.quantity,
              },
            },
          },
        });
      }
    }

    // Update order status
    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    // Send notifications
    await sendOrderNotifications(updatedOrder, 'CANCELLED');

    return updatedOrder;
  });
};

// Helper function to handle order refund
const handleOrderRefund = async (order: any): Promise<Order> => {
  return prisma.$transaction(async tx => {
    // Create refund record
    await tx.refund.create({
      data: {
        orderId: order.id,
        amount: order.total,
        reason: 'CUSTOMER_REQUEST',
        status: 'PROCESSED',
        type: 'FULL',
        processedAt: new Date(),
      },
    });

    // Update order status
    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.REFUNDED,
        paymentStatus: PaymentStatus.REFUNDED,
      },
    });

    // Send notifications
    await sendOrderNotifications(updatedOrder, 'REFUNDED');

    return updatedOrder;
  });
};

// Helper function to send order notifications
const sendOrderNotifications = async (order: any, status: string) => {
  try {
    let emailType: (typeof EmailTypeConstant)[keyof typeof EmailTypeConstant];
    switch (status) {
      case 'COMPLETED':
        emailType = EmailTypeConstant.ORDER_DELIVERED;
        break;
      case 'CANCELLED':
        emailType = EmailTypeConstant.PAYMENT_FAILED;
        break;
      case 'REFUNDED':
        emailType = EmailTypeConstant.PAYMENT_FAILED;
        break;
      default:
        emailType = EmailTypeConstant.ORDER_CONFIRMATION;
    }

    // Send customer notification
    await sendEmailNotification({
      userId: order.customer.userId,
      toEmail: order.customer.user.email,
      type: emailType,
      subject: `Order ${status.toLowerCase()}`,
      body: `<p>Dear ${order.customer.firstName},</p>
             <p>Your order <strong>${
               order.orderNumber
             }</strong> has been ${status.toLowerCase()}.</p>
             <p>Thank you for shopping with us!</p>`,
    });

    // Send vendor notification if needed
    if (order.items[0]?.product?.vendor) {
      await sendEmailNotification({
        userId: order.items[0].product.vendor.userId,
        toEmail: order.items[0].product.vendor.user.email,
        type: emailType,
        subject: `Order ${status.toLowerCase()} - ${order.orderNumber}`,
        body: `<p>Order ${
          order.orderNumber
        } has been ${status.toLowerCase()}.</p>`,
      });
    }
  } catch (error) {
    console.error('Failed to send order notifications:', error);
  }
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

/* eslint-disable no-unused-vars */
import {
  PaymentGateway,
  PaymentMethod,
  PaymentStatus,
  RefundReason,
} from '@prisma/client';
import axios from 'axios';
import config from '../../../config';
import prisma from '../../../shared/prisma';
import { EmailType } from '../emailNotification/emailNotification.constant';
import { sendEmailNotification } from '../emailNotification/emailNotification.utils';

const SSLCommerz_URL = 'https://securepay.sslcommerz.com/gwprocess/v4/api.php';
const VALIDATION_URL =
  'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php';

const siteURL = process.env.SITE_URL || 'https://localhost:5000';

// Initialize payment based on payment method
export const initiatePayment = async (
  orderId: string,
  paymentMethod: PaymentMethod
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true },
  });

  if (!order || !order.customer) {
    throw new Error('Order or customer not found.');
  }

  const user = await prisma.user.findUnique({
    where: { id: order.customer.userId },
  });
  if (!user) {
    throw new Error('User not found.');
  }

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      orderId,
      amount: order.total,
      method: paymentMethod,
      gateway: getGatewayForMethod(paymentMethod) as PaymentGateway,
      status: 'PENDING',
    },
  });

  // Handle different payment methods
  switch (paymentMethod) {
    case 'SSL_COMMERZ':
      return initiateSSLCommerzPayment(order, payment, user);
    case 'BKASH':
      return initiateBkashPayment(order, payment, user);
    case 'NAGAD':
      return initiateNagadPayment(order, payment, user);
    case 'CARD':
      return initiateCardPayment(order, payment, user);
    case 'COD':
      return initiateCODPayment(order, payment, user);
    default:
      throw new Error('Unsupported payment method');
  }
};

// Verify payment status
export const verifyPayment = async (paymentId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: true },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  // Verify based on payment method
  switch (payment.method) {
    case 'SSL_COMMERZ':
      return verifySSLCommerzPayment(payment);
    case 'BKASH':
      return verifyBkashPayment(payment);
    case 'NAGAD':
      return verifyNagadPayment(payment);
    case 'CARD':
      return verifyCardPayment(payment);
    case 'COD':
      return verifyCODPayment(payment);
    default:
      throw new Error('Unsupported payment method');
  }
};

// Get payment status
export const getPaymentStatus = async (paymentId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      order: true,
      paymentAttempts: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  return {
    status: payment.status,
    gatewayStatus: payment.gatewayStatus,
    lastAttempt: payment.paymentAttempts[0],
    orderStatus: payment.order.status,
  };
};

// Get payment history
export const getPaymentHistory = async (orderId: string) => {
  const payments = await prisma.payment.findMany({
    where: { orderId },
    include: {
      paymentAttempts: true,
      refunds: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return payments;
};

// Initiate refund
export const initiateRefund = async (
  paymentId: string,
  amount: number,
  reason: RefundReason
) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: true },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  if (payment.status !== 'CAPTURED') {
    throw new Error('Payment must be captured to initiate refund');
  }

  // Create refund record
  const refund = await prisma.refund.create({
    data: {
      orderId: payment.orderId,
      paymentId: payment.id,
      amount,
      reason,
      status: 'PENDING',
      type: amount === payment.amount.toNumber() ? 'FULL' : 'PARTIAL',
    },
  });

  // Process refund based on payment method
  switch (payment.method) {
    case 'SSL_COMMERZ':
      return processSSLCommerzRefund(payment, refund);
    case 'BKASH':
      return processBkashRefund(payment, refund);
    case 'NAGAD':
      return processNagadRefund(payment, refund);
    case 'CARD':
      return processCardRefund(payment, refund);
    default:
      throw new Error('Refund not supported for this payment method');
  }
};

// Get payment analytics
export const getPaymentAnalytics = async (
  startDate?: string,
  endDate?: string
) => {
  const where = {
    createdAt: {
      gte: startDate ? new Date(startDate) : undefined,
      lte: endDate ? new Date(endDate) : undefined,
    },
  };

  const [
    totalPayments,
    successfulPayments,
    failedPayments,
    totalAmount,
    methodDistribution,
    statusDistribution,
  ] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.count({
      where: { ...where, status: 'CAPTURED' },
    }),
    prisma.payment.count({
      where: { ...where, status: 'FAILED' },
    }),
    prisma.payment.aggregate({
      where: { ...where, status: 'CAPTURED' },
      _sum: { amount: true },
    }),
    prisma.payment.groupBy({
      by: ['method'],
      where,
      _count: true,
    }),
    prisma.payment.groupBy({
      by: ['status'],
      where,
      _count: true,
    }),
  ]);

  return {
    totalPayments,
    successfulPayments,
    failedPayments,
    totalAmount: totalAmount._sum.amount || 0,
    successRate: (successfulPayments / totalPayments) * 100,
    methodDistribution,
    statusDistribution,
  };
};

// Helper functions
const getGatewayForMethod = (method: PaymentMethod): string => {
  switch (method) {
    case 'SSL_COMMERZ':
      return 'SSLCOMMERZ';
    case 'BKASH':
      return 'BKASH';
    case 'NAGAD':
      return 'NAGAD';
    case 'CARD':
      return 'STRIPE';
    case 'COD':
      return 'MANUAL';
    default:
      return 'MANUAL';
  }
};

// Payment method specific implementations
const initiateSSLCommerzPayment = async (
  order: any,
  payment: any,
  user: any
) => {
  const payload = {
    store_id: config.sslcommerz.store_id,
    store_passwd: config.sslcommerz.store_passwd,
    total_amount: order.total.toNumber(),
    currency: 'BDT',
    tran_id: payment.id,
    success_url: `${siteURL}/api/payment/success`,
    fail_url: `${siteURL}/api/payment/fail`,
    cancel_url: `${siteURL}/api/payment/cancel`,
    ipn_url: `${siteURL}/api/payment/ipn`,
    cus_name: `${order.customer.firstName} ${order.customer.lastName}`,
    cus_email: user.email,
    cus_phone: order.customer.phone || '01700000000',
    cus_add1: 'Dhaka',
    cus_city: 'Dhaka',
    cus_country: 'Bangladesh',
    product_name: 'BazaarBD Order',
    product_category: 'Ecommerce',
    product_profile: 'general',
  };

  const response = await axios.post(SSLCommerz_URL, payload);
  const gatewayData = response.data;

  if (gatewayData.status !== 'SUCCESS') {
    throw new Error('Failed to initiate payment.');
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      transactionId: gatewayData.tran_id,
      gatewayResponse: gatewayData,
    },
  });

  return gatewayData.GatewayPageURL;
};

// Placeholder implementations for other payment methods
const initiateBkashPayment = async (order: any, payment: any, user: any) => {
  // Implement bKash payment initiation
  throw new Error('bKash payment not implemented');
};

const initiateNagadPayment = async (order: any, payment: any, user: any) => {
  // Implement Nagad payment initiation
  throw new Error('Nagad payment not implemented');
};

const initiateCardPayment = async (order: any, payment: any, user: any) => {
  // Implement card payment initiation
  throw new Error('Card payment not implemented');
};

const initiateCODPayment = async (order: any, payment: any, user: any) => {
  // For COD, we just mark the payment as pending
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'PENDING',
      gatewayStatus: 'PENDING',
    },
  });

  return null; // No payment URL for COD
};

// Verification implementations
const verifySSLCommerzPayment = async (payment: any) => {
  const validateRes = await axios.get(VALIDATION_URL, {
    params: {
      val_id: payment.transactionId,
      store_id: config.sslcommerz.store_id,
      store_passwd: config.sslcommerz.store_passwd,
      format: 'json',
    },
  });

  const data = validateRes.data;

  if (data.status !== 'VALID') {
    throw new Error('Payment validation failed');
  }

  return updatePaymentStatus(payment.id, 'CAPTURED', data);
};

const verifyBkashPayment = async (payment: any) => {
  // Implement bKash payment verification
  throw new Error('bKash verification not implemented');
};

const verifyNagadPayment = async (payment: any) => {
  // Implement Nagad payment verification
  throw new Error('Nagad verification not implemented');
};

const verifyCardPayment = async (payment: any) => {
  // Implement card payment verification
  throw new Error('Card verification not implemented');
};

const verifyCODPayment = async (payment: any) => {
  // For COD, we just return the current status
  return payment;
};

// Refund processing implementations
const processSSLCommerzRefund = async (payment: any, refund: any) => {
  // Implement SSLCommerz refund processing
  throw new Error('SSLCommerz refund not implemented');
};

const processBkashRefund = async (payment: any, refund: any) => {
  // Implement bKash refund processing
  throw new Error('bKash refund not implemented');
};

const processNagadRefund = async (payment: any, refund: any) => {
  // Implement Nagad refund processing
  throw new Error('Nagad refund not implemented');
};

const processCardRefund = async (payment: any, refund: any) => {
  // Implement card refund processing
  throw new Error('Card refund not implemented');
};

// Helper function to update payment status
const updatePaymentStatus = async (
  paymentId: string,
  status: PaymentStatus,
  gatewayData: any
) => {
  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status,
      gatewayStatus: gatewayData.status,
      gatewayResponse: gatewayData,
    },
  });

  // Update order status if payment is successful
  if (status === 'CAPTURED') {
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: 'COMPLETED' },
    });
  }

  return payment;
};

// Handle SSLCommerz IPN
export const handleSSLCommerzIPN = async (ipnData: any) => {
  const val_id = ipnData.val_id;

  // Validate the IPN data
  const validateRes = await axios.get(VALIDATION_URL, {
    params: {
      val_id,
      store_id: config.sslcommerz.store_id,
      store_passwd: config.sslcommerz.store_passwd,
      format: 'json',
    },
  });

  const data = validateRes.data;

  if (data.status !== 'VALID') {
    throw new Error('Payment validation failed');
  }

  // Find the payment record
  const payment = await prisma.payment.findFirst({
    where: { transactionId: data.tran_id },
    include: {
      order: {
        include: {
          customer: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  // Create payment attempt record
  await prisma.paymentAttempt.create({
    data: {
      paymentId: payment.id,
      amount: payment.amount,
      status: data.status === 'VALID' ? 'CAPTURED' : 'FAILED',
      gatewayResponse: data,
    },
  });

  // Update payment status
  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: data.status === 'VALID' ? 'CAPTURED' : 'FAILED',
      gatewayStatus: data.status,
      capturedAt:
        data.status === 'VALID' ? new Date(data.transaction_date) : null,
      gatewayResponse: data,
    },
  });

  // If payment is successful, update order status
  if (data.status === 'VALID') {
    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        status: 'COMPLETED',
        paymentStatus: 'CAPTURED',
      },
    });

    // Send payment success email
    try {
      const user = await prisma.user.findUnique({
        where: { id: payment.order.customer.userId },
      });

      if (user) {
        await sendEmailNotification({
          userId: user.id,
          toEmail: user.email,
          subject: 'Payment Successful - BazaarBD',
          body: `<p>Dear ${payment.order.customer.firstName},</p>
               <p>Your payment for order <strong>${payment.order.id}</strong> was successful.</p>
               <p>Amount: ${payment.amount} BDT</p>
               <p>Transaction ID: ${data.tran_id}</p>
               <p>Thank you for shopping with BazaarBD!</p>`,
          type: EmailType.PAYMENT_SUCCESS,
        });
      }
    } catch (error) {
      console.error('Failed to send payment confirmation email:', error);
    }
  }

  return updatedPayment;
};

export const PaymentService = {
  initiatePayment,
  verifyPayment,
  getPaymentStatus,
  getPaymentHistory,
  initiateRefund,
  getPaymentAnalytics,
  handleSSLCommerzIPN,
};

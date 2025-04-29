import axios from 'axios';
import config from '../../../config';
import prisma from '../../../shared/prisma';
import { sendEmailNotification } from '../emailNotification/emailNotification.utils';

const SSLCommerz_URL = 'https://securepay.sslcommerz.com/gwprocess/v4/api.php';
const VALIDATION_URL =
  'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php';

const siteURL = process.env.SITE_URL || 'https://localhost:5000';

export const initiateSSLCommerzPayment = async (orderId: string) => {
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

  const payment = await prisma.payment.create({
    data: {
      orderId,
      amount: order.total,
      method: 'SSL_COMMERZ',
      gateway: 'SSLCOMMERZ',
      status: 'PENDING',
    },
  });

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

export const handleSSLCommerzIPN = async (ipnData: any) => {
  const val_id = ipnData.val_id;

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

  const payment = await prisma.payment.findFirst({
    where: { transactionId: data.tran_id },
  });

  if (!payment) throw new Error('Payment not found');

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'CAPTURED',
      gatewayStatus: data.status,
      paidAt: new Date(data.transaction_date),
      gatewayResponse: data,
    },
  });

  // Update order status
  await prisma.order.update({
    where: { id: payment.orderId },
    data: {
      status: 'COMPLETED',
    },
  });

  const order = await prisma.order.findUnique({
    where: { id: payment.orderId },
    include: { customer: true },
  });

  if (!order || !order.customer) throw new Error('Order or customer not found');

  const user = await prisma.user.findUnique({
    where: { id: order.customer.userId },
  });

  if (!user) throw new Error('User not found');

  // Update payment
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'CAPTURED',
      gatewayStatus: data.status,
      paidAt: new Date(data.transaction_date),
      gatewayResponse: data,
    },
  });

  // Update order
  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'COMPLETED',
    },
  });

  // Send payment success email
  try {
    await sendEmailNotification({
      userId: user.id,
      toEmail: user.email,
      subject: 'Payment Successful - BazaarBD',
      body: `<p>Dear ${order.customer.firstName},</p>
           <p>Your payment for order <strong>${order.id}</strong> was successful.</p>
           <p>Thank you for shopping with BazaarBD!</p>`,
      type: 'PAYMENT_SUCCESS',
    });
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
  }

  return payment;
};

export const PaymentService = {
  initiateSSLCommerzPayment,
  handleSSLCommerzIPN,
};

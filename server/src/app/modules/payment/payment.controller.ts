import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PaymentService } from './payment.service';

// 🚀 Initiate Payment (Frontend will call this to start SSLCommerz payment)
const initiatePayment = catchAsync(async (req: Request, res: Response) => {
  const { orderId, paymentMethod } = req.body;

  if (!orderId) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Order ID is required.',
    });
  }

  const paymentUrl = await PaymentService.initiatePayment(
    orderId,
    paymentMethod
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment initiated successfully!',
    data: {
      paymentUrl,
    },
  });
});

// ✅ SSLCommerz IPN (Instant Payment Notification) Handler
const sslCommerzIPN = catchAsync(async (req: Request, res: Response) => {
  const ipnData = req.body;

  if (!ipnData || !ipnData.val_id) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Invalid IPN data received.',
    });
  }

  const payment = await PaymentService.handleSSLCommerzIPN(ipnData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment captured successfully!',
    data: payment,
  });
});

// 🔍 Verify Payment Status
const verifyPayment = catchAsync(async (req: Request, res: Response) => {
  const { paymentId } = req.params;
  const payment = await PaymentService.verifyPayment(paymentId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment verification completed!',
    data: payment,
  });
});

// 📊 Get Payment Status
const getPaymentStatus = catchAsync(async (req: Request, res: Response) => {
  const { paymentId } = req.params;
  const status = await PaymentService.getPaymentStatus(paymentId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment status retrieved successfully!',
    data: status,
  });
});

// 📜 Get Payment History
const getPaymentHistory = catchAsync(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const history = await PaymentService.getPaymentHistory(orderId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment history retrieved successfully!',
    data: history,
  });
});

// 💰 Initiate Refund
const initiateRefund = catchAsync(async (req: Request, res: Response) => {
  const { paymentId } = req.params;
  const { amount, reason } = req.body;

  const refund = await PaymentService.initiateRefund(paymentId, amount, reason);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Refund initiated successfully!',
    data: refund,
  });
});

// 📈 Get Payment Analytics
const getPaymentAnalytics = catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;
  const analytics = await PaymentService.getPaymentAnalytics(
    startDate as string,
    endDate as string
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment analytics retrieved successfully!',
    data: analytics,
  });
});

export const PaymentController = {
  initiatePayment,
  sslCommerzIPN,
  verifyPayment,
  getPaymentStatus,
  getPaymentHistory,
  initiateRefund,
  getPaymentAnalytics,
};

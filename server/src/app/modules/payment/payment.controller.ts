import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PaymentService } from './payment.service';

// 🚀 Initiate Payment (Frontend will call this to start SSLCommerz payment)
const initiatePayment = catchAsync(async (req: Request, res: Response) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Order ID is required.',
    });
  }

  const paymentUrl = await PaymentService.initiateSSLCommerzPayment(orderId);

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

export const PaymentController = {
  initiatePayment,
  sslCommerzIPN,
};

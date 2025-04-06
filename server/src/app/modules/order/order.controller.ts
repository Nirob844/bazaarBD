import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { OrderService } from './order.service';

// 🛒 Convert Cart to Order (Checkout)
const cartToOrder = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as JwtPayload;
  if (!userId) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  const result = await OrderService.cartToOrder(userId);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Order placed successfully!',
    data: result,
  });
});

// 📦 Get All Orders
const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, paginationFields);
  const result = await OrderService.getAllOrders(options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All Orders fetched successfully!',
    meta: result.meta,
    data: result.data,
  });
});

// 📦 Get Orders for Id
const getDataById = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getDataById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User orders fetched successfully!',
    data: result,
  });
});

// 📦 Get Orders for a User
const getUserOrders = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as JwtPayload;
  if (!userId) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  const options = pick(req.query, paginationFields);
  const result = await OrderService.getUserOrders(userId, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User orders fetched successfully!',
    meta: result.meta,
    data: result.data,
  });
});

// ✅ Update Order Status
const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.body;
  const result = await OrderService.updateOrderStatus(req.params.id, status);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Order status updated successfully!',
    data: result,
  });
});

// ❌ Delete Order
const deleteOrder = catchAsync(async (req: Request, res: Response) => {
  const { orderId } = req.params;

  if (!orderId) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Order ID is required!',
    });
  }

  await OrderService.deleteOrder(orderId);

  sendResponse(res, {
    statusCode: httpStatus.NO_CONTENT,
    success: true,
    message: 'Order deleted successfully!',
  });
});

export const OrderController = {
  cartToOrder,
  getAllOrders,
  getUserOrders,
  getDataById,
  updateOrderStatus,
  deleteOrder,
};

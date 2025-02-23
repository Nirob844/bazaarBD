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

export const OrderController = {
  cartToOrder,
  getUserOrders,
};

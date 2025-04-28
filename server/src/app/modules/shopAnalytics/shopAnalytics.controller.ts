import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ShopAnalyticsService } from './shopAnalytics.service';

const getAnalytics = catchAsync(async (req: Request, res: Response) => {
  const { shopId } = req.params;
  const result = await ShopAnalyticsService.getShopAnalytics(shopId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'shop analytics fetched successfully',
    data: result,
  });
});

export const ShopAnalyticsController = { getAnalytics };

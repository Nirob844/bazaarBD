import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AdminAnalyticsService } from './adminAnalytics.service';

const getAnalytics = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminAnalyticsService.getAdminAnalytics();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'shop analytics fetched successfully',
    data: result,
  });
});

export const AdminAnalyticsController = { getAnalytics };

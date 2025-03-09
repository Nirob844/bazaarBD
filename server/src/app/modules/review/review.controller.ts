import { Review } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { ReviewService } from './review.service';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as JwtPayload;
  console.log('userId', userId);
  req.body.userId = userId;
  const result = await ReviewService.insertIntoDB(req.body);
  sendResponse<Review>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review Created!!',
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, paginationFields);
  const result = await ReviewService.getAllFromDB(options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review data fetched!!',
    meta: result.meta,
    data: result.data,
  });
});

const getDataById = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getDataById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review data fetched!!',
    data: result,
  });
});

const updateOneInDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ReviewService.updateOneInDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review updated successfully',
    data: result,
  });
});

const deleteByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ReviewService.deleteByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Review delete successfully',
    data: result,
  });
});

export const ReviewController = {
  insertIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
};

import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ProductImageService } from './productImage.service';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductImageService.insertIntoDB(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'ProductImage created successfully',
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductImageService.getAllFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'ProductImage data fetched successfully',
    data: result,
  });
});

const deleteFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductImageService.deleteFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'ProductImage deleted successfully',
    data: result,
  });
});

export const ProductImageController = {
  insertIntoDB,
  getAllFromDB,
  deleteFromDB,
};

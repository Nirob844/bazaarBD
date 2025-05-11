import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { ProductImageService } from './product-image.service';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductImageService.insertIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product image created successfully',
    data: result,
  });
});

const bulkInsertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductImageService.bulkInsertIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product images created successfully',
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['productId', 'isPrimary']);
  const paginationOptions = pick(req.query, paginationFields);

  const result = await ProductImageService.getAllFromDB(
    filters,
    paginationOptions
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product images fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getDataById = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductImageService.getDataById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product image fetched successfully',
    data: result,
  });
});

const updateOneInDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductImageService.updateOneInDB(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product image updated successfully',
    data: result,
  });
});

const deleteByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductImageService.deleteByIdFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product image deleted successfully',
    data: result,
  });
});

const getProductImages = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductImageService.getProductImages(
    req.params.productId
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product images fetched successfully',
    data: result,
  });
});

const setPrimaryImage = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductImageService.setPrimaryImage(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Primary image set successfully',
    data: result,
  });
});

export const ProductImageController = {
  insertIntoDB,
  bulkInsertIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
  getProductImages,
  setPrimaryImage,
};

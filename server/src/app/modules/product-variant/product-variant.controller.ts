import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { ProductVariantService } from './product-variant.service';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductVariantService.insertIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product variant created successfully',
    data: result,
  });
});

const bulkInsertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductVariantService.bulkInsertIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product variants created successfully',
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, [
    'productId',
    'searchTerm',
    'stockStatus',
    'isActive',
    'isVisible',
  ]);
  const paginationOptions = pick(req.query, paginationFields);

  const result = await ProductVariantService.getAllFromDB(
    filters,
    paginationOptions
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product variants fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getDataById = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductVariantService.getDataById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product variant fetched successfully',
    data: result,
  });
});

const updateOneInDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductVariantService.updateOneInDB(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product variant updated successfully',
    data: result,
  });
});

const deleteByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductVariantService.deleteByIdFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product variant deleted successfully',
    data: result,
  });
});

const getProductVariants = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductVariantService.getProductVariants(
    req.params.productId
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product variants fetched successfully',
    data: result,
  });
});

export const ProductVariantController = {
  insertIntoDB,
  bulkInsertIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
  getProductVariants,
};

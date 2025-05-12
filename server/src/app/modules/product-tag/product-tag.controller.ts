import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import prisma from '../../../shared/prisma';
import sendResponse from '../../../shared/sendResponse';
import { ProductTagService } from './product-tag.service';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductTagService.insertIntoDB(prisma, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product tag created successfully',
    data: result,
  });
});

const bulkInsertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductTagService.bulkInsertIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product tags created successfully',
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm']);
  const paginationOptions = pick(req.query, paginationFields);

  const result = await ProductTagService.getAllFromDB(
    filters,
    paginationOptions
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product tags fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getDataById = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductTagService.getDataById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product tag fetched successfully',
    data: result,
  });
});

const updateOneInDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductTagService.updateOneInDB(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product tag updated successfully',
    data: result,
  });
});

const deleteByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductTagService.deleteByIdFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product tag deleted successfully',
    data: result,
  });
});

const getProductsByTag = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductTagService.getProductsByTag(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Products fetched successfully for the tag',
    data: result,
  });
});

export const ProductTagController = {
  insertIntoDB,
  bulkInsertIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
  getProductsByTag,
};

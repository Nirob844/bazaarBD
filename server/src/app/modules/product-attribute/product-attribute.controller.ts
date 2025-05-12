import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import prisma from '../../../shared/prisma';
import sendResponse from '../../../shared/sendResponse';
import { ProductAttributeService } from './product-attribute.service';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductAttributeService.insertIntoDB(prisma, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product attribute created successfully',
    data: result,
  });
});

const bulkInsertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductAttributeService.bulkInsertIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product attributes created successfully',
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['productId', 'attributeId', 'searchTerm']);
  const paginationOptions = pick(req.query, paginationFields);

  const result = await ProductAttributeService.getAllFromDB(
    filters,
    paginationOptions
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product attributes fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getDataById = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductAttributeService.getDataById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product attribute fetched successfully',
    data: result,
  });
});

const updateOneInDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductAttributeService.updateOneInDB(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product attribute updated successfully',
    data: result,
  });
});

const deleteByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductAttributeService.deleteByIdFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product attribute deleted successfully',
    data: result,
  });
});

const getProductAttributes = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductAttributeService.getProductAttributes(
    req.params.productId
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product attributes fetched successfully',
    data: result,
  });
});

export const ProductAttributeController = {
  insertIntoDB,
  bulkInsertIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
  getProductAttributes,
};

import { ProductAttribute } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { ProductAttributeService } from './attribute.service';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductAttributeService.insertIntoDB(req.body);
  sendResponse<ProductAttribute>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'ProductAttribute Created!!',
    data: result,
  });
});

const insertManyIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductAttributeService.insertManyIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'ProductAttribute Created!!',
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, paginationFields);
  const result = await ProductAttributeService.getAllFromDB(options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'ProductAttribute data fetched!!',
    meta: result.meta,
    data: result.data,
  });
});

const getDataById = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductAttributeService.getDataById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'ProductAttribute data fetched!!',
    data: result,
  });
});

const updateOneInDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductAttributeService.updateOneInDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'ProductAttribute updated successfully',
    data: result,
  });
});

const deleteByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductAttributeService.deleteByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'ProductAttribute delete successfully',
    data: result,
  });
});

export const ProductAttributeController = {
  insertIntoDB,
  insertManyIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
};

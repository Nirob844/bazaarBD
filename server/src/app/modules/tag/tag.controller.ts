import { ProductTag } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { ProductTagService } from './tag.service';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductTagService.insertIntoDB(req.body);
  sendResponse<ProductTag>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'ProductTag Created!!',
    data: result,
  });
});

const insertManyIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductTagService.insertManyIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'ProductTag Created!!',
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, paginationFields);
  const result = await ProductTagService.getAllFromDB(options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'ProductTag data fetched!!',
    meta: result.meta,
    data: result.data,
  });
});

const getDataById = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductTagService.getDataById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'ProductTag data fetched!!',
    data: result,
  });
});

const updateOneInDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductTagService.updateOneInDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'ProductTag updated successfully',
    data: result,
  });
});

const deleteByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductTagService.deleteByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'ProductTag delete successfully',
    data: result,
  });
});

export const ProductTagController = {
  insertIntoDB,
  insertManyIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
};

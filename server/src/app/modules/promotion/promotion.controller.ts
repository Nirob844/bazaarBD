import { Promotion } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { PromotionService } from './promotion.service';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await PromotionService.insertIntoDB(req.body);
  sendResponse<Promotion>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Promotion Created!!',
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, paginationFields);
  const result = await PromotionService.getAllFromDB(options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Promotion data fetched!!',
    meta: result.meta,
    data: result.data,
  });
});

const getDataById = catchAsync(async (req: Request, res: Response) => {
  const result = await PromotionService.getDataById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Promotion data fetched!!',
    data: result,
  });
});

const updateOneInDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PromotionService.updateOneInDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Promotion updated successfully',
    data: result,
  });
});

const deleteByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PromotionService.deleteByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Promotion delete successfully',
    data: result,
  });
});

export const PromotionController = {
  insertIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
};

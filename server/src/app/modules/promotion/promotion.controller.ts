import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import prisma from '../../../shared/prisma';
import sendResponse from '../../../shared/sendResponse';
import { PromotionService } from './promotion.service';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await PromotionService.insertIntoDB(prisma, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Promotion created successfully',
    data: result,
  });
});

const bulkInsertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await PromotionService.bulkInsertIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Promotions created successfully',
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, [
    'productId',
    'type',
    'isActive',
    'startDate',
    'endDate',
  ]);
  const paginationOptions = pick(req.query, paginationFields);

  const result = await PromotionService.getAllFromDB(
    filters,
    paginationOptions
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Promotions fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getDataById = catchAsync(async (req: Request, res: Response) => {
  const result = await PromotionService.getDataById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Promotion fetched successfully',
    data: result,
  });
});

const updateOneInDB = catchAsync(async (req: Request, res: Response) => {
  const result = await PromotionService.updateOneInDB(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Promotion updated successfully',
    data: result,
  });
});

const deleteByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await PromotionService.deleteByIdFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Promotion deleted successfully',
    data: result,
  });
});

const getProductPromotions = catchAsync(async (req: Request, res: Response) => {
  const result = await PromotionService.getProductPromotions(
    req.params.productId
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product promotions fetched successfully',
    data: result,
  });
});

const incrementPromotionUses = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PromotionService.incrementPromotionUses(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Promotion usage incremented successfully',
      data: result,
    });
  }
);

export const PromotionController = {
  insertIntoDB,
  bulkInsertIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
  getProductPromotions,
  incrementPromotionUses,
};

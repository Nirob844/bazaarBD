import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { InventoryHistoryService } from './inventory-history.service';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await InventoryHistoryService.insertIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Inventory history created successfully',
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, [
    'inventoryId',
    'action',
    'startDate',
    'endDate',
    'referenceType',
  ]);
  const paginationOptions = pick(req.query, paginationFields);

  const result = await InventoryHistoryService.getAllFromDB(
    filters,
    paginationOptions
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Inventory history fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getDataById = catchAsync(async (req: Request, res: Response) => {
  const result = await InventoryHistoryService.getDataById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Inventory history fetched successfully',
    data: result,
  });
});

const getInventoryHistory = catchAsync(async (req: Request, res: Response) => {
  const paginationOptions = pick(req.query, paginationFields);
  const result = await InventoryHistoryService.getInventoryHistory(
    req.params.inventoryId,
    paginationOptions
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Inventory history fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getInventoryStats = catchAsync(async (req: Request, res: Response) => {
  const result = await InventoryHistoryService.getInventoryStats(
    req.params.inventoryId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Inventory stats fetched successfully',
    data: result,
  });
});

export const InventoryHistoryController = {
  insertIntoDB,
  getAllFromDB,
  getDataById,
  getInventoryHistory,
  getInventoryStats,
};

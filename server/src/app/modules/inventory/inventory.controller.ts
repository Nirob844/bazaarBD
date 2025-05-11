import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { InventoryService } from './inventory.service';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await InventoryService.insertIntoDB(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Inventory created successfully',
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, [
    'searchTerm',
    'productId',
    'variantId',
    'location',
    'lowStock',
  ]);
  const paginationOptions = pick(req.query, paginationFields);

  const result = await InventoryService.getAllFromDB(
    filters,
    paginationOptions
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Inventories fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getDataById = catchAsync(async (req: Request, res: Response) => {
  const result = await InventoryService.getDataById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Inventory fetched successfully',
    data: result,
  });
});

const updateOneInDB = catchAsync(async (req: Request, res: Response) => {
  const result = await InventoryService.updateOneInDB(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Inventory updated successfully',
    data: result,
  });
});

const deleteByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await InventoryService.deleteByIdFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Inventory deleted successfully',
    data: result,
  });
});

const reserveStock = catchAsync(async (req: Request, res: Response) => {
  const { quantity } = req.body;
  const result = await InventoryService.reserveStock(req.params.id, quantity);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Stock reserved successfully',
    data: result,
  });
});

const releaseStock = catchAsync(async (req: Request, res: Response) => {
  const { quantity } = req.body;
  const result = await InventoryService.releaseStock(req.params.id, quantity);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Stock released successfully',
    data: result,
  });
});

const getInventorySummary = catchAsync(async (req: Request, res: Response) => {
  const result = await InventoryService.getInventorySummary();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Inventory summary fetched successfully',
    data: result,
  });
});

export const InventoryController = {
  insertIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
  reserveStock,
  releaseStock,
  getInventorySummary,
};

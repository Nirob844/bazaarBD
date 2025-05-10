import { Shop } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { shopFilterAbleFields } from './shop.constants';
import { ShopService } from './shop.service';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ShopService.insertIntoDB(req);
  sendResponse<Shop>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shop Created!!',
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, shopFilterAbleFields);
  const options = pick(req.query, paginationFields);
  const result = await ShopService.getAllFromDB(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shop data fetched!!',
    meta: result.meta,
    data: result.data,
  });
});

const getDataById = catchAsync(async (req: Request, res: Response) => {
  const result = await ShopService.getDataById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shop data fetched!!',
    data: result,
  });
});

const updateOneInDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ShopService.updateOneInDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shop updated successfully',
    data: result,
  });
});

const deleteByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ShopService.deleteByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shop delete successfully',
    data: result,
  });
});

// New controller methods
const getShopProducts = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const options = pick(req.query, paginationFields);
  const result = await ShopService.getShopProducts(id, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shop products fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getFeaturedShops = catchAsync(async (req: Request, res: Response) => {
  const result = await ShopService.getFeaturedShops();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Featured shops fetched successfully',
    data: result,
  });
});

const getShopAnalytics = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ShopService.getShopAnalytics(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shop analytics fetched successfully',
    data: result,
  });
});

const getVendorDashboard = catchAsync(async (req: Request, res: Response) => {
  const result = await ShopService.getVendorDashboard(req.user?.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vendor dashboard data fetched successfully',
    data: result,
  });
});

const updateShopStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ShopService.updateShopStatus(id, req.body.status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shop status updated successfully',
    data: result,
  });
});

const getVendorStats = catchAsync(async (req: Request, res: Response) => {
  const result = await ShopService.getVendorStats(req.user?.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vendor stats fetched successfully',
    data: result,
  });
});

export const ShopController = {
  insertIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
  getShopProducts,
  getFeaturedShops,
  getShopAnalytics,
  getVendorDashboard,
  updateShopStatus,
  getVendorStats,
};

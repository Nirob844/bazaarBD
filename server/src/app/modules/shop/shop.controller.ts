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
  sendResponse<Shop>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shop data fetched!!',
    data: result,
  });
});

const updateOneInDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ShopService.updateOneInDB(id, req.body);
  sendResponse<Shop>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shop Updated Successfully!!',
    data: result,
  });
});

const deleteByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ShopService.deleteByIdFromDB(id);
  sendResponse<Shop>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shop Deleted Successfully!!',
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
    message: 'Shop Products fetched!!',
    meta: result.meta,
    data: result.data,
  });
});

const getFeaturedShops = catchAsync(async (req: Request, res: Response) => {
  const result = await ShopService.getFeaturedShops();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Featured Shops fetched!!',
    data: result,
  });
});

const getShopAnalytics = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ShopService.getShopAnalytics(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shop Analytics fetched!!',
    data: result,
  });
});

const getVendorDashboard = catchAsync(async (req: Request, res: Response) => {
  const result = await ShopService.getVendorDashboard(req.user?.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vendor Dashboard fetched!!',
    data: result,
  });
});

const updateShopStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const result = await ShopService.updateShopStatus(id, isActive);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shop Status Updated!!',
    data: result,
  });
});

const getVendorStats = catchAsync(async (req: Request, res: Response) => {
  const result = await ShopService.getVendorStats(req.user?.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vendor Stats fetched!!',
    data: result,
  });
});

// New controller methods
const getShopReviews = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const options = pick(req.query, paginationFields);
  const result = await ShopService.getShopReviews(id, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shop Reviews fetched!!',
    meta: result.meta,
    data: result.data,
  });
});

const getShopTimeStats = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { period = 'daily' } = req.query;
  const result = await ShopService.getShopTimeStats(
    id,
    period as 'daily' | 'weekly' | 'monthly'
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shop Time Stats fetched!!',
    data: result,
  });
});

const updateShopVerification = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isVerified } = req.body;
    const result = await ShopService.updateShopVerification(id, isVerified);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Shop Verification Updated!!',
      data: result,
    });
  }
);

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
  getShopReviews,
  getShopTimeStats,
  updateShopVerification,
};

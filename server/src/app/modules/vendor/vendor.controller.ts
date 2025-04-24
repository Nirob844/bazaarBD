import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { vendorFilterableFields } from './vendor.constants';
import { VendorService } from './vendor.service';

const getAllVendors = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, vendorFilterableFields);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await VendorService.getAllVendors(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'vendors fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleVendor = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorService.getSingleVendor(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'vendor data fetched!!',
    data: result,
  });
});

const getVendorProfile = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as JwtPayload;
  const result = await VendorService.getVendorProfile(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'vendor data fetched!!',
    data: result,
  });
});

const updateVendor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log('update vendor', req.body);
  const result = await VendorService.updateVendor(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'vendor updated successfully',
    data: result,
  });
});

const deleteVendor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await VendorService.deleteVendor(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'vendor delete successfully',
    data: result,
  });
});

export const VendorsController = {
  getAllVendors,
  getSingleVendor,
  getVendorProfile,
  updateVendor,
  deleteVendor,
};

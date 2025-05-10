import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { vendorFilterableFields } from './vendor.constants';
import { VendorService } from './vendor.service';

const createVendor = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorService.createVendor(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vendor created successfully',
    data: result,
  });
});

const getAllVendors = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, vendorFilterableFields);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await VendorService.getAllVendors(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vendors fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleVendor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await VendorService.getSingleVendor(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vendor fetched successfully',
    data: result,
  });
});

const getVendorProfile = catchAsync(async (req: Request, res: Response) => {
  const { user } = req;
  const result = await VendorService.getVendorProfile(user?.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vendor profile fetched successfully',
    data: result,
  });
});

const updateVendor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await VendorService.updateVendor(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vendor updated successfully',
    data: result,
  });
});

const deleteVendor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await VendorService.deleteVendor(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vendor deleted successfully',
    data: result,
  });
});

const getFeaturedVendors = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorService.getFeaturedVendors();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Featured vendors fetched successfully',
    data: result,
  });
});

const getPublicVendorProfile = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await VendorService.getPublicVendorProfile(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Public vendor profile fetched successfully',
      data: result,
    });
  }
);

const verifyVendor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await VendorService.verifyVendor(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vendor verified successfully',
    data: result,
  });
});

const getVendorsAnalytics = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorService.getVendorsAnalytics();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vendors analytics fetched successfully',
    data: result,
  });
});

const getVendorAnalytics = catchAsync(async (req: Request, res: Response) => {
  const { user } = req;
  const result = await VendorService.getVendorAnalytics(user?.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vendor analytics fetched successfully',
    data: result,
  });
});

const getVendorStats = catchAsync(async (req: Request, res: Response) => {
  const { user } = req;
  const result = await VendorService.getVendorStats(user?.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vendor stats fetched successfully',
    data: result,
  });
});

const updateVendorProfile = catchAsync(async (req: Request, res: Response) => {
  const { user } = req;
  const result = await VendorService.updateVendorProfile(user?.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Vendor profile updated successfully',
    data: result,
  });
});

const getVendorBankAccounts = catchAsync(
  async (req: Request, res: Response) => {
    const { user } = req;
    const result = await VendorService.getVendorBankAccounts(user?.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Vendor bank accounts fetched successfully',
      data: result,
    });
  }
);

const addBankAccount = catchAsync(async (req: Request, res: Response) => {
  const { user } = req;
  const result = await VendorService.addBankAccount(user?.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bank account added successfully',
    data: result,
  });
});

const updateBankAccount = catchAsync(async (req: Request, res: Response) => {
  const { user } = req;
  const { accountId } = req.params;
  const result = await VendorService.updateBankAccount(
    user?.id,
    accountId,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bank account updated successfully',
    data: result,
  });
});

const deleteBankAccount = catchAsync(async (req: Request, res: Response) => {
  const { user } = req;
  const { accountId } = req.params;
  const result = await VendorService.deleteBankAccount(user?.id, accountId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bank account deleted successfully',
    data: result,
  });
});

export const VendorsController = {
  createVendor,
  getAllVendors,
  getSingleVendor,
  getVendorProfile,
  updateVendor,
  deleteVendor,
  getFeaturedVendors,
  getPublicVendorProfile,
  verifyVendor,
  getVendorsAnalytics,
  getVendorAnalytics,
  getVendorStats,
  updateVendorProfile,
  getVendorBankAccounts,
  addBankAccount,
  updateBankAccount,
  deleteBankAccount,
};

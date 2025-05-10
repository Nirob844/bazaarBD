import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { CustomerService } from './customer.service';

const getAllCustomers = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, [
    'searchTerm',
    'firstName',
    'lastName',
    'phoneNumber',
    'user.isEmailVerified',
    'user.isLocked',
    'user.role',
    'user.lastLogin',
    'createdAt',
    'updatedAt',
  ]);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await CustomerService.getAllCustomers(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Customers fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleCustomer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CustomerService.getSingleCustomer(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Customer fetched successfully',
    data: result,
  });
});

const getCustomerProfile = catchAsync(async (req: Request, res: Response) => {
  const { user } = req;
  const result = await CustomerService.getCustomerProfile(user?.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Customer profile fetched successfully',
    data: result,
  });
});

const updateCustomer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CustomerService.updateCustomer(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Customer updated successfully',
    data: result,
  });
});

const deleteCustomer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CustomerService.deleteCustomer(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Customer deleted successfully',
    data: result,
  });
});

const getCustomerStats = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CustomerService.getCustomerStats(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Customer statistics fetched successfully',
    data: result,
  });
});

const getCustomerOrders = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await CustomerService.getCustomerOrders(id, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Customer orders fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

export const CustomersController = {
  getAllCustomers,
  getSingleCustomer,
  getCustomerProfile,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
  getCustomerOrders,
};

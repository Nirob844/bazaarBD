import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { customerFilterableFields } from './customer.constants';
import { CustomerService } from './customer.service';

const getAllCustomers = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, customerFilterableFields);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await CustomerService.getAllCustomers(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'customers fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSingleCustomer = catchAsync(async (req: Request, res: Response) => {
  const result = await CustomerService.getSingleCustomer(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'customer data fetched!!',
    data: result,
  });
});

const getCustomerProfile = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as JwtPayload;
  const result = await CustomerService.getCustomerProfile(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'customer data fetched!!',
    data: result,
  });
});

const updateCustomer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log('update customer', req.body);
  const result = await CustomerService.updateCustomer(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'customer updated successfully',
    data: result,
  });
});

const deleteCustomer = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CustomerService.deleteCustomer(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'customer delete successfully',
    data: result,
  });
});

export const CustomersController = {
  getAllCustomers,
  getSingleCustomer,
  getCustomerProfile,
  updateCustomer,
  deleteCustomer,
};

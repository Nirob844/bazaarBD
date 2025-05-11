import { Category } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { CategoryService } from './category.service';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.insertIntoDB(req);
  sendResponse<Category>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Category created successfully',
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'isActive']);
  const options = pick(req.query, paginationFields);
  const result = await CategoryService.getAllFromDB(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Categories fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getDataById = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getDataById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category fetched successfully',
    data: result,
  });
});

const updateOneInDB = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.updateOneInDB(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category updated successfully',
    data: result,
  });
});

const deleteByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.deleteByIdFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category deleted successfully',
    data: result,
  });
});

const getCategoryTree = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getCategoryTree();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category tree fetched successfully',
    data: result,
  });
});

const getMenuCategories = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getMenuCategories();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Menu categories fetched successfully',
    data: result,
  });
});

const getBySlug = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getBySlug(req.params.slug);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category fetched successfully',
    data: result,
  });
});

const bulkCreate = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.bulkCreate(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Categories created successfully',
    data: result,
  });
});

const bulkUpdate = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.bulkUpdate(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Categories updated successfully',
    data: result,
  });
});

const bulkDelete = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.bulkDelete(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Categories deleted successfully',
    data: result,
  });
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.updateStatus(
    req.params.id,
    req.body.isActive
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category status updated successfully',
    data: result,
  });
});

const updateOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.updateOrder(
    req.params.id,
    req.body.displayOrder
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category order updated successfully',
    data: result,
  });
});

const updateMenuVisibility = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.updateMenuVisibility(req.params.id, {
    showInMenu: req.body.showInMenu,
    showInFooter: req.body.showInFooter,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category menu visibility updated successfully',
    data: result,
  });
});

const updateMenuPosition = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.updateMenuPosition(
    req.params.id,
    req.body.menuPosition
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category menu position updated successfully',
    data: result,
  });
});

export const CategoryController = {
  insertIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
  getCategoryTree,
  getMenuCategories,
  getBySlug,
  bulkCreate,
  bulkUpdate,
  bulkDelete,
  updateStatus,
  updateOrder,
  updateMenuVisibility,
  updateMenuPosition,
};

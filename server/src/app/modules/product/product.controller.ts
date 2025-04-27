import { Product } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { productFilterAbleFields } from './product.constants';
import { ProductService } from './product.service';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.insertIntoDB(req.body);
  sendResponse<Product>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product Created!!',
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, productFilterAbleFields);
  const options = pick(req.query, paginationFields);
  const result = await ProductService.getAllFromDB(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product data fetched!!',
    meta: result.meta,
    data: result.data,
  });
});

const getAllPromotionProducts = catchAsync(
  async (req: Request, res: Response) => {
    const options = pick(req.query, paginationFields);
    const result = await ProductService.getAllPromotionProducts(options);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Product data fetched!!',
      meta: result.meta,
      data: result.data,
    });
  }
);

const getDataById = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getDataById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product data fetched!!',
    data: result,
  });
});

const getProductPromotions = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.id;
  const result = await ProductService.getProductPromotions(productId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product promotions fetched successfully!',
    data: result,
  });
});

const getProductAttributes = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.id;

  const result = await ProductService.getProductAttributes(productId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product attributes fetched successfully!',
    data: result,
  });
});
const getProductVariants = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.id;

  const result = await ProductService.getProductVariants(productId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product variants fetched successfully!',
    data: result,
  });
});

const updateOneInDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductService.updateOneInDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product updated successfully',
    data: result,
  });
});

const deleteByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ProductService.deleteByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product delete successfully',
    data: result,
  });
});

export const ProductController = {
  insertIntoDB,
  getAllFromDB,
  getAllPromotionProducts,
  getDataById,
  getProductPromotions,
  getProductAttributes,
  getProductVariants,
  updateOneInDB,
  deleteByIdFromDB,
};

import { Product, ProductVariant, Promotion } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { ProductService } from './product.service';
import { MulterFile } from './product.types';

// Helper function to handle file uploads
const getUploadedFiles = (files: any): MulterFile[] | undefined => {
  if (!files) return undefined;
  if (Array.isArray(files)) {
    return files as MulterFile[];
  }
  // If files is an object with fieldname keys, take the first array of files
  const firstFieldFiles = Object.values(files)[0];
  return Array.isArray(firstFieldFiles)
    ? (firstFieldFiles as MulterFile[])
    : undefined;
};

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.insertIntoDB(
    req.body,
    getUploadedFiles(req.files)
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product created successfully',
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, [
    'searchTerm',
    'name',
    'categoryId',
    'vendorId',
    'shopId',
    'status',
    'stockStatus',
    'featured',
    'bestSeller',
    'newArrival',
    'minPrice',
    'maxPrice',
  ]);
  const paginationOptions = pick(req.query, paginationFields);
  const result = await ProductService.getAllFromDB(filters, paginationOptions);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Products fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getAllPromotionProducts = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, ['type', 'status', 'expired']);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await ProductService.getAllPromotionProducts(
      filters,
      paginationOptions
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Promotion products fetched successfully',
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
    message: 'Product fetched successfully',
    data: result,
  });
});

const getProductPromotions = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getProductPromotions(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product promotions fetched successfully',
    data: result,
  });
});

const getProductAttributes = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getProductAttributes(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product attributes fetched successfully',
    data: result,
  });
});

const getProductVariants = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getProductVariants(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product variants fetched successfully',
    data: result,
  });
});

const updateOneInDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.updateOneInDB(
    req.params.id,
    req.body,
    getUploadedFiles(req.files)
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product updated successfully',
    data: result,
  });
});

const deleteByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  try {
    const result = await ProductService.deleteByIdFromDB(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Product and all related data deleted successfully',
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: error.message || 'Failed to delete product',
    });
  }
});

const bulkCreate = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.bulkCreate(
    req.body.products,
    getUploadedFiles(req.files)
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Products created successfully',
    data: result,
  });
});

const bulkUpdate = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.bulkUpdate(req.body.products);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Products updated successfully',
    data: result,
  });
});

const bulkDelete = catchAsync(async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: 'No product IDs provided for deletion',
      });
      return;
    }

    const result = await ProductService.bulkDelete(ids);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `${result.length} products deleted successfully`,
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: error.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: error.message || 'Failed to delete products',
    });
  }
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.updateStatus(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product status updated successfully',
    data: result,
  });
});

const updateInventory = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.updateInventory(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product inventory updated successfully',
    data: result,
  });
});

const updateMarketing = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.updateMarketing(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product marketing updated successfully',
    data: result,
  });
});

const getBestSellingProducts = catchAsync(
  async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const result = await ProductService.getBestSellingProducts(limit);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Best selling products fetched successfully',
      data: result,
    });
  }
);

const getPromotionalProducts = catchAsync(
  async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const result = await ProductService.getPromotionalProducts(limit);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Promotional products fetched successfully',
      data: result,
    });
  }
);

const getProductInventoryStatus = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ProductService.getDataById(req.params.id);
    if (!result) {
      sendResponse(res, {
        statusCode: httpStatus.NOT_FOUND,
        success: false,
        message: 'Product not found',
      });
      return;
    }

    const product = result as Product & {
      inventory?: any;
      variants?: (ProductVariant & { inventory?: any })[];
    };

    const inventoryStatus = {
      productId: product.id,
      productName: product.name,
      stockStatus: product.stockStatus,
      inventory: product.inventory,
      variants: product.variants?.map(variant => ({
        variantId: variant.id,
        variantName: variant.name,
        stockStatus: variant.stockStatus,
        inventory: variant.inventory,
      })),
    };

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Product inventory status fetched successfully',
      data: inventoryStatus,
    });
  }
);

const getProductMarketingStatus = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ProductService.getDataById(req.params.id);
    if (!result) {
      sendResponse(res, {
        statusCode: httpStatus.NOT_FOUND,
        success: false,
        message: 'Product not found',
      });
      return;
    }

    const product = result as Product & {
      promotions?: Promotion[];
    };

    const marketingStatus = {
      productId: product.id,
      productName: product.name,
      featured: product.featured,
      bestSeller: product.bestSeller,
      newArrival: product.newArrival,
      featuredUntil: product.featuredUntil,
      promotions: product.promotions,
    };

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Product marketing status fetched successfully',
      data: marketingStatus,
    });
  }
);

const getActivePromotions = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getActivePromotions();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Active promotions fetched successfully',
    data: result,
  });
});

const getUpcomingPromotions = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ProductService.getUpcomingPromotions();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Upcoming promotions fetched successfully',
      data: result,
    });
  }
);

const getExpiredPromotions = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getExpiredPromotions();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Expired promotions fetched successfully',
    data: result,
  });
});

const getPromotionStats = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getPromotionStats();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Promotion statistics fetched successfully',
    data: result,
  });
});

const getPromotionDetails = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getPromotionDetails(
    req.params.promotionId
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Promotion details fetched successfully',
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
  bulkCreate,
  bulkUpdate,
  bulkDelete,
  updateStatus,
  updateInventory,
  updateMarketing,
  getBestSellingProducts,
  getPromotionalProducts,
  getProductInventoryStatus,
  getProductMarketingStatus,
  getActivePromotions,
  getUpcomingPromotions,
  getExpiredPromotions,
  getPromotionStats,
  getPromotionDetails,
};

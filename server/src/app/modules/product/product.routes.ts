import express, { NextFunction, Request, Response } from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ProductController } from './product.controller';
import { ProductValidation } from './product.validation';

const router = express.Router();

// Public routes
router.get('/', ProductController.getAllFromDB);
router.get('/promotions', ProductController.getAllPromotionProducts);
router.get('/promotions/active', ProductController.getActivePromotions);
router.get('/promotions/upcoming', ProductController.getUpcomingPromotions);
router.get('/promotions/expired', ProductController.getExpiredPromotions);
router.get('/promotions/stats', ProductController.getPromotionStats);
router.get('/promotions/:promotionId', ProductController.getPromotionDetails);
router.get('/best-selling', ProductController.getBestSellingProducts);
router.get('/promotional', ProductController.getPromotionalProducts);
router.get('/:id', ProductController.getDataById);
router.get('/:id/promotions', ProductController.getProductPromotions);
router.get(
  '/:id/inventory-status',
  ProductController.getProductInventoryStatus
);
router.get(
  '/:id/marketing-status',
  ProductController.getProductMarketingStatus
);
router.get('/:id/attributes', ProductController.getProductAttributes);
router.get('/:id/variants', ProductController.getProductVariants);

// Protected routes - Admin and Vendor
router.post(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.VENDOR),
  FileUploadHelper.upload.single('image'),
  //validateRequest(ProductValidation.create),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    return ProductController.insertIntoDB(req, res, next);
  }
);

router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.VENDOR),
  FileUploadHelper.upload.single('image'),
  validateRequest(ProductValidation.update),
  ProductController.updateOneInDB
);

router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.VENDOR),
  validateRequest(ProductValidation.delete),
  ProductController.deleteByIdFromDB
);

// Bulk operations
router.post(
  '/bulk-create',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.VENDOR),
  FileUploadHelper.upload.array('images', 50),
  validateRequest(ProductValidation.create),
  ProductController.bulkCreate
);

router.patch(
  '/bulk-update',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.VENDOR),
  validateRequest(ProductValidation.update),
  ProductController.bulkUpdate
);

router.delete(
  '/bulk-delete',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.VENDOR),
  validateRequest(ProductValidation.delete),
  ProductController.bulkDelete
);

// Status management
router.patch(
  '/:id/status',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.VENDOR),
  validateRequest(ProductValidation.update),
  ProductController.updateStatus
);

// Inventory management
router.patch(
  '/:id/inventory',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.VENDOR),
  validateRequest(ProductValidation.update),
  ProductController.updateInventory
);

// Marketing management
router.patch(
  '/:id/marketing',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.VENDOR),
  validateRequest(ProductValidation.update),
  ProductController.updateMarketing
);

// New routes
router.get('/slug/:slug', ProductController.getProductBySlug);
router.get('/:id/related', ProductController.getRelatedProducts);
router.get('/:id/reviews', ProductController.getProductReviews);
router.get('/:id/analytics', ProductController.getProductAnalytics);

export const ProductRoutes = router;

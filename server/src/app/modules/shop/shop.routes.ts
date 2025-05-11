import express, { NextFunction, Request, Response } from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import auth from '../../middlewares/auth';
import { ShopController } from './shop.controller';

const router = express.Router();

// Public routes
router.get('/', ShopController.getAllFromDB);
router.get('/featured', ShopController.getFeaturedShops);
router.get('/search', ShopController.getAllFromDB);
router.get('/filter/active', ShopController.getAllFromDB);
router.get('/filter/verified', ShopController.getAllFromDB);

// Shop specific public routes
router.get('/:id', ShopController.getDataById);
router.get('/:id/products', ShopController.getShopProducts);
router.get('/:id/analytics', ShopController.getShopAnalytics);
router.get('/:id/reviews', ShopController.getShopReviews);
router.get('/:id/stats', ShopController.getShopTimeStats);

// Protected routes - Vendor & Admin
router.post(
  '/',
  auth(ENUM_USER_ROLE.VENDOR, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  FileUploadHelper.upload.fields([
    { name: 'banner', maxCount: 1 },
    { name: 'logo', maxCount: 1 },
  ]),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    return ShopController.insertIntoDB(req, res, next);
  }
);

router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.VENDOR),
  ShopController.updateOneInDB
);

// Admin only routes
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  ShopController.deleteByIdFromDB
);

router.patch(
  '/:id/status',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  ShopController.updateShopStatus
);

router.patch(
  '/:id/verify',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  ShopController.updateShopVerification
);

// Vendor specific routes
router.get(
  '/vendor/dashboard',
  auth(ENUM_USER_ROLE.VENDOR, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  ShopController.getVendorDashboard
);

router.get(
  '/vendor/stats',
  auth(ENUM_USER_ROLE.VENDOR, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  ShopController.getVendorStats
);

export const ShopRoutes = router;

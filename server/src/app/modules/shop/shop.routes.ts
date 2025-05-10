import express, { NextFunction, Request, Response } from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import auth from '../../middlewares/auth';
import { ShopController } from './shop.controller';

const router = express.Router();

// Public routes
router.get('/', ShopController.getAllFromDB);
router.get('/:id', ShopController.getDataById);
router.get('/:id/products', ShopController.getShopProducts);
router.get('/featured', ShopController.getFeaturedShops);
router.get('/:id/analytics', ShopController.getShopAnalytics);

// Protected routes
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

router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN),
  ShopController.deleteByIdFromDB
);

// Vendor specific routes
router.get(
  '/vendor/dashboard',
  auth(ENUM_USER_ROLE.VENDOR),
  ShopController.getVendorDashboard
);

router.patch(
  '/:id/status',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  ShopController.updateShopStatus
);

router.get(
  '/vendor/stats',
  auth(ENUM_USER_ROLE.VENDOR),
  ShopController.getVendorStats
);

export const ShopRoutes = router;

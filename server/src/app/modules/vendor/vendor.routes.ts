import express from 'express';

import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { VendorsController } from './vendor.controller';

const router = express.Router();

// Public routes
router.get('/featured', VendorsController.getFeaturedVendors);
router.get('/:id/public', VendorsController.getPublicVendorProfile);

// Admin routes
router.get(
  '/',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  VendorsController.getAllVendors
);
router.get(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  VendorsController.getSingleVendor
);
router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  VendorsController.updateVendor
);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  VendorsController.deleteVendor
);
router.patch(
  '/:id/verify',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  VendorsController.verifyVendor
);
router.get(
  '/analytics/overview',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  VendorsController.getVendorsAnalytics
);

// Vendor routes
router.get(
  '/profile',
  auth(ENUM_USER_ROLE.VENDOR),
  VendorsController.getVendorProfile
);
router.get(
  '/profile/analytics',
  auth(ENUM_USER_ROLE.VENDOR),
  VendorsController.getVendorAnalytics
);
router.get(
  '/profile/stats',
  auth(ENUM_USER_ROLE.VENDOR),
  VendorsController.getVendorStats
);
router.patch(
  '/profile/update',
  auth(ENUM_USER_ROLE.VENDOR),
  VendorsController.updateVendorProfile
);
router.get(
  '/profile/bank-accounts',
  auth(ENUM_USER_ROLE.VENDOR),
  VendorsController.getVendorBankAccounts
);
router.post(
  '/profile/bank-accounts',
  auth(ENUM_USER_ROLE.VENDOR),
  VendorsController.addBankAccount
);
router.patch(
  '/profile/bank-accounts/:accountId',
  auth(ENUM_USER_ROLE.VENDOR),
  VendorsController.updateBankAccount
);
router.delete(
  '/profile/bank-accounts/:accountId',
  auth(ENUM_USER_ROLE.VENDOR),
  VendorsController.deleteBankAccount
);

export const VendorRoutes = router;

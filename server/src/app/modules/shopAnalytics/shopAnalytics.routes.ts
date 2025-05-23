import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';

import auth from '../../middlewares/auth';
import { ShopAnalyticsController } from './shopAnalytics.controller';

const router = express.Router();

router.get(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.VENDOR),
  ShopAnalyticsController.getAnalytics
);

export const ShopAnalyticsRoutes = router;

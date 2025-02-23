import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { OrderController } from './order.controller';

const router = express.Router();

router.post(
  '/checkout',
  auth(ENUM_USER_ROLE.CUSTOMER),
  OrderController.cartToOrder
);

router.get(
  '/',
  auth(ENUM_USER_ROLE.CUSTOMER, ENUM_USER_ROLE.VENDOR, ENUM_USER_ROLE.ADMIN),
  OrderController.getUserOrders
);

export const OrderRoutes = router;

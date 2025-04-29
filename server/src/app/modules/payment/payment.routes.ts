import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { PaymentController } from './payment.controller';

const router = express.Router();

router.post(
  '/initiate',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.VENDOR,
    ENUM_USER_ROLE.CUSTOMER
  ),
  PaymentController.initiatePayment
);
router.post(
  '/ipn',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.VENDOR,
    ENUM_USER_ROLE.CUSTOMER
  ),
  PaymentController.sslCommerzIPN
);

export const PaymentRoutes = router;

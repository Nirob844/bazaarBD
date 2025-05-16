import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { PaymentController } from './payment.controller';

const router = express.Router();

// Payment Initiation
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

// Payment Gateway Callbacks
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

// Payment Verification
router.post(
  '/verify/:paymentId',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.VENDOR,
    ENUM_USER_ROLE.CUSTOMER
  ),
  PaymentController.verifyPayment
);

// Payment Status
router.get(
  '/status/:paymentId',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.VENDOR,
    ENUM_USER_ROLE.CUSTOMER
  ),
  PaymentController.getPaymentStatus
);

// Payment History
router.get(
  '/history/:orderId',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.VENDOR,
    ENUM_USER_ROLE.CUSTOMER
  ),
  PaymentController.getPaymentHistory
);

// Payment Refund
router.post(
  '/refund/:paymentId',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  PaymentController.initiateRefund
);

// Payment Analytics
router.get(
  '/analytics',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  PaymentController.getPaymentAnalytics
);

export const PaymentRoutes = router;

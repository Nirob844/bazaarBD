import express from 'express';

import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { CustomersController } from './customer.controller';

const router = express.Router();

// Admin routes
router.get(
  '/',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  CustomersController.getAllCustomers
);
router.get(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  CustomersController.getSingleCustomer
);
router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  CustomersController.updateCustomer
);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  CustomersController.deleteCustomer
);

// Customer profile routes
router.get(
  '/profile',
  auth(ENUM_USER_ROLE.CUSTOMER),
  CustomersController.getCustomerProfile
);

// Customer stats and orders routes (accessible by both customer and admin)
router.get(
  '/:id/stats',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.CUSTOMER
  ),
  CustomersController.getCustomerStats
);
router.get(
  '/:id/orders',
  auth(
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.CUSTOMER
  ),
  CustomersController.getCustomerOrders
);

export const CustomerRoutes = router;

import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { CartController } from './cart.controller';

const router = express.Router();

router.get(
  '/:customerId',
  auth(ENUM_USER_ROLE.CUSTOMER),
  CartController.getOrCreateCart
);

router.get(
  '/user/:customerId',
  auth(
    ENUM_USER_ROLE.CUSTOMER,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN
  ),
  CartController.getCartByUserId
);

router.post('/', auth(ENUM_USER_ROLE.CUSTOMER), CartController.addItemToCart);

router.patch(
  '/item/:cartItemId',
  auth(ENUM_USER_ROLE.CUSTOMER),
  CartController.updateCartItem
);

router.delete(
  '/item/:cartItemId',
  auth(ENUM_USER_ROLE.CUSTOMER),
  CartController.removeItemFromCart
);

router.delete(
  '/clear/:customerId',
  auth(ENUM_USER_ROLE.CUSTOMER),
  CartController.clearCart
);

router.delete(
  '/:customerId',
  auth(ENUM_USER_ROLE.ADMIN),
  CartController.deleteCart
);

export const CartRoutes = router;

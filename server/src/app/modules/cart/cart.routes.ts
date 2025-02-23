import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { CartController } from './cart.controller';

const router = express.Router();

router.get(
  '/:userId',
  auth(ENUM_USER_ROLE.CUSTOMER),
  CartController.getOrCreateCart
);

router.get(
  '/user/:userId',
  auth(ENUM_USER_ROLE.CUSTOMER),
  CartController.getCartByUserId
);

router.post('/', auth(ENUM_USER_ROLE.CUSTOMER), CartController.addItemToCart);

router.patch(
  '/item',
  auth(ENUM_USER_ROLE.CUSTOMER),
  CartController.updateCartItem
);

router.delete(
  '/item/:cartItemId',
  auth(ENUM_USER_ROLE.CUSTOMER),
  CartController.removeItemFromCart
);

router.delete(
  '/clear/:userId',
  auth(ENUM_USER_ROLE.CUSTOMER),
  CartController.clearCart
);

router.delete(
  '/:userId',
  auth(ENUM_USER_ROLE.ADMIN),
  CartController.deleteCart
);

export const CartRoutes = router;

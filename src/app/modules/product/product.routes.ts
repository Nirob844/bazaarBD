import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { ProductController } from './product.controller';

const router = express.Router();

router.get('/', ProductController.getAllFromDB);
router.get('/:id', ProductController.getDataById);
router.post(
  '/create-product',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.VENDOR),
  ProductController.insertIntoDB
);
router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.VENDOR),
  ProductController.updateOneInDB
);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.VENDOR),
  ProductController.deleteByIdFromDB
);

export const ProductRoutes = router;

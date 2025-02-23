import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { ProductController } from './product.controller';

const router = express.Router();

router.get('/', ProductController.getAllFromDB);
router.get('/:id', ProductController.getDataById);
router.post(
  '/create-product',
  auth(ENUM_USER_ROLE.ADMIN),
  ProductController.insertIntoDB
);
router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN),
  ProductController.updateOneInDB
);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN),
  ProductController.deleteByIdFromDB
);

export const ProductRoutes = router;

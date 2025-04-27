import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { ProductController } from './product.controller';

const router = express.Router();

router.get('/', ProductController.getAllFromDB);
router.get('/promotions', ProductController.getAllPromotionProducts);
router.get('/:id', ProductController.getDataById);
router.get('/:id/promotions', ProductController.getProductPromotions);
router.get('/:id/attributes', ProductController.getProductAttributes);
router.get('/:id/variants', ProductController.getProductVariants);
router.post(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.VENDOR),
  ProductController.insertIntoDB
);
router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.VENDOR),
  ProductController.updateOneInDB
);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.VENDOR),
  ProductController.deleteByIdFromDB
);

export const ProductRoutes = router;

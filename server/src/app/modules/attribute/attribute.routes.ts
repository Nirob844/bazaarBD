import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { ProductAttributeController } from './attribute.controller';

const router = express.Router();

router.get('/', ProductAttributeController.getAllFromDB);
router.get('/:id', ProductAttributeController.getDataById);
router.post(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  ProductAttributeController.insertIntoDB
);
router.post(
  '/create-many',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  ProductAttributeController.insertManyIntoDB
);
router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  ProductAttributeController.updateOneInDB
);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  ProductAttributeController.deleteByIdFromDB
);

export const ProductAttributeRoutes = router;

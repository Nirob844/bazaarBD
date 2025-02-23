import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { InventoryController } from './inventory.controller';

const router = express.Router();

router.get('/', InventoryController.getAllFromDB);
router.get('/:id', InventoryController.getDataById);
router.post('/', auth(ENUM_USER_ROLE.ADMIN), InventoryController.insertIntoDB);
router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN),
  InventoryController.updateOneInDB
);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN),
  InventoryController.deleteByIdFromDB
);

export const InventoryRoutes = router;

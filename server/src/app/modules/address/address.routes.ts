import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { AddressController } from './address.controller';

const router = express.Router();

router.get('/', AddressController.getAllFromDB);
router.get('/:id', AddressController.getDataById);
router.post('/', auth(ENUM_USER_ROLE.CUSTOMER), AddressController.insertIntoDB);

router.patch(
  '/:id',
  auth(
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.CUSTOMER,
    ENUM_USER_ROLE.SUPER_ADMIN
  ),
  AddressController.updateOneInDB
);
router.delete(
  '/:id',
  auth(
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.CUSTOMER,
    ENUM_USER_ROLE.SUPER_ADMIN
  ),
  AddressController.deleteByIdFromDB
);

export const AddressRoutes = router;

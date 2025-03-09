import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { ReviewController } from './review.controller';

const router = express.Router();

router.get('/', ReviewController.getAllFromDB);
router.get('/:id', ReviewController.getDataById);
router.post('/', auth(ENUM_USER_ROLE.CUSTOMER), ReviewController.insertIntoDB);
router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN),
  ReviewController.updateOneInDB
);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN),
  ReviewController.deleteByIdFromDB
);

export const ReviewRoutes = router;

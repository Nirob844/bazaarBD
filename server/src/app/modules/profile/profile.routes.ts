import express, { NextFunction, Request, Response } from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import auth from '../../middlewares/auth';
import { ProfileController } from './profile.controller';

const router = express.Router();

router.get(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.CUSTOMER, ENUM_USER_ROLE.CUSTOMER),
  ProfileController.getUserProfile
);

router.patch(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.CUSTOMER, ENUM_USER_ROLE.CUSTOMER),
  FileUploadHelper.upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    console.log('req.body', req.body.data);
    req.body = JSON.parse(req.body.data);
    return ProfileController.updateUserProfile(req, res, next);
  }
);

export const ProfileRoutes = router;

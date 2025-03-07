import express, { NextFunction, Request, Response } from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import auth from '../../middlewares/auth';
import { ProductImageController } from './productImage.controller';

const router = express.Router();

router.get('/', ProductImageController.getAllFromDB);

router.post(
  '/',
  auth(ENUM_USER_ROLE.ADMIN),
  FileUploadHelper.upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    return ProductImageController.insertIntoDB(req, res, next);
  }
);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN),
  ProductImageController.deleteFromDB
);

export const ProductImageRoutes = router;

import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { ProductImageController } from './product-image.controller';
import { ProductImageValidation } from './product-image.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(ProductImageValidation.createProductImageZodSchema),
  ProductImageController.insertIntoDB
);

router.post(
  '/bulk',
  validateRequest(ProductImageValidation.bulkCreateProductImageZodSchema),
  ProductImageController.bulkInsertIntoDB
);

router.get('/', ProductImageController.getAllFromDB);

router.get('/:id', ProductImageController.getDataById);

router.get('/product/:productId', ProductImageController.getProductImages);

router.patch(
  '/:id',
  validateRequest(ProductImageValidation.updateProductImageZodSchema),
  ProductImageController.updateOneInDB
);

router.patch(
  '/:id/primary',
  validateRequest(ProductImageValidation.setPrimaryImageZodSchema),
  ProductImageController.setPrimaryImage
);

router.delete('/:id', ProductImageController.deleteByIdFromDB);

export const ProductImageRoutes = router;

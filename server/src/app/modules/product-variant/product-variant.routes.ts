import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { ProductVariantController } from './product-variant.controller';
import { ProductVariantValidation } from './product-variant.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(ProductVariantValidation.createProductVariantZodSchema),
  ProductVariantController.insertIntoDB
);

router.post(
  '/bulk',
  validateRequest(ProductVariantValidation.bulkCreateProductVariantZodSchema),
  ProductVariantController.bulkInsertIntoDB
);

router.get('/', ProductVariantController.getAllFromDB);

router.get('/:id', ProductVariantController.getDataById);

router.get('/product/:productId', ProductVariantController.getProductVariants);

router.patch(
  '/:id',
  validateRequest(ProductVariantValidation.updateProductVariantZodSchema),
  ProductVariantController.updateOneInDB
);

router.delete('/:id', ProductVariantController.deleteByIdFromDB);

export const ProductVariantRoutes = router;

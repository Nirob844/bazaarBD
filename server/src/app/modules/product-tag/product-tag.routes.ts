import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { ProductTagController } from './product-tag.controller';
import { ProductTagValidation } from './product-tag.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(ProductTagValidation.createProductTagZodSchema),
  ProductTagController.insertIntoDB
);

router.post(
  '/bulk',
  validateRequest(ProductTagValidation.bulkCreateProductTagZodSchema),
  ProductTagController.bulkInsertIntoDB
);

router.get('/', ProductTagController.getAllFromDB);

router.get('/:id', ProductTagController.getDataById);

router.get('/:id/products', ProductTagController.getProductsByTag);

router.patch(
  '/:id',
  validateRequest(ProductTagValidation.updateProductTagZodSchema),
  ProductTagController.updateOneInDB
);

router.delete('/:id', ProductTagController.deleteByIdFromDB);

export const ProductTagRoutes = router;

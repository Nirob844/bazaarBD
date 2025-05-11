import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { ProductAttributeController } from './product-attribute.controller';
import { ProductAttributeValidation } from './product-attribute.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(ProductAttributeValidation.createProductAttributeZodSchema),
  ProductAttributeController.insertIntoDB
);

router.post(
  '/bulk',
  validateRequest(
    ProductAttributeValidation.bulkCreateProductAttributeZodSchema
  ),
  ProductAttributeController.bulkInsertIntoDB
);

router.get('/', ProductAttributeController.getAllFromDB);

router.get('/:id', ProductAttributeController.getDataById);

router.get(
  '/product/:productId',
  ProductAttributeController.getProductAttributes
);

router.patch(
  '/:id',
  validateRequest(ProductAttributeValidation.updateProductAttributeZodSchema),
  ProductAttributeController.updateOneInDB
);

router.delete('/:id', ProductAttributeController.deleteByIdFromDB);

export const ProductAttributeRoutes = router;

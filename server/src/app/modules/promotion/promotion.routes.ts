import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { PromotionController } from './promotion.controller';
import { PromotionValidation } from './promotion.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(PromotionValidation.createPromotionZodSchema),
  PromotionController.insertIntoDB
);

router.post(
  '/bulk',
  validateRequest(PromotionValidation.bulkCreatePromotionZodSchema),
  PromotionController.bulkInsertIntoDB
);

router.get('/', PromotionController.getAllFromDB);

router.get('/:id', PromotionController.getDataById);

router.get('/product/:productId', PromotionController.getProductPromotions);

router.patch(
  '/:id',
  validateRequest(PromotionValidation.updatePromotionZodSchema),
  PromotionController.updateOneInDB
);

router.delete('/:id', PromotionController.deleteByIdFromDB);

router.post('/:id/increment-uses', PromotionController.incrementPromotionUses);

export const PromotionRoutes = router;

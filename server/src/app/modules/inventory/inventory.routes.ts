import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { InventoryController } from './inventory.controller';
import { InventoryValidation } from './inventory.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(InventoryValidation.createInventoryZodSchema),
  InventoryController.insertIntoDB
);

router.get('/', InventoryController.getAllFromDB);

router.get('/summary', InventoryController.getInventorySummary);

router.get('/:id', InventoryController.getDataById);

router.patch(
  '/:id',
  validateRequest(InventoryValidation.updateInventoryZodSchema),
  InventoryController.updateOneInDB
);

router.delete('/:id', InventoryController.deleteByIdFromDB);

router.post(
  '/:id/reserve',
  validateRequest(InventoryValidation.reserveStockZodSchema),
  InventoryController.reserveStock
);

router.post(
  '/:id/release',
  validateRequest(InventoryValidation.releaseStockZodSchema),
  InventoryController.releaseStock
);

export const InventoryRoutes = router;

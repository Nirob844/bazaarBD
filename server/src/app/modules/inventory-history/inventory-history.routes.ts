import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { InventoryHistoryController } from './inventory-history.controller';
import { InventoryHistoryValidation } from './inventory-history.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(InventoryHistoryValidation.createInventoryHistoryZodSchema),
  InventoryHistoryController.insertIntoDB
);

router.get('/', InventoryHistoryController.getAllFromDB);

router.get('/:id', InventoryHistoryController.getDataById);

router.get(
  '/inventory/:inventoryId',
  InventoryHistoryController.getInventoryHistory
);

router.get(
  '/inventory/:inventoryId/stats',
  InventoryHistoryController.getInventoryStats
);

export const InventoryHistoryRoutes = router;

import express, { NextFunction, Request, Response } from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryController } from './category.controller';
import { CategoryValidation } from './category.validation';

const router = express.Router();

// Public routes
router.get('/', CategoryController.getAllFromDB);

router.get('/tree', CategoryController.getCategoryTree); // Get category hierarchy tree
router.get('/menu', CategoryController.getMenuCategories); // Get categories for menu display
router.get('/slug/:slug', CategoryController.getBySlug); // Get category by slug
// Protected routes - Admin only
router.post(
  '/',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  FileUploadHelper.upload.single('image'),
  validateRequest(CategoryValidation.create),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    return CategoryController.insertIntoDB(req, res, next);
  }
);

// Bulk operations
router.post(
  '/bulk-create',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  FileUploadHelper.upload.array('images', 10),
  validateRequest(CategoryValidation.bulkCreate),
  CategoryController.bulkCreate
);

router.patch(
  '/bulk-update',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  validateRequest(CategoryValidation.bulkUpdate),
  CategoryController.bulkUpdate
);

router.delete(
  '/bulk-delete',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  validateRequest(CategoryValidation.bulkDelete),
  CategoryController.bulkDelete
);

// Individual category operations
router.get('/:id', CategoryController.getDataById);

router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  FileUploadHelper.upload.single('image'),
  validateRequest(CategoryValidation.update),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    return CategoryController.updateOneInDB(req, res, next);
  }
);

router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  validateRequest(CategoryValidation.delete),
  CategoryController.deleteByIdFromDB
);

// Status management
router.patch(
  '/:id/status',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  validateRequest(CategoryValidation.updateStatus),
  CategoryController.updateStatus
);

router.patch(
  '/:id/order',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  validateRequest(CategoryValidation.updateOrder),
  CategoryController.updateOrder
);

// Menu management
router.patch(
  '/:id/menu-visibility',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  validateRequest(CategoryValidation.updateMenuVisibility),
  CategoryController.updateMenuVisibility
);

router.patch(
  '/:id/menu-position',
  auth(ENUM_USER_ROLE.SUPER_ADMIN, ENUM_USER_ROLE.ADMIN),
  validateRequest(CategoryValidation.updateMenuPosition),
  CategoryController.updateMenuPosition
);

export const CategoryRoutes = router;

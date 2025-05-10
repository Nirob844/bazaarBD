import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';

import auth from '../../middlewares/auth';
import { UsersController } from './user.controller';

const router = express.Router();

// Admin routes
router.get(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UsersController.getAllUsers
);
router.get(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UsersController.getSingleUser
);
router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UsersController.updateUser
);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UsersController.deleteUser
);

// User statistics routes
router.get(
  '/stats/overview',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UsersController.getUserStats
);
router.get(
  '/stats/active',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UsersController.getActiveUsers
);
router.get(
  '/stats/role-distribution',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UsersController.getRoleDistribution
);

// Profile management routes
router.get('/profile/me', auth(), UsersController.getMyProfile);
router.patch('/profile/me', auth(), UsersController.updateMyProfile);
router.patch('/profile/me/password', auth(), UsersController.changePassword);
router.patch('/profile/me/email', auth(), UsersController.updateEmail);

// Search and filter routes
router.get(
  '/search',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UsersController.searchUsers
);
router.get(
  '/filter',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UsersController.filterUsers
);

// User verification routes
router.patch(
  '/:id/verify',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UsersController.verifyUser
);
router.patch(
  '/:id/lock',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UsersController.lockUser
);
router.patch(
  '/:id/unlock',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UsersController.unlockUser
);

export const UserRoutes = router;

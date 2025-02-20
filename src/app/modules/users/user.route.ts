import express from 'express';
import { UsersController } from './user.controller';

const router = express.Router();

router.post('/create-user', UsersController.createUser);

export const UserRoutes = router;

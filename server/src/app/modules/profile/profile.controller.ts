import { Request, Response } from 'express';
import httpStatus from 'http-status';

import { User } from '@prisma/client';
import { JwtPayload } from 'jsonwebtoken';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ProfileService } from './profile.service';

// Get user profile
const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user as JwtPayload;
  const profile = await ProfileService.getUserProfile(userId);

  sendResponse<User | null>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile retrieved successfully',
    data: profile,
  });
});

// Update user profile
const updateUserProfile = catchAsync(async (req: Request, res: Response) => {
  const updatedUser = await ProfileService.updateUserProfile(req);

  sendResponse<User>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User profile updated successfully',
    data: updatedUser,
  });
});

export const ProfileController = {
  getUserProfile,
  updateUserProfile,
};

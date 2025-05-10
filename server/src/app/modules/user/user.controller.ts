import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import { userFilterableFields } from './user.constants';
import { UserService } from './user.service';

// Get all users
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, userFilterableFields);
  const options = pick(req.query, paginationFields);
  const result = await UserService.getAllUsers(filters, options);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Users retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

// Get single user
const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getSingleUser(req.params.id);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});

// Update user
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateUser(req.params.id, req.body);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'User updated successfully',
    data: result,
  });
});

// Delete user
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.deleteUser(req.params.id);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

// Get user statistics
const getUserStats = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getUserStats();
  res.status(httpStatus.OK).json({
    success: true,
    message: 'User statistics retrieved successfully',
    data: result,
  });
});

// Get active users
const getActiveUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getActiveUsers(req.query);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Active users retrieved successfully',
    data: result,
  });
});

// Get role distribution
const getRoleDistribution = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getRoleDistribution();
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Role distribution retrieved successfully',
    data: result,
  });
});

// Get my profile
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getMyProfile(req.user?.userId);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: result,
  });
});

// Update my profile
const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateMyProfile(req.user?.userId, req.body);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

// Change password
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.changePassword(req.user?.userId, req.body);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Password changed successfully',
    data: result,
  });
});

// Update email
const updateEmail = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateEmail(req.user?.userId, req.body);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Email updated successfully',
    data: result,
  });
});

// Search users
const searchUsers = catchAsync(async (req: Request, res: Response) => {
  const { searchTerm } = req.query;
  if (!searchTerm || typeof searchTerm !== 'string') {
    res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Search term is required',
    });
    return;
  }
  const result = await UserService.searchUsers({ searchTerm });
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Users searched successfully',
    data: result,
  });
});

// Filter users
const filterUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, userFilterableFields);
  const result = await UserService.filterUsers(filters);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Users filtered successfully',
    data: result,
  });
});

// Verify user
const verifyUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.verifyUser(req.params.id);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'User verified successfully',
    data: result,
  });
});

// Lock user
const lockUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.lockUser(req.params.id);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'User locked successfully',
    data: result,
  });
});

// Unlock user
const unlockUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.unlockUser(req.params.id);
  res.status(httpStatus.OK).json({
    success: true,
    message: 'User unlocked successfully',
    data: result,
  });
});

export const UsersController = {
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  getUserStats,
  getActiveUsers,
  getRoleDistribution,
  getMyProfile,
  updateMyProfile,
  changePassword,
  updateEmail,
  searchUsers,
  filterUsers,
  verifyUser,
  lockUser,
  unlockUser,
};

import { comparePassword, getUserByEmail, hashPassword } from './auth.utils';

import httpStatus from 'http-status';

import { User } from '@prisma/client';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import prisma from '../../../shared/prisma';
import {
  ILoginUser,
  ILoginUserResponse,
  UserWithProfile,
} from './auth.interface';

const registerUser = async (data: UserWithProfile): Promise<User> => {
  // Check if the email or username already exists
  const isUserExist = await getUserByEmail(data.email);

  if (isUserExist) {
    throw new Error('Email is already in use!');
  }
  // Hash the password before storing it using the utility
  const hashedPassword = await hashPassword(data.password);

  // Create user and profile in a transaction
  const result = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
    },
  });

  return result;
};

const loginUser = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  const { email, password } = payload;

  if (!email || !password) {
    throw new ApiError(httpStatus.NOT_FOUND, 'email & password needed');
  }
  const isUserExist = await getUserByEmail(email);

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }

  // Use comparePassword to check if the provided password matches the stored hashed password
  const passwordMatched = await comparePassword(password, isUserExist.password);

  if (!passwordMatched) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect');
  }

  //create access token & refresh token
  const { id: userId, role } = isUserExist;

  const accessToken = jwtHelpers.createToken(
    { userId, role },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );
  // console.log('accessToken', accessToken);
  const refreshToken = jwtHelpers.createToken(
    { userId, role },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const AuthService = {
  registerUser,
  loginUser,
};

import { comparePassword, getUserByEmail, hashPassword } from './auth.utils';

import httpStatus from 'http-status';

import { User } from '@prisma/client';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import prisma from '../../../shared/prisma';
import { AdminAnalyticsService } from '../adminAnalytics/adminAnalytics.service';
import { sendEmailNotification } from '../emailNotification/emailNotification.utils';
import { verificationCodeService } from '../verificationCode/verificationCode.service';
import { MAX_FAILED_ATTEMPTS } from './auth.constant';
import {
  ILoginUser,
  ILoginUserResponse,
  IRegisterUser,
} from './auth.interface';

const registerUser = async (data: IRegisterUser): Promise<User> => {
  const { email, password, role } = data;

  const isUserExist = await getUserByEmail(email);
  if (isUserExist) {
    throw new Error('Email is already in use!');
  }

  const hashedPassword = await hashPassword(password);

  // Declare user outside so it's accessible afterward
  let createdUser: User;

  await prisma.$transaction(async tx => {
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    });

    createdUser = user; // store user for later use

    if (role === 'VENDOR') {
      if (!data.businessName || !data.businessEmail || !data.businessPhone) {
        throw new Error(
          'Vendor must provide businessName, businessEmail, and businessPhone'
        );
      }

      await tx.vendor.create({
        data: {
          userId: user.id,
          businessName: data.businessName,
          businessEmail: data.businessEmail,
          businessPhone: data.businessPhone,
          taxId: data.taxId,
          verificationDocuments: data.verificationDocuments,
        },
      });
    } else if (role === 'ADMIN') {
      await tx.admin.create({
        data: {
          userId: user.id,
        },
      });
    } else {
      if (!data.firstName || !data.lastName) {
        throw new Error('Customer must provide firstName and lastName');
      }

      await tx.customer.create({
        data: {
          userId: user.id,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          avatar: data.avatar,
        },
      });
    }

    // Update admin analytics inside transaction
    await AdminAnalyticsService.updateAdminAnalytics();
  });

  // ✅ Call createVerificationCode AFTER transaction finishes
  const code = await verificationCodeService.createVerificationCode(
    createdUser!.id
  );

  await sendEmailNotification({
    userId: createdUser!.id,
    toEmail: createdUser!.email,
    type: 'ACCOUNT_CONFIRMATION',
    subject: 'Verify Your BazaarBD Account',
    body: `
    <p>Welcome to BazaarBD!</p>
    <p>Your verification code is: <strong>${code}</strong></p>
    <p>This code will expire in 15 minutes.</p>
  `,
  });

  return createdUser!;
};

const loginUser = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  const { email, password } = payload;

  if (!email || !password) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email & password are required');
  }

  const user = await getUserByEmail(email);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }

  if (user.isLocked) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Account is locked due to too many failed login attempts'
    );
  }

  // check email varification
  if (!user.isEmailVerified) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Email is not verified. Please check your email for the verification link.'
    );
  }

  const passwordMatched = await comparePassword(password, user.password);

  if (!passwordMatched) {
    const updatedFailedAttempts = user.failedLoginAttempts + 1;

    // Update failed attempts and lock the user if exceeded threshold
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: updatedFailedAttempts,
        isLocked: updatedFailedAttempts >= MAX_FAILED_ATTEMPTS,
      },
    });

    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect');
  }

  // On successful login: update lastLogin and reset failed attempts
  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLogin: new Date(),
      failedLoginAttempts: 0,
      isLocked: false,
    },
  });

  const { id: userId, role } = user;

  const accessToken = jwtHelpers.createToken(
    { userId, role },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

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

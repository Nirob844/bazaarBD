import { User } from '@prisma/client';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import prisma from '../../../shared/prisma';
import { logger } from '../../../utils/logger';
import { AdminAnalyticsService } from '../adminAnalytics/adminAnalytics.service';
import { MAX_FAILED_ATTEMPTS } from './auth.constant';
import {
  ILoginUser,
  ILoginUserResponse,
  IRegisterUser,
} from './auth.interface';
import { comparePassword, getUserByEmail, hashPassword } from './auth.utils';

const registerUser = async (data: IRegisterUser): Promise<User> => {
  const { email, password, role } = data;

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Please provide a valid email address'
    );
  }

  // Validate password strength
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
    );
  }

  const isUserExist = await getUserByEmail(email);
  if (isUserExist) {
    throw new ApiError(
      httpStatus.CONFLICT,
      'This email address is already registered. Please use a different email or try logging in.'
    );
  }

  const hashedPassword = await hashPassword(password);

  let createdUser: User;

  await prisma.$transaction(async tx => {
    const user = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    });

    createdUser = user;

    if (role === 'VENDOR') {
      if (!data.businessName || !data.businessEmail || !data.businessPhone) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Business registration requires business name, email, and phone number'
        );
      }

      // Validate business email format
      if (!emailRegex.test(data.businessEmail)) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Please provide a valid business email address'
        );
      }

      // Validate business phone format (basic validation)
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(data.businessPhone)) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Please provide a valid business phone number'
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
      if (!data.firstName || !data.lastName) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'First name and last name are required for admin registration'
        );
      }

      await tx.admin.create({
        data: {
          userId: user.id,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
        },
      });
    } else {
      if (!data.firstName || !data.lastName) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'First name and last name are required for customer registration'
        );
      }

      // Validate phone format for customers if provided
      if (data.phone) {
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(data.phone)) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            'Please provide a valid phone number'
          );
        }
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

    await AdminAnalyticsService.updateAdminAnalytics();
  });

  // todo: send email verification code
  // const code = await verificationCodeService.createVerificationCode(
  //   createdUser!.id
  // );

  // await sendTemplateEmail(EmailType.ACCOUNT_CONFIRMATION, {
  //   userId: createdUser!.id,
  //   toEmail: createdUser!.email,
  //   templateData: {
  //     code: code,
  //   },
  // });

  return createdUser!;
};

const loginUser = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  const { email, password } = payload;

  if (!email || !password) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Please provide both email and password to login'
    );
  }

  const user = await getUserByEmail(email);

  if (!user) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'No account found with this email address. Please check your email or register a new account.'
    );
  }

  if (user.isLocked) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Your account has been temporarily locked due to multiple failed login attempts. Please try again later or contact support for assistance.'
    );
  }
  // todo: check if email is verified
  // if (!user.isEmailVerified) {
  //   throw new ApiError(
  //     httpStatus.FORBIDDEN,
  //     'Please verify your email address before logging in. Check your inbox for the verification email.'
  //   );
  // }

  const passwordMatched = await comparePassword(password, user.password);

  if (!passwordMatched) {
    const updatedFailedAttempts = user.failedLoginAttempts + 1;
    const remainingAttempts = MAX_FAILED_ATTEMPTS - updatedFailedAttempts;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: updatedFailedAttempts,
        isLocked: updatedFailedAttempts >= MAX_FAILED_ATTEMPTS,
      },
    });

    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      remainingAttempts > 0
        ? `Invalid password. You have ${remainingAttempts} login attempts remaining.`
        : 'Account locked due to too many failed attempts. Please contact support.'
    );
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

const createSuperAdmin = async (): Promise<void> => {
  const superAdminEmail = config.super_admin.email;
  const superAdminPassword = config.super_admin.password;

  if (!superAdminEmail || !superAdminPassword) {
    throw new Error('Super admin credentials not configured');
  }

  // Check if super admin exists
  const existingSuperAdmin = await prisma.user.findFirst({
    where: {
      role: 'SUPER_ADMIN',
    },
  });

  if (existingSuperAdmin) {
    logger.info('Super admin user already exists');
    return;
  }

  // Create super admin user
  const hashedPassword = await hashPassword(superAdminPassword);

  await prisma.$transaction(async tx => {
    const user = await tx.user.create({
      data: {
        email: superAdminEmail,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isEmailVerified: true, // Auto verify super admin
      },
    });

    await tx.admin.create({
      data: {
        userId: user.id,
        firstName: 'Super',
        lastName: 'Admin',
        designation: 'SUPER_ADMIN',
        department: 'ADMINISTRATION',
        isActive: true,
        permissions: {
          all: true,
        },
      },
    });

    logger.info('Super admin user created successfully');
  });
};

export const AuthService = {
  registerUser,
  loginUser,
  createSuperAdmin,
};

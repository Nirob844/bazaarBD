import { Prisma, User } from '@prisma/client';
import prisma from '../../../shared/prisma';
import { hashPassword } from '../auth/auth.utils';

const getUserProfile = async (userId: string): Promise<User | null> => {
  // Step 1: Get user's role
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  if (!user) return null;

  // Step 2: Include role-specific data based on role
  const include: Prisma.UserInclude = {
    EmailNotification: true,
  };

  if (user.role === 'CUSTOMER') {
    include.customer = true;
  } else if (user.role === 'VENDOR') {
    include.vendor = true;
  } else if (user.role === 'ADMIN') {
    include.admin = true;
  }

  // Step 3: Fetch full user with conditional include
  const fullUser = await prisma.user.findUnique({
    where: { id: userId },
    include,
  });

  return fullUser;
};

const updateUserProfile = async (
  userId: string,
  payload: any
): Promise<User | null> => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      customer: true,
      vendor: true,
      admin: true,
    },
  });

  if (!existingUser) throw new Error('User not found');

  const userUpdateData: Prisma.UserUpdateInput = {};

  // Optional generic user fields
  if (payload.email) userUpdateData.email = payload.email;
  if (payload.password) {
    userUpdateData.password = await hashPassword(payload.password);
  }

  // Role-specific updates
  switch (existingUser.role) {
    case 'CUSTOMER': {
      const { firstName, lastName, phone } = payload;
      userUpdateData.customer = {
        update: {
          firstName,
          lastName,
          phone,
        },
      };
      break;
    }

    case 'VENDOR': {
      const {
        businessName,
        businessEmail,
        businessPhone,
        taxId,
        verificationDocuments,
      } = payload;
      userUpdateData.vendor = {
        update: {
          businessName,
          businessEmail,
          businessPhone,
          taxId,
          verificationDocuments,
        },
      };
      break;
    }

    case 'ADMIN': {
      // If you want to update admin-specific fields in the future
      // Currently Admin model doesn't have any additional fields
      break;
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: userUpdateData,
    include: {
      customer: true,
      vendor: true,
      admin: true,
    },
  });

  return updatedUser;
};

export const ProfileService = {
  getUserProfile,
  updateUserProfile,
};

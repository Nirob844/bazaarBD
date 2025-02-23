import { User, UserProfile } from '@prisma/client';
import prisma from '../../../shared/prisma';

const getUserProfile = async (userId: string): Promise<User | null> => {
  const profile = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      cart: true,
      orders: true,
    },
  });
  return profile;
};

const updateUserProfile = async (
  userId: string,
  payload: Partial<User>
): Promise<User> => {
  const { name, profile } = payload as Partial<User & { profile: UserProfile }>;
  if (name) {
    await prisma.user.update({
      where: { id: userId },
      data: { name },
    });
  }
  if (profile) {
    await prisma.userProfile.update({
      where: { userId },
      data: profile,
    });
  }
  const updatedUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
    },
  });
  if (!updatedUser) {
    throw new Error('User not found');
  }
  return updatedUser;
};

export const ProfileService = {
  getUserProfile,
  updateUserProfile,
};

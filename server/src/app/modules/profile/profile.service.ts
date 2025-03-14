import { User, UserProfile } from '@prisma/client';
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import { IUploadFile } from '../../../interfaces/file';
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

const updateUserProfile = async (req: Request): Promise<User> => {
  const file = req.file as IUploadFile;
  // Handle file upload if a new image is provided
  if (file) {
    const uploadImage = await FileUploadHelper.uploadToCloudinary(file);
    req.body.profile.avatar = uploadImage?.secure_url;
  }
  const { userId } = req.user as JwtPayload;
  const { name, profile } = req.body as Partial<
    User & { profile: UserProfile }
  >;

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

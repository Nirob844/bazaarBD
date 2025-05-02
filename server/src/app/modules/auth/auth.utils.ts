import bcrypt from 'bcrypt';
import config from '../../../config';
import prisma from '../../../shared/prisma';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = parseInt(config.bycrypt_salt_rounds as string) || 10;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const getUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const isPasswordMatched = async (
  givenPassword: string,
  savedPassword: string
): Promise<boolean> => {
  try {
    return givenPassword === savedPassword;
  } catch (error) {
    return false;
  }
};

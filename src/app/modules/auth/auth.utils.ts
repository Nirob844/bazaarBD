import prisma from '../../../shared/prisma';

export const getUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, password: true, role: true, email: true },
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

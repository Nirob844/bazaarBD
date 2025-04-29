import { randomBytes } from 'crypto';
import prisma from '../../../shared/prisma';
import { sendEmailNotification } from '../emailNotification/emailNotification.utils';

const createVerificationCode = async (userId: string) => {
  const code = randomBytes(3).toString('hex').toUpperCase(); // e.g., 'A1B2C3'

  await prisma.verificationCode.upsert({
    where: { userId },
    update: { code, expiresAt: new Date(Date.now() + 15 * 60 * 1000) }, // 15 min expiry
    create: {
      userId,
      code,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  return code;
};

const verifyEmailCode = async (userId: string, code: string) => {
  const record = await prisma.verificationCode.findUnique({
    where: { userId },
  });

  if (!record || record.code !== code || new Date() > record.expiresAt) {
    throw new Error('Invalid or expired verification code');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isEmailVerified: true },
  });

  await prisma.verificationCode.delete({ where: { userId } });

  return { success: true };
};

const resendVerificationCode = async (userId: string) => {
  const code = await createVerificationCode(userId);
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error('User not found');
  }

  await sendEmailNotification({
    userId,
    toEmail: user.email,
    type: 'ACCOUNT_CONFIRMATION',
    subject: 'Your new verification code',
    body: `<p>Hello,</p><p>Your new verification code is: <strong>${code}</strong></p><p>This code will expire in 15 minutes.</p>`,
  });

  return { success: true };
};

export const verificationCodeService = {
  createVerificationCode,
  verifyEmailCode,
  resendVerificationCode,
};

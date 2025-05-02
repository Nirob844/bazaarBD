import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { verificationCodeService } from './verificationCode.service';

// POST /verify-email
const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { userId, code } = req.body;

  const result = await verificationCodeService.verifyEmailCode(userId, code);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Email verified successfully',
    data: result,
  });
});

// POST /resend-verification
const resendCode = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.body;

  const result = await verificationCodeService.resendVerificationCode(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Verification code resent successfully',
    data: result,
  });
});

export const VerificationCodeController = {
  verifyEmail,
  resendCode,
};

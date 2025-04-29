import express from 'express';
import { VerificationCodeController } from './verificationCode.controller';

const router = express.Router();

router.post('/email', VerificationCodeController.verifyEmail);
router.post('/resend', VerificationCodeController.resendCode);

export const VerificationCodeRoutes = router;

import { UserRole } from '@prisma/client';

export type ILoginUser = {
  email: string;
  password: string;
};
export type ILoginUserResponse = {
  accessToken: string;
  refreshToken?: string;
};
export type IRefreshTokenResponse = {
  accessToken: string;
};

export type IRegisterUser = {
  email: string;
  password: string;
  role: UserRole;
  isLocked?: boolean;
  failedLoginAttempts?: number;
  lastLogin?: Date;
  // Customer
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  // Vendor
  businessName?: string;
  businessEmail?: string;
  businessPhone?: string;
  taxId?: string;
  verificationDocuments?: any;
};

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
  phoneNumber: string;
  designation: string;
  department: string;
  isActive: boolean;
  permissions: JSON;
  notes: string;
  email: string;
  password: string;
  role: UserRole;
  isLocked?: boolean;
  isEmailVerified?: boolean;
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

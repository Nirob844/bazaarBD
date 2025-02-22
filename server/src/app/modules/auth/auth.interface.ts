import { User } from '@prisma/client';

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

export type UserWithProfile = User & {
  profile?: {
    bio?: string;
    avatar?: string;
    phone?: string;
    address?: string;
    gender?: string;
    dob?: Date;
  };
};

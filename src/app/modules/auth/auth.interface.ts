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
    full_name: string;
    phone_number: string;
    bio: string;
    profile_picture_url: string;
    gender: string;
    date_of_birth: Date;
    address: string;
  };
};

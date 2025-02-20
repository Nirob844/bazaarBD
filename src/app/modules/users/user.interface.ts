import { Model } from 'mongoose';
export type UserName = {
  firstName: string;
  lastName: string;
  middleName?: string;
};

export type IUser = {
  phoneNumber: string;
  // role: 'seller' | 'buyer';
  // password: string;
  // name: UserName;
  // address: string;
  // budget: number;
  // income: number;
};
export type UserModel = Model<IUser, Record<string, unknown>>;

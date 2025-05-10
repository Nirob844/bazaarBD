import { Admin } from '@prisma/client';
import { IPaginationOptions } from '../../../interfaces/pagination';

export type IAdminFilterRequest = {
  searchTerm?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  designation?: string;
  department?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type IAdminCreateInput = {
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  designation?: string;
  department?: string;
  isActive?: boolean;
  permissions?: Record<string, any>;
  notes?: string;
};

export type IAdminUpdateInput = Partial<IAdminCreateInput>;

export type IAdminResponse = {
  data: Admin;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
};

export type IAdminFilterOptions = {
  filters: IAdminFilterRequest;
  paginationOptions: IPaginationOptions;
};

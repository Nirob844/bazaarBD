import { DeletionStatus } from '@prisma/client';

export type IVendorFilterRequest = {
  searchTerm?: string;
  isVerified?: boolean;
  hasActiveShops?: boolean;
  deletionStatus?: DeletionStatus;
};

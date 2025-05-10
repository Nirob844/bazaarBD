import { Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';

export const validateBankAccount = (data: Prisma.BankAccountCreateInput) => {
  const {
    bankName,
    accountName,
    accountNumber,
    accountType,
    branch,
    routingNumber,
  } = data;

  // Required fields validation
  if (!bankName || !accountName || !accountNumber || !accountType) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Bank name, account name, account number, and account type are required'
    );
  }

  // Bank name validation
  if (bankName.length < 2 || bankName.length > 100) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Bank name must be between 2 and 100 characters'
    );
  }

  // Account name validation
  if (accountName.length < 2 || accountName.length > 100) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Account name must be between 2 and 100 characters'
    );
  }

  // Account number validation
  if (!/^\d{10,20}$/.test(accountNumber)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Account number must be between 10 and 20 digits'
    );
  }

  // Branch validation (optional)
  if (branch && (branch.length < 2 || branch.length > 100)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Branch name must be between 2 and 100 characters'
    );
  }

  // Routing number validation (optional)
  if (routingNumber && !/^\d{9}$/.test(routingNumber)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Routing number must be exactly 9 digits'
    );
  }

  return {
    bankName,
    accountName,
    accountNumber,
    accountType,
    branch,
    routingNumber,
  };
};

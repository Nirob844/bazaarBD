import { Prisma, Shop } from '@prisma/client';
import { Request } from 'express';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IUploadFilesMap } from '../../../interfaces/file';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';
import { shopSearchAbleFields } from './shop.constants';
import { IShopFilterRequest } from './shop.interface';

const insertIntoDB = async (req: Request): Promise<Shop> => {
  const files = req.files as IUploadFilesMap;

  // Handle banner upload
  if (files?.banner?.[0]) {
    const bannerUpload = await FileUploadHelper.uploadToCloudinary(
      files.banner[0]
    );
    req.body.banner = bannerUpload?.secure_url;
  }

  // Handle logo upload
  if (files?.logo?.[0]) {
    const logoUpload = await FileUploadHelper.uploadToCloudinary(files.logo[0]);
    req.body.logo = logoUpload?.secure_url;
  }

  const result = await prisma.shop.create({
    data: req.body,
  });

  return result;
};

const getAllFromDB = async (
  filters: IShopFilterRequest,
  options: IPaginationOptions
): Promise<IGenericResponse<Shop[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: shopSearchAbleFields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map(key => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.ShopWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.shop.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: 'desc',
          },
  });
  const total = await prisma.shop.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};
const getDataById = async (id: string): Promise<Shop | null> => {
  const result = await prisma.shop.findUnique({
    where: {
      id,
    },
    include: {
      vendor: true,
      products: true,
      analytics: true,
    },
  });

  return result;
};

const updateOneInDB = async (
  id: string,
  payload: Partial<Shop>
): Promise<Shop> => {
  const result = await prisma.shop.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

const deleteByIdFromDB = async (id: string): Promise<Shop> => {
  const result = await prisma.shop.delete({
    where: {
      id,
    },
  });
  return result;
};

export const ShopService = {
  insertIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
};

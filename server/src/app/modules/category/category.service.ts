import { Category, Prisma } from '@prisma/client';
import { Request } from 'express';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IUploadFile } from '../../../interfaces/file';
import { IPaginationOptions } from '../../../interfaces/pagination';
import prisma from '../../../shared/prisma';

const insertIntoDB = async (req: Request): Promise<Category> => {
  const file = req.file as IUploadFile;

  if (file) {
    const uploadImage = await FileUploadHelper.uploadToCloudinary(file);
    req.body.imageUrl = uploadImage?.secure_url;
  }

  const result = await prisma.category.create({
    data: req.body,
  });

  return result;
};

const getAllFromDB = async (
  options: IPaginationOptions
): Promise<IGenericResponse<Category[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  const andConditions: Prisma.CategoryWhereInput[] = [];

  const whereConditions: Prisma.CategoryWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.category.findMany({
    where: whereConditions,
    skip,
    take: limit,
    // orderBy:
    //   options.sortBy && options.sortOrder
    //     ? { [options.sortBy]: options.sortOrder }
    //     : {
    //         createdAt: 'desc',
    //       },
  });
  const total = await prisma.category.count({
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

const getDataById = async (id: string): Promise<Category | null> => {
  const result = await prisma.category.findUnique({
    where: {
      id,
    },
    include: {
      products: true,
    },
  });

  return result;
};

const updateOneInDB = async (req: Request): Promise<Category> => {
  const { id } = req.params;
  const file = req.file as IUploadFile;

  // Handle file upload if a new image is provided
  if (file) {
    const uploadImage = await FileUploadHelper.uploadToCloudinary(file);
    req.body.imageUrl = uploadImage?.secure_url;
  }

  const result = await prisma.category.update({
    where: { id },
    data: req.body,
  });

  return result;
};

const deleteByIdFromDB = async (id: string): Promise<Category> => {
  const result = await prisma.category.delete({
    where: {
      id,
    },
  });
  return result;
};

export const CategoryService = {
  insertIntoDB,
  getAllFromDB,
  getDataById,
  updateOneInDB,
  deleteByIdFromDB,
};

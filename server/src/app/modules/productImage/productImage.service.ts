import { ProductImage } from '@prisma/client';
import { Request } from 'express';
import { FileUploadHelper } from '../../../helpers/fileUploadHelper';
import { IUploadFile } from '../../../interfaces/file';
import prisma from '../../../shared/prisma';

const insertIntoDB = async (req: Request): Promise<ProductImage> => {
  const file = req.file as IUploadFile;

  if (file) {
    const uploadImage = await FileUploadHelper.uploadToCloudinary(file);
    req.body.url = uploadImage?.secure_url;
  }
  console.log('req--body--productId', req.body);
  const product = await prisma.product.findUnique({
    where: {
      id: req.body.productId,
    },
  });
  console.log('product', product);
  if (!product) {
    throw new Error('Product not found!');
  }
  console.log('request body:------', req.body);
  const result = await prisma.productImage.create({
    data: req.body,
  });
  console.log('result', result);
  return result;
};

const getAllFromDB = async () => {
  return await prisma.productImage.findMany();
};

const deleteFromDB = async (id: string): Promise<ProductImage> => {
  const result = await prisma.productImage.delete({
    where: {
      id,
    },
  });
  return result;
};

export const ProductImageService = {
  insertIntoDB,
  getAllFromDB,
  deleteFromDB,
};

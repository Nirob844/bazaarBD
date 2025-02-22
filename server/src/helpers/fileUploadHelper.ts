import { v2 as cloudinary } from 'cloudinary';
import { NextFunction, Request, Response } from 'express';
import * as fs from 'fs';
import httpStatus from 'http-status';
import multer from 'multer';
import path from 'path';
import config from '../config';
import ApiError from '../errors/ApiError';
import { ICloudinaryResponse, IUploadFile } from '../interfaces/file';

cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret,
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({ storage: storage });

const uploadToCloudinary = async (
  file: IUploadFile
): Promise<ICloudinaryResponse | undefined> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file.path,
      (error: Error, result: ICloudinaryResponse) => {
        fs.unlinkSync(file.path);
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
};

const getFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filePath = path.join(
      process.cwd(),
      'uploads',
      path.basename(req.params.fileName)
    );

    // Check if the file exists
    await fs.promises.access(filePath, fs.constants.F_OK);

    // Send the image file if it exists
    res.sendFile(filePath);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      // File not found, return 404 error
      next(new ApiError(httpStatus.NOT_FOUND, 'Image not found'));
    } else {
      // Handle all other errors as 500 Internal Server Error
      next(
        new ApiError(
          httpStatus.INTERNAL_SERVER_ERROR,
          'An error occurred while processing your request'
        )
      );
    }
  }
};

const deleteFile = async (imageUrl: any) => {
  const filename = imageUrl.split('/').pop();
  const filePath = path.join(process.cwd(), 'uploads', filename);
  // Delete the file from the uploads folder
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath); // Delete the file
  }
};

export const FileUploadHelper = {
  uploadToCloudinary,
  upload,
  getFile,
  deleteFile,
};

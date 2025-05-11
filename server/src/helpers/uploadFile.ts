import { MulterFile } from '../interfaces/file';

// Helper function to handle multer files
export const getUploadedFiles = (files: any): MulterFile[] | undefined => {
  if (!files) return undefined;
  if (Array.isArray(files)) return files as MulterFile[];
  if (files.images) return files.images as MulterFile[];
  return undefined;
};

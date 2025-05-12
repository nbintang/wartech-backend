// cloudinary-response.ts
import {
  UploadApiErrorResponse,
  UploadApiOptions,
  UploadApiResponse,
} from 'cloudinary';

export type CloudinaryResponse = UploadApiResponse | UploadApiErrorResponse;
export interface CloudinaryUploadOptions extends UploadApiOptions {
  file?: Express.Multer.File;
  base64?: string;
  public_id?: string;
}

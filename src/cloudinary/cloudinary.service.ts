import { Injectable } from '@nestjs/common';
import { CloudinaryResponse, CloudinaryUploadOptions } from './cloudinary.type';
import {
  v2 as cloudinary,
  DeleteApiResponse,
  UploadApiResponse,
} from 'cloudinary';
import { Readable } from 'stream';

function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

@Injectable()
export class CloudinaryService {
  async updateFile({
    file,
    folder = 'book-covers',
    public_id,
  }: CloudinaryUploadOptions): Promise<CloudinaryResponse> {
    if (public_id) await this.deleteFile(public_id);
    return this.uploadFile({ file, folder, public_id });
  }
  async uploadFile({
    file,
    folder,
    public_id,
    resource_type = 'image',
  }: CloudinaryUploadOptions): Promise<CloudinaryResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type, public_id },
        (err: Error, result: UploadApiResponse) => {
          console.log('err', err);
          console.log('result', result);
          if (err || !result) return reject(err);
          resolve(result);
        },
      );
      bufferToStream(file.buffer).pipe(uploadStream);
    });
  }
  async deleteFile(public_id: string): Promise<DeleteApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.api.resource(public_id, (error, result) => {
        if (error || !result)
          return reject(error || new Error('Resource not found'));
        cloudinary.uploader.destroy(public_id, (destroyError) => {
          if (destroyError) return reject(destroyError);
          resolve(result);
        });
      });
    });
  }
}

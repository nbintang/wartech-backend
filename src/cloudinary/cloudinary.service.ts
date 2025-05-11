import { Injectable } from '@nestjs/common';
import { CloudinaryResponse, CloudinaryUploadOptions } from './cloudinary.type';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

@Injectable()
export class CloudinaryService {
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
}

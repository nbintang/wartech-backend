import { Injectable } from '@nestjs/common';
import { CloudinaryResponse, CloudinaryUploadOptions } from './cloudinary.type';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadFile({
    file,
    folder,
    public_id,
  }: CloudinaryUploadOptions): Promise<CloudinaryResponse> {
    const optimizedFile = await this.compressImage(file);
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const readebleStream = this.bufferToStream(optimizedFile);
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          public_id,
          overwrite: !!public_id,
          invalidate: !!public_id,
        },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        },
      );
      readebleStream.pipe(uploadStream);
    });
  }
  extractPublicId(imageUrl: string): string {
    if (!imageUrl) return '';
    const path = imageUrl.split('/').pop();
    if (!path) return '';
    const public_id = path.includes('/') ? path.split('/').pop() : path;
    return public_id?.split('.')[0] || '';
  }

  private async compressImage(file: Express.Multer.File): Promise<Buffer> {
    return sharp(file.buffer)
      .resize({ width: 400 })
      .jpeg({ quality: 70 })
      .toBuffer();
  }
  private bufferToStream(buffer: Buffer): Readable {
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    return readable;
  }
}

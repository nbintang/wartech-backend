import { BadRequestException, Injectable } from '@nestjs/common';
import { CloudinaryResponse, CloudinaryUploadOptions } from './cloudinary.type';
import { v2 as cloudinary } from 'cloudinary';
import * as sharp from 'sharp';

@Injectable()
export class CloudinaryService {
  async uploadFile({
    base64,
    folder = 'users',
    public_id,
    resource_type = 'image',
  }: CloudinaryUploadOptions): Promise<CloudinaryResponse> {
    const optimizedBase64 = await this.compressBase64Image(base64);
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      cloudinary.uploader.upload(
        optimizedBase64,
        {
          folder,
          resource_type,
          public_id,
          overwrite: true,
          invalidate: true,
        },
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        },
      );
    });
  }
  extractPublicId(imageUrl: string): string {
    if (!imageUrl) return '';
    const path = imageUrl.split('/').pop();
    if (!path) return '';
    const public_id = path.includes('/') ? path.split('/').pop() : path;
    return public_id?.split('.')[0] || '';
  }
  private async compressBase64Image(base64: string): Promise<string> {
    const [header, base64Data] = base64.split(',');
    const buffer = Buffer.from(base64Data, 'base64');
    const imageType = header.match(/image\/(png|jpeg|jpg)/)?.[1];
    if (!imageType) throw new BadRequestException('Unsupported image format');
    let compressedBuffer: Buffer;
    switch (imageType) {
      case 'png':
        compressedBuffer = await sharp(buffer)
          .resize({ width: 400 }) // Adjust size as needed
          .png({ quality: 70, compressionLevel: 8 }) // Adjust quality for PNG
          .toBuffer();
        break;
      case 'jpeg':
      case 'jpg':
        compressedBuffer = await sharp(buffer)
          .resize({ width: 400 }) // Adjust size as needed
          .jpeg({ quality: 70 }) // Adjust quality for JPEG
          .toBuffer();
        break;
      default:
        throw new BadRequestException('Unsupported image format');
    }
    return `${header},${compressedBuffer.toString('base64')}`;
  }
}

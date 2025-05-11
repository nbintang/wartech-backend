import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { Cloudinary as CloudinaryProvider } from './cloudinary';

@Module({
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryProvider, CloudinaryService],
})
export class CloudinaryModule {}

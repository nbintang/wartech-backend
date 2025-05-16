import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { Cloudinary as CloudinaryProvider } from './cloudinary';
import { CloudinaryController } from './cloudinary.controller';
import { AccessControlService } from 'src/auth/shared/access-control.service';
@Module({
  providers: [CloudinaryProvider, CloudinaryService, AccessControlService],
  controllers: [CloudinaryController],
  exports: [CloudinaryProvider, CloudinaryService],
})
export class CloudinaryModule {}

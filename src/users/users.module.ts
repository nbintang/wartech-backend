import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersController } from './users.controller';
import { AccessControlService } from 'src/auth/shared/access-control.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  providers: [UsersService, AccessControlService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}

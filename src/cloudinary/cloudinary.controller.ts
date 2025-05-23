import {
  Controller,
  HttpException,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/enums/role.enums';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { ImageDto } from './dtos/mutate-file.dto';
import { QueryFileDto } from './dtos/query-file.dto';
import { SinglePayloadResponseDto } from '../common/dtos/single-payload-response.dto';
import { SkipThrottle } from '@nestjs/throttler';

@UseGuards(AccessTokenGuard)
@Controller('/protected/upload')
@SkipThrottle({ short: true })
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}
  @Roles(Role.ADMIN, Role.REPORTER, Role.READER)
  @UseGuards(RoleGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: ImageDto,
    @Query() query: QueryFileDto,
  ): Promise<SinglePayloadResponseDto> {
    try {
      const { folder } = query;
      if (!folder) throw new HttpException('Folder is required', 400);
      let exitedPublicId: string | null | undefined;
      if (query['image-url']) {
        exitedPublicId = this.cloudinaryService.extractPublicId(
          query['image-url'],
        );
      }
      const { secure_url, public_id, created_at } =
        await this.cloudinaryService.uploadFile({
          file,
          folder,
          public_id: exitedPublicId,
        });
      return {
        message: `File uploaded to ${folder} successfully`,
        data: {
          secureUrl: secure_url,
          publicId: public_id,
          createdAt: created_at,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Something went wrong',
        error.status || 500,
      );
    }
  }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { QueryTagDto } from './dtos/query-tag.dto';
import { PrismaService } from '../../commons/prisma/prisma.service';
import { TagDto } from './dtos/mutate-tag.dto';
import { Prisma } from '@prisma/client';
import { Tag } from '@prisma/client';
import { PaginatedPayloadResponseDto } from '../../commons/dtos/paginated-payload-response.dto';
@Injectable()
export class TagsService {
  constructor(private db: PrismaService) {}

async createTag(data: TagDto): Promise<Tag> {
  const existedTag = await this.getTagBySlug(data.slug);
  if (existedTag) {
    throw new HttpException('Tag slug already exists', HttpStatus.BAD_REQUEST);
  }
  const tag = await this.db.tag.create({ 
    data: { 
      name: data.name, 
      slug: data.slug 
    } 
  });

  return tag;
}

async getAllTags(
  query: QueryTagDto,
): Promise<PaginatedPayloadResponseDto<Tag>> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const skip = (page - 1) * limit;
  const take = limit;

  // Build dynamic search criteria (just for name)
  const dynamicSearch: Prisma.TagWhereInput = {
    ...(query.name && { name: { contains: query.name } })
  };

  const tags = await this.db.tag.findMany({ 
    where: dynamicSearch,
    skip,
    take,
  });

  const tagsCount = await this.db.tag.count({ where: dynamicSearch });

  const itemCount = tags.length;
  const totalPages = Math.ceil(tagsCount / limit);

  return {
    data: {
      items: tags,
      meta: {
        totalItems: tagsCount,
        currentPage: page,
        itemPerPages: limit,
        itemCount,
        totalPages,
      },
    },
  };
}

  async getTagBySlug(slug: string): Promise<Tag> {
    const tag = await this.db.tag.findUnique({ where: { slug } });
    return tag;
  }

  async updateTagsBySlug(slug: string, data: TagDto): Promise<Tag> {
    const currentTag = await this.getTagBySlug(slug);
    if (!currentTag)
      throw new HttpException('Tag not found', HttpStatus.NOT_FOUND);
    const tag = await this.db.tag.update({
      where: { id: currentTag.id },
      data: {
        name: data.name ?? currentTag.name,
        slug: data.slug ?? slug,
      },
    });
    return tag;
  }
  async deleteTagBySlug(slug: string): Promise<Tag> {
    const tag = await this.getTagBySlug(slug);
    if (!tag) throw new Error('Tag not found');
    const deleted = await this.db.tag.delete({ where: { slug } });
    return deleted;
  }
}

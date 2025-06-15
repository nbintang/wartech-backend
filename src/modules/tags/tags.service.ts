import { Injectable } from '@nestjs/common';
import { QueryTagDto } from './dtos/query-tag.dto';
import { PrismaService } from '../../commons/prisma/prisma.service';
import { TagDto } from './dtos/mutate-tag.dto';
import { Prisma } from '@prisma/client';
import { Tag } from '@prisma/client';
import { PaginatedPayloadResponseDto } from '../../commons/dtos/paginated-payload-response.dto';
import { SinglePayloadResponseDto } from '../../commons/dtos/single-payload-response.dto';
@Injectable()
export class TagsService {
  constructor(private db: PrismaService) {}

  async createTag(data: TagDto): Promise<SinglePayloadResponseDto<Tag>> {
    const tag = await this.db.tag.upsert({
      where: { slug: data.slug },
      create: { name: data.name, slug: data.slug },
      update: {},
    });

    return { message: 'Tag processed successfully', data: tag };
  }

  async createTags(data: TagDto): Promise<SinglePayloadResponseDto<Tag[]>> {
    const slugs = data.slugs;
    await this.db.$transaction(
      slugs.map((slug, i) =>
        this.db.tag.upsert({
          where: { slug },
          create: { name: data.names[i] ?? slug, slug },
          update: {}, // kalau udah ada, gak bikin apa-apa
        }),
      ),
    );
    const tags = await this.db.tag.findMany({ where: { slug: { in: slugs } } });
    return { message: 'Tags processed successfully', data: tags };
  }

  async getAllTags(
    query: QueryTagDto,
  ): Promise<PaginatedPayloadResponseDto<Tag>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const take = limit;
    const dynamicSearch: Prisma.TagWhereInput = {
      ...(query.name && { name: { contains: query.name } }),
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

  async deleteTagBySlug(slug: string): Promise<Tag> {
    const tag = await this.getTagBySlug(slug);
    if (!tag) throw new Error('Tag not found');
    const deleted = await this.db.tag.delete({ where: { slug } });
    return deleted;
  }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { QueryTagDto } from './dtos/query-tag.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TagDto } from './dtos/mutate-tag.dto';
@Injectable()
export class TagsService {
  constructor(private db: PrismaService) {}

  async createNewSlug(data: TagDto) {
    const existedTag = await this.getTagBySlug(data.slug);
    if (existedTag) throw new Error('Tag slug already exists');
    const tag = await this.db.tag.create({
      data: {
        name: data.name,
        slug: data.slug,
      },
    });
    return tag;
  }

  async getAllTags(query: QueryTagDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const take = limit;
    const tags = await this.db.tag.findMany({
      skip,
      take,
    });
    const tagsCount = await this.db.tag.count();
    const itemCount = tags.length;
    const totalPages = Math.ceil(tagsCount / limit);
    return {
      tags,
      meta: {
        totalItems: tagsCount,
        currentPage: page,
        itemPerPages: limit,
        itemCount,
        totalPages,
      },
    };
  }

  async getTagBySlug(slug: string) {
    const tag = await this.db.tag.findUnique({ where: { slug } });
    return tag;
  }

  async updateTagsBySlug(slug: string, data: TagDto) {
    const currentTag = await this.getTagBySlug(slug);
    if (!currentTag)
      throw new HttpException('Tag not found', HttpStatus.NOT_FOUND);
    if (data.name) {
      const existingByName = await this.db.tag.findUnique({
        where: { name: data.name },
      });
      if (existingByName && existingByName.id !== currentTag.id)
        throw new HttpException(
          'Tags name already exists',
          HttpStatus.BAD_REQUEST,
        );
    }
    if (data.slug && data.slug !== currentTag.slug) {
      const existingBySlug = await this.getTagBySlug(data.slug);
      if (existingBySlug && existingBySlug.id !== currentTag.id)
        throw new HttpException(
          'Tags slug already exists',
          HttpStatus.BAD_REQUEST,
        );
    }
    const tag = await this.db.tag.update({
      where: { slug },
      data: {
        name: data.name,
        slug: data.slug,
      },
    });
    return tag;
  }
  async deleteTagBySlug(slug: string) {
    const tag = await this.getTagBySlug(slug);
    if (!tag) throw new Error('Tag not found');
    return await this.db.tag.delete({ where: { slug } });
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ArticleTagsService } from './article-tags.service';
import { ArticleTagsDto } from './dto/mutate-article-tag.dto';
import { UpdateArticleTagDto } from './dto/update-article-tag.dto';

@Controller('article-tags')
export class ArticleTagsController {
  constructor(private readonly articleTagsService: ArticleTagsService) {}

  @Post()
  create(@Body() createArticleTagDto: ArticleTagsDto) {
    return this.articleTagsService.addArticleTags(createArticleTagDto);
  }

  @Get()
  findAll() {
    return this.articleTagsService.getAllArticleTags();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articleTagsService.getArticleTagById(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArticleTagDto: UpdateArticleTagDto) {
    return this.articleTagsService.updateArticleTagById(+id, updateArticleTagDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.articleTagsService.removeArticleTagById(+id);
  }
}

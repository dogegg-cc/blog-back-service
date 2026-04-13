import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Param,
  UsePipes,
  Delete,
  Query,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import {
  CreateArticleDto,
  UpdateArticleDto,
  DeleteArticlesDto,
  QueryArticleDto,
  PaginatedArticleDto,
  ArticleDetailResponseDto,
} from './dto/article.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ResponseDto } from '../../common/dto/response.dto';
import { ApiSuccessResponse } from '../../common/decorators/swagger.decorator';

@ApiTags('文章管理(Article)')
@Controller('api/cms/article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post('add')
  @ApiBearerAuth()
  @UsePipes(ZodValidationPipe)
  @ApiOperation({ summary: '添加文章 (需要登录)' })
  async create(@Body() createArticleDto: CreateArticleDto) {
    await this.articleService.create(createArticleDto);
    return ResponseDto.success(null, '添加文章成功');
  }

  @Delete('delete')
  @ApiBearerAuth()
  @UsePipes(ZodValidationPipe)
  @ApiOperation({ summary: '批量删除文章 (需要登录)' })
  async remove(@Body() deleteArticlesDto: DeleteArticlesDto) {
    await this.articleService.removeMany(deleteArticlesDto);
    return ResponseDto.success(null, '删除文章成功');
  }

  @Put('update/:id')
  @ApiBearerAuth()
  @UsePipes(ZodValidationPipe)
  @ApiOperation({ summary: '修改文章 (需要登录)' })
  @ApiParam({ name: 'id', description: '待修改的文章ID' })
  async update(
    @Param('id') id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    await this.articleService.update(id, updateArticleDto);
    return ResponseDto.success(null, '修改文章成功');
  }

  @Get('list')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({ summary: '条件筛选并分页查询文章列表 (免登录)' })
  @ApiSuccessResponse({ type: PaginatedArticleDto, description: '查询成功' })
  async findList(@Query() queryArticleDto: QueryArticleDto) {
    const data = await this.articleService.findList(queryArticleDto);
    return ResponseDto.success(data, '查询文章列表成功');
  }

  @Get(':id')
  @ApiOperation({ summary: '查询文章详情 (免登录)' })
  @ApiParam({ name: 'id', description: '文章ID' })
  @ApiSuccessResponse({
    type: ArticleDetailResponseDto,
    description: '查询成功',
  })
  async findOne(@Param('id') id: string) {
    const data = await this.articleService.findOne(id);
    return ResponseDto.success(data, '查询文章详情成功');
  }
}

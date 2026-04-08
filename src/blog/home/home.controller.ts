import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common';
import { HomeService } from './home.service';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseDto } from '../../common/dto/response.dto';
import { ApiSuccessResponse } from '../../common/decorators/swagger.decorator';
import { HomeResponseDto } from './dto/home-response.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import {
  ArticleDetailResponseDto,
  PaginatedArticleDto,
  QueryArticleDto,
} from '../article/dto/article.dto';

@ApiTags('首页聚合')
@Controller('api/blog')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Public()
  @Get('home')
  @ApiOperation({ summary: '获取博客首页聚合数据' })
  @ApiSuccessResponse({
    type: HomeResponseDto,
    description: '获取成功',
  })
  async getHomeData() {
    const data = await this.homeService.getHomeData();
    return ResponseDto.success(data, '获取成功');
  }

  @Public()
  @Get('list')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({ summary: '条件筛选并分页查询文章列表 (免登录)' })
  @ApiSuccessResponse({ type: PaginatedArticleDto, description: '查询成功' })
  async findList(@Query() queryArticleDto: QueryArticleDto) {
    const data = await this.homeService.findArticleList(queryArticleDto);
    return ResponseDto.success(data, '查询文章列表成功');
  }

  @Public()
  @Get('article/:id')
  @ApiOperation({ summary: '查询文章详情 (免登录)' })
  @ApiParam({ name: 'id', description: '文章ID' })
  @ApiSuccessResponse({
    type: ArticleDetailResponseDto,
    description: '查询成功',
  })
  async findOne(@Param('id') id: string) {
    const data = await this.homeService.findOne(id);
    return ResponseDto.success(data, '查询文章详情成功');
  }
}

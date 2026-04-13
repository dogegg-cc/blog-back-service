import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { PageModuleService } from '../page-module/page-module.service';
import { HomeResponseDto, HomeResponseSchema } from './dto/home-response.dto';
import { ArticleService } from '../article/article.service';
import {
  ArticleDetailResponseDto,
  PaginatedArticleDto,
  QueryArticleDto,
} from '../article/dto/article.dto';

@Injectable()
export class HomeService {
  constructor(
    private readonly userService: UserService,
    private readonly pageModuleService: PageModuleService,
    private readonly articleService: ArticleService,
  ) {}

  /**
   * 获取首页聚合数据
   */
  async getHomeData(): Promise<HomeResponseDto> {
    const user = await this.userService.getBlogOwnerInfo();
    const modules = await this.pageModuleService.findActiveModules();

    // 使用 Zod 对聚合并经过转换的数据进行最终校验与过滤（自动剥离 Schema 中未定义的 id 等字段）
    return HomeResponseSchema.parse({
      user,
      pageModule: modules,
    });
  }

  async findArticleList(
    queryDto: QueryArticleDto,
  ): Promise<PaginatedArticleDto> {
    return this.articleService.findList(queryDto);
  }

  async findOne(id: string): Promise<ArticleDetailResponseDto> {
    return this.articleService.findOne(id, false);
  }
}

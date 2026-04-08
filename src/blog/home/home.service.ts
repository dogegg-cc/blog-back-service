import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { PageModuleService } from '../page-module/page-module.service';
import { HomeResponseDto, HomeUserDto } from './dto/home-response.dto';
import { PageModuleResponseDto } from '../page-module/dto/page-module.dto';
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

    return {
      user: user as HomeUserDto | null,
      pageModule: modules as PageModuleResponseDto[],
    };
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

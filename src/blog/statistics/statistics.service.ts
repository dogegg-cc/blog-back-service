import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../../sql/entities/article.entity';
import { Category } from '../../sql/entities/category.entity';
import { Tag } from '../../sql/entities/tag.entity';
import {
  CategoryRatioDto,
  CategoryPopularityDto,
  PostTrendDto,
  StatisticsSummaryDto,
} from './dto/statistics.dto';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  /**
   * 获取全站统计汇总数据
   */
  async getSummary(): Promise<StatisticsSummaryDto> {
    const articleCount = await this.articleRepository.count();
    const categoryCount = await this.categoryRepository.count();
    const tagCount = await this.tagRepository.count();

    const result = await this.articleRepository
      .createQueryBuilder('article')
      .select('SUM(article.viewCount)', 'totalViews')
      .getRawOne<{ totalViews: string }>();

    return {
      articleCount,
      categoryCount,
      tagCount,
      totalViews: Number(result?.totalViews || 0),
    };
  }

  /**
   * 分类文章占比图数据 (饼图)
   * 返回各分类名称及其文章数量
   */
  async getCategoryRatio(): Promise<CategoryRatioDto[]> {
    const data = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.articles', 'article')
      .select('category.name', 'name')
      .addSelect('COUNT(article.id)', 'value')
      .groupBy('category.id')
      .getRawMany<{ name: string; value: string }>();

    return data.map((item) => ({
      name: item.name,
      value: Number(item.value),
    }));
  }

  /**
   * 分类平均阅读量数据 (条形图)
   * 返回各分类名称及其平均阅读量
   */
  async getCategoryPopularity(): Promise<CategoryPopularityDto[]> {
    const data = await this.categoryRepository
      .createQueryBuilder('category')
      .innerJoin('category.articles', 'article')
      .select('category.name', 'name')
      .addSelect('ROUND(AVG(article.viewCount))', 'averageViews')
      .groupBy('category.id')
      .getRawMany<{ name: string; averageViews: string }>();

    return data.map((item) => ({
      name: item.name,
      value: Number(item.averageViews),
    }));
  }

  /**
   * 文章发布趋势图数据 (面积图)
   * 按月统计文章发布数量
   */
  async getPublishingTrend(): Promise<PostTrendDto[]> {
    // 针对 PostgreSQL 的按月分组统计
    const data = await this.articleRepository
      .createQueryBuilder('article')
      .select("TO_CHAR(article.createdAt, 'YYYY-MM')", 'month')
      .addSelect('COUNT(article.id)', 'count')
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany<{ month: string; count: string }>();

    return data.map((item) => ({
      label: item.month,
      value: Number(item.count),
    }));
  }
}

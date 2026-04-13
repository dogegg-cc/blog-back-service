import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Article } from '../../sql/entities/article.entity';
import { Tag } from '../../sql/entities/tag.entity';
import { Category } from '../../sql/entities/category.entity';
import {
  CreateArticleDto,
  UpdateArticleDto,
  QueryArticleDto,
  DeleteArticlesDto,
  ArticleDetailResponseSchema,
  PaginatedArticleSchema,
  ArticleDetailResponseDto,
  PaginatedArticleDto,
} from './dto/article.dto';
import { BusinessException } from '../../common/exceptions/business.exception';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  /**
   * 创建文章
   */
  async create(createArticleDto: CreateArticleDto): Promise<void> {
    const { categoryId, tagIds, ...baseData } = createArticleDto;

    const article = this.articleRepository.create(baseData);

    // 处理分类代理
    if (categoryId) {
      article.category = { id: categoryId } as Category;
    }
    // 处理多对多标签代理
    if (tagIds && tagIds.length > 0) {
      article.tags = tagIds.map((id) => ({ id }) as Tag);
    }

    await this.articleRepository.save(article);
  }

  /**
   * 批量删除
   */
  async removeMany(deleteArticlesDto: DeleteArticlesDto): Promise<void> {
    await this.articleRepository.delete({ id: In(deleteArticlesDto.ids) });
  }

  /**
   * 修改文章
   */
  async update(id: string, updateArticleDto: UpdateArticleDto): Promise<void> {
    const exist = await this.articleRepository.findOne({
      where: { id },
      relations: ['tags'],
    });

    if (!exist) {
      throw new BusinessException({ code: 10012, message: '指定的文章不存在' });
    }

    const { categoryId, tagIds, ...updateData } = updateArticleDto;

    // 更新基本数据
    Object.assign(exist, updateData);

    // 对于明确设为 null 的支持置空，有值的则更新指向
    if (categoryId !== undefined) {
      exist.category = categoryId
        ? ({ id: categoryId } as Category)
        : (null as unknown as Category);
    }

    // 更新中间表关联标签
    if (tagIds !== undefined) {
      exist.tags = tagIds.map((tid) => ({ id: tid }) as Tag);
    }

    await this.articleRepository.save(exist);
  }

  /**
   * 按条件分页查询所有文章列表
   */
  async findList(queryDto: QueryArticleDto): Promise<PaginatedArticleDto> {
    const { page, limit, categoryId, tagId } = queryDto;

    const qb = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'category')
      .leftJoinAndSelect('article.tags', 'tags')
      .leftJoinAndSelect('article.bannerItem', 'bannerItem')
      .orderBy('article.createdAt', 'DESC')
      .skip(((page ?? 1) - 1) * (limit ?? 10))
      .take(limit ?? 10);

    if (categoryId) {
      qb.andWhere('category.id = :categoryId', { categoryId });
    }

    if (tagId) {
      // 使用单独的 innerJoin 过滤此文章关系，避免破坏 select 时带出的全量 tags 数组
      qb.innerJoin('article.tags', 'filterTag', 'filterTag.id = :tagId', {
        tagId,
      });
    }

    const [items, total] = await qb.getManyAndCount();

    return PaginatedArticleSchema.parse({
      total,
      items,
    });
  }

  /**
   * 获取文章详情（附带阅读量+1）
   */
  async findOne(
    id: string,
    isCms: boolean = true,
  ): Promise<ArticleDetailResponseDto> {
    const article = await this.articleRepository.findOne({
      where: { id },
      relations: ['category', 'tags', 'bannerItem'],
    });

    if (!article) {
      throw new BusinessException({ code: 10012, message: '指定的文章不存在' });
    }

    // 访问自增
    if (!isCms) {
      article.viewCount += 1;
      await this.articleRepository.save(article);
    }

    return ArticleDetailResponseSchema.parse(article);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PageModule } from '../../sql/entities/pageModule.entity';
import { Article } from '../../sql/entities/article.entity';
import { Repository, In } from 'typeorm';
import {
  CreatePageModuleDto,
  UpdatePageModuleDto,
} from './dto/page-module.dto';
import { BusinessException } from '../../common/exceptions/business.exception';
import { ErrorCode } from '../../common/constants/error-code.constant';

@Injectable()
export class PageModuleService {
  constructor(
    @InjectRepository(PageModule)
    private readonly pageModuleRepository: Repository<PageModule>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  /**
   * 创建模块
   */
  async create(createPageModuleDto: CreatePageModuleDto) {
    const module = this.pageModuleRepository.create(createPageModuleDto);
    return await this.pageModuleRepository.save(module);
  }

  /**
   * 更新模块
   */
  async update(id: string, updatePageModuleDto: UpdatePageModuleDto) {
    const module = await this.pageModuleRepository.findOne({ where: { id } });
    if (!module) {
      throw new BusinessException(
        ErrorCode.DATA_NOT_FOUND as { code: number; message: string },
      );
    }
    await this.pageModuleRepository.update(id, updatePageModuleDto);
    return await this.pageModuleRepository.findOne({ where: { id } });
  }

  /**
   * 删除模块
   */
  async remove(id: string) {
    const module = await this.pageModuleRepository.findOne({ where: { id } });
    if (!module) {
      throw new BusinessException(
        ErrorCode.DATA_NOT_FOUND as { code: number; message: string },
      );
    }
    await this.pageModuleRepository.delete(id);
  }

  /**
   * 获取所有模块并展开文章
   */
  async findAll() {
    const modules = await this.pageModuleRepository.find({
      order: {
        sortOrder: 'ASC',
      },
    });

    if (modules.length === 0) return [];

    return await this.expandArticles(modules);
  }

  /**
   * 展开模块中的文章数据
   */
  private async expandArticles(modules: PageModule[]) {
    // 1. 收集所有唯一的文章 ID
    const allArticleIds = new Set<string>();
    modules.forEach((mod) => {
      const content = mod.content as { articleIds?: string[] };
      if (content?.articleIds && Array.isArray(content.articleIds)) {
        content.articleIds.forEach((aid) => allArticleIds.add(aid));
      }
    });

    const articleIdList = Array.from(allArticleIds);

    // 2. 如果没有文章 ID，直接返回
    if (articleIdList.length === 0) {
      return modules;
    }

    // 3. 一次性查询相关文章（带分类标签，排除大字段 content）
    const articles = await this.articleRepository.find({
      where: {
        id: In(articleIdList),
      },
      relations: {
        category: true,
        tags: true,
      },
      select: {
        id: true,
        title: true,
        summary: true,
        bannerUrl: true,
        category: {
          id: true,
          name: true,
        },
        tags: {
          id: true,
          name: true,
        },
      },
    });

    // 4. 将文章缓存为 Map 以便快速查找
    const articleMap = new Map(articles.map((a) => [a.id, a]));

    // 5. 组装数据并回填
    return modules.map((mod) => {
      const content = mod.content as {
        articleIds?: string[];
        articles?: Article[];
      };
      if (content?.articleIds && Array.isArray(content.articleIds)) {
        // 根据原始 ID 列表顺序填充文章数据
        const expandedArticles = content.articleIds
          .map((aid) => articleMap.get(aid))
          .filter((a): a is Article => !!a);

        return {
          ...mod,
          content: {
            ...content,
            articles: expandedArticles,
          },
        };
      }
      return mod;
    });
  }
}

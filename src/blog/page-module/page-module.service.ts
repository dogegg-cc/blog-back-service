import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PageModule } from '../../sql/entities/pageModule.entity';
import { Article } from '../../sql/entities/article.entity';
import { Photo } from '../../sql/entities/photo.entity';
import { Repository, In } from 'typeorm';
import {
  CreatePageModuleDto,
  UpdatePageModuleDto,
} from './dto/page-module.dto';
import { BusinessException } from '../../common/exceptions/business.exception';
import { ErrorCode } from '../../common/constants/error-code.constant';

export interface IPageModuleContent {
  articleIds?: string[];
  photoIds?: string[];
  articles?: Article[];
  photoItems?: Photo[];
  imageUrls?: string[];
}

@Injectable()
export class PageModuleService {
  constructor(
    @InjectRepository(PageModule)
    private readonly pageModuleRepository: Repository<PageModule>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
  ) {}

  /**
   * 创建模块
   */
  async create(createPageModuleDto: CreatePageModuleDto) {
    const module = this.pageModuleRepository.create(createPageModuleDto);
    const count = await this.pageModuleRepository.count();
    console.log('当前有这么多数据:' + count);

    module.sortOrder = count + 1;
    return await this.pageModuleRepository.save(module);
  }

  /**
   * 获取单个模块详情（包含展开内容）
   */
  async findOne(id: string) {
    const module = await this.pageModuleRepository.findOne({ where: { id } });
    if (!module) {
      throw new BusinessException(
        ErrorCode.DATA_NOT_FOUND as { code: number; message: string },
      );
    }
    const [expanded] = await this.expandModuleContent([module]);
    return expanded;
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
    return await this.findOne(id);
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
   * 获取所有模块（不展开内容）
   */
  async findAll() {
    return await this.pageModuleRepository.find({
      order: {
        sortOrder: 'ASC',
      },
    });
  }

  /**
   * 展开模块中的内容数据（文章摘要 + 照片详情）
   */
  private async expandModuleContent(modules: PageModule[]) {
    if (modules.length === 0) return [];

    // 1. 收集 ID
    const allArticleIds = new Set<string>();
    const allPhotoIds = new Set<string>();

    modules.forEach((mod) => {
      const content = mod.content as IPageModuleContent;
      if (content?.articleIds && Array.isArray(content.articleIds)) {
        content.articleIds.forEach((aid) => allArticleIds.add(aid));
      }
      if (content?.photoIds && Array.isArray(content.photoIds)) {
        content.photoIds.forEach((pid) => allPhotoIds.add(pid));
      }
    });

    const articleIdList = Array.from(allArticleIds);
    const photoIdList = Array.from(allPhotoIds);

    // 2. 批量查询
    let articles: Article[] = [];
    if (articleIdList.length > 0) {
      articles = await this.articleRepository.find({
        where: { id: In(articleIdList) },
        relations: ['bannerItem', 'category', 'tags'],
        select: {
          id: true,
          title: true,
          summary: true,
          createdAt: true,
          bannerItem: true as never,
          category: true as never,
          tags: true as never,
        },
      });
    }

    let photos: Photo[] = [];
    if (photoIdList.length > 0) {
      photos = await this.photoRepository.find({
        where: { id: In(photoIdList) },
      });
    }

    // 3. 构建映射
    const articleMap = new Map(articles.map((a) => [a.id, a]));
    const photoMap = new Map(photos.map((p) => [p.id, p]));

    // 4. 回填
    return modules.map((mod) => {
      const content = mod.content as IPageModuleContent;
      const resContent: IPageModuleContent = { ...content };

      if (content?.articleIds && Array.isArray(content.articleIds)) {
        resContent.articles = content.articleIds
          .map((aid: string) => articleMap.get(aid))
          .filter((a): a is Article => !!a);
      }

      if (content?.photoIds && Array.isArray(content.photoIds)) {
        resContent.photoItems = content.photoIds
          .map((pid: string) => photoMap.get(pid))
          .filter((p): p is Photo => !!p);
      }

      return {
        ...mod,
        content: resContent,
      };
    });
  }

  /**
   * 获取所有活跃的模块（首页展示用，需展开内容）
   */
  async findActiveModules() {
    const modules = await this.pageModuleRepository.find({
      where: { isActive: true },
      order: {
        sortOrder: 'ASC',
      },
    });

    return await this.expandModuleContent(modules);
  }

  /**
   * 批量更新模块排序
   */
  async reorder(ids: string[]) {
    await this.pageModuleRepository.manager.transaction(async (manager) => {
      for (let i = 0; i < ids.length; i++) {
        await manager.update(PageModule, ids[i], { sortOrder: i + 1 });
      }
    });
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Category } from '../../sql/entities/category.entity';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  DeleteCategoriesDto,
  CategoryResponseDto,
  CategoryResponseSchema,
} from './dto/category.dto';
import { z } from 'zod';
import { BusinessException } from '../../common/exceptions/business.exception';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  /**
   * 添加分类
   */
  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const existName = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    });
    if (existName) {
      throw new BusinessException({ code: 10010, message: '该分类名称已存在' });
    }
    const existSlug = await this.categoryRepository.findOne({
      where: { slug: createCategoryDto.slug },
    });
    if (existSlug) {
      throw new BusinessException({
        code: 10011,
        message: '该SEO路径已被占用',
      });
    }
    const category = this.categoryRepository.create(createCategoryDto);
    const saved = await this.categoryRepository.save(category);
    return CategoryResponseSchema.parse(saved);
  }

  /**
   * 批量删除分类
   */
  async removeMany(deleteCategoriesDto: DeleteCategoriesDto): Promise<void> {
    await this.categoryRepository.delete({ id: In(deleteCategoriesDto.ids) });
  }

  /**
   * 修改分类
   */
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const exist = await this.categoryRepository.findOne({ where: { id } });
    if (!exist) {
      throw new BusinessException({ code: 10009, message: '指定的分类不存在' });
    }

    const nameExist = await this.categoryRepository.findOne({
      where: { name: updateCategoryDto.name },
    });
    if (nameExist && nameExist.id !== id) {
      throw new BusinessException({ code: 10010, message: '该分类名称已存在' });
    }

    const slugExist = await this.categoryRepository.findOne({
      where: { slug: updateCategoryDto.slug },
    });
    if (slugExist && slugExist.id !== id) {
      throw new BusinessException({
        code: 10011,
        message: '该SEO路径已被占用',
      });
    }

    await this.categoryRepository.update(id, updateCategoryDto);
    const updated = await this.categoryRepository.findOne({ where: { id } });
    return CategoryResponseSchema.parse(updated);
  }

  /**
   * 查找所有分类
   */
  async findAll(): Promise<CategoryResponseDto[]> {
    const list = await this.categoryRepository.find({
      relations: { tags: true },
      order: { createdAt: 'DESC' },
    });
    return z.array(CategoryResponseSchema).parse(list);
  }
}

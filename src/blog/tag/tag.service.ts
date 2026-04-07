import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Tag } from '../../sql/entities/tag.entity';
import {
  CreateTagDto,
  UpdateTagDto,
  DeleteTagsDto,
  TagResponseDto,
  TagResponseSchema,
} from './dto/tag.dto';
import { z } from 'zod';
import { BusinessException } from '../../common/exceptions/business.exception';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  /**
   * 添加标签
   */
  async create(createTagDto: CreateTagDto): Promise<TagResponseDto> {
    const exist = await this.tagRepository.findOne({
      where: { name: createTagDto.name },
    });
    if (exist) {
      throw new BusinessException({ code: 10008, message: '该标签名称已存在' });
    }
    const tag = this.tagRepository.create(createTagDto);
    const saved = await this.tagRepository.save(tag);
    return TagResponseSchema.parse(saved);
  }

  /**
   * 批量删除标签
   */
  async removeMany(deleteTagsDto: DeleteTagsDto): Promise<void> {
    await this.tagRepository.delete({ id: In(deleteTagsDto.ids) });
  }

  /**
   * 修改标签
   */
  async update(
    id: string,
    updateTagDto: UpdateTagDto,
  ): Promise<TagResponseDto> {
    const exist = await this.tagRepository.findOne({ where: { id } });
    if (!exist) {
      throw new BusinessException({ code: 10009, message: '指定的标签不存在' });
    }
    const nameExist = await this.tagRepository.findOne({
      where: { name: updateTagDto.name },
    });
    if (nameExist && nameExist.id !== id) {
      throw new BusinessException({ code: 10008, message: '该标签名称已存在' });
    }
    await this.tagRepository.update(id, updateTagDto);
    const updated = await this.tagRepository.findOne({ where: { id } });
    return TagResponseSchema.parse(updated);
  }

  /**
   * 查找所有标签
   */
  async findAll(categoryId: string): Promise<TagResponseDto[]> {
    const list = await this.tagRepository.find({
      where: { categoryId },
      order: { createdAt: 'DESC' },
    });
    return z.array(TagResponseSchema).parse(list);
  }
}

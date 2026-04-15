import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { PhotoDto, PhotoSchema } from '../../../system/dto/photo.dto';
import {
  CategoryResponseDto,
  CategoryResponseSchema,
} from '../../category/dto/category.dto';
import { TagResponseDto, TagResponseSchema } from '../../tag/dto/tag.dto';

// 模块内容 Schema
const PageModuleContentSchema = z.object({
  articleIds: z.array(z.string()).optional(),
  imageUrls: z.array(z.string()).optional(),
  photoIds: z.array(z.string()).optional(),
});

/**
 * 创建首页模块 DTO
 */
export const CreatePageModuleSchema = z.object({
  title: z.string().min(1, '请输入模块名称').max(100),
  type: z.string().min(1, '请输入模块类型'),
  intro: z.string().nullable().optional(),
  styleType: z.string().min(1, '请输入样式类型'),
  sortOrder: z.number().int().default(0),
  content: PageModuleContentSchema,
  isActive: z.boolean().default(true),
});

export class CreatePageModuleDto extends createZodDto(CreatePageModuleSchema) {
  @ApiProperty({ description: '模块名称' })
  title!: string;

  @ApiProperty({
    description: 'POST_LIST（文章列表）和 PHOTO_GALLERY（照片集）',
  })
  type!: string;

  @ApiProperty({ description: '模块介绍', required: false })
  intro?: string | null;

  @ApiProperty({ description: '样式类型' })
  styleType!: string;

  @ApiProperty({ description: '模块排序', default: 0 })
  sortOrder!: number;

  @ApiProperty({
    description: '核心内容',
    example: { articleIds: ['id1'], imageUrls: [], photoIds: [] },
  })
  content!: {
    articleIds?: string[];
    imageUrls?: string[];
    photoIds?: string[];
  };

  @ApiProperty({ description: '是否启用', default: true })
  isActive!: boolean;
}

/**
 * 更新首页模块 DTO
 */
export const UpdatePageModuleSchema = CreatePageModuleSchema.partial();
export class UpdatePageModuleDto extends createZodDto(UpdatePageModuleSchema) {}

/**
 * 模块批量排序 DTO
 */
export const ReorderPageModuleSchema = z.object({
  ids: z.array(z.string()).min(1, '请提供有效的ID列表'),
});

export class ReorderPageModuleDto extends createZodDto(
  ReorderPageModuleSchema,
) {
  @ApiProperty({ description: '排序后的ID列表', type: [String] })
  ids!: string[];
}

/**
 * 文章简要信息 (响应结构)
 */
export const ArticleSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string().optional().nullable(),
  bannerItem: PhotoSchema.optional().nullable(),
  category: CategoryResponseSchema.optional().nullable(),
  tags: z.array(TagResponseSchema).optional(),
});

export class ArticleSummaryDto extends createZodDto(ArticleSummarySchema) {
  @ApiProperty({ description: '文章ID' })
  id!: string;

  @ApiProperty({ description: '文章标题' })
  title!: string;

  @ApiProperty({ description: '文章摘要', required: false })
  summary?: string | null;

  @ApiProperty({ description: '文章封面图', required: false })
  bannerItem?: PhotoDto | null;
  @ApiProperty({ description: '文章分类', required: false })
  category?: CategoryResponseDto | null;
  @ApiProperty({
    description: '文章标签',
    required: false,
    type: [TagResponseDto],
  })
  tags?: TagResponseDto[];
}

/**
 * 带有文章列表的模块内容 (响应结构)
 */
export class PageModuleResponseContentDto {
  @ApiProperty({ description: '文章ID列表', type: [String], required: false })
  articleIds?: string[];

  @ApiProperty({ description: '图片URL列表', type: [String], required: false })
  imageUrls?: string[];

  @ApiProperty({ description: '图片ID列表', type: [String], required: false })
  photoIds?: string[];

  @ApiProperty({
    description: '展开后的文章列表',
    type: [ArticleSummaryDto],
    required: false,
  })
  articles?: ArticleSummaryDto[];

  @ApiProperty({
    description: '展开后的图片列表',
    type: [PhotoDto],
    required: false,
  })
  photoItems?: PhotoDto[];
}

/**
 * 完整模块响应 DTO (包含展开的文章数据)
 */
export const PageModuleResponseSchema = CreatePageModuleSchema.extend({
  id: z.string(),
  content: PageModuleContentSchema.extend({
    articles: z.array(ArticleSummarySchema).optional(),
    photoItems: z.array(PhotoSchema).optional(),
  }),
  createdAt: z.any(),
  updatedAt: z.any(),
});

export class PageModuleResponseDto extends createZodDto(
  PageModuleResponseSchema,
) {
  @ApiProperty({ description: '模块短ID' })
  id!: string;

  @ApiProperty({ description: '模块标题' })
  title!: string;

  @ApiProperty({
    description: 'POST_LIST（文章列表）和 PHOTO_GALLERY（照片集）',
  })
  type!: string;

  @ApiProperty({ description: '模块介绍', required: false })
  intro!: string | null;

  @ApiProperty({ description: '样式类型' })
  styleType!: string;

  @ApiProperty({ description: '排序权重' })
  sortOrder!: number;

  @ApiProperty({ description: '模块内容', type: PageModuleResponseContentDto })
  content!: PageModuleResponseContentDto;

  @ApiProperty({ description: '是否启用' })
  isActive!: boolean;

  @ApiProperty({ description: '创建时间' })
  createdAt!: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt!: Date;
}

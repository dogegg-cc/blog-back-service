import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TagResponseSchema, TagResponseDto } from '../../tag/dto/tag.dto';
import {
  CategoryResponseSchema,
  CategoryResponseDto,
} from '../../category/dto/category.dto';

// --- Create ---
export const CreateArticleSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(255, '标题过长'),
  content: z.string().min(1, '内容不能为空'),
  summary: z.string().max(500, '摘要过长').optional(),
  bannerUrl: z.string().max(255, '地址超长').optional(),
  categoryId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).optional(),
});

export class CreateArticleDto extends createZodDto(CreateArticleSchema) {
  @ApiProperty({ description: '标题' })
  title!: string;

  @ApiProperty({ description: '正文' })
  content!: string;

  @ApiPropertyOptional({ description: '摘要' })
  summary?: string;

  @ApiPropertyOptional({ description: '首图' })
  bannerUrl?: string;

  @ApiPropertyOptional({ description: '分类ID' })
  categoryId?: string | null;

  @ApiPropertyOptional({ description: '绑定的多个标签ID' })
  tagIds?: string[];
}

// --- Update ---
export const UpdateArticleSchema = CreateArticleSchema.partial();
export class UpdateArticleDto extends createZodDto(UpdateArticleSchema) {
  @ApiPropertyOptional({ description: '标题' })
  title?: string;
  @ApiPropertyOptional({ description: '正文' })
  content?: string;
  @ApiPropertyOptional({ description: '摘要' })
  summary?: string;
  @ApiPropertyOptional({ description: '首图' })
  bannerUrl?: string;
  @ApiPropertyOptional({ description: '分类ID' })
  categoryId?: string | null;
  @ApiPropertyOptional({ description: '绑定的多个标签ID' })
  tagIds?: string[];
}

// --- Query Filter ---
export const QueryArticleSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  categoryId: z.string().optional(),
  tagId: z.string().optional(),
});

export class QueryArticleDto extends createZodDto(QueryArticleSchema) {
  @ApiPropertyOptional({ description: '当前页码', default: 1 })
  page!: number;

  @ApiPropertyOptional({ description: '单页条目数', default: 10 })
  limit!: number;

  @ApiPropertyOptional({ description: '根据分类ID过滤' })
  categoryId?: string;

  @ApiPropertyOptional({ description: '根据标签ID过滤' })
  tagId?: string;
}

// --- Delete ---
export const DeleteArticlesSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, '至少选择一条删除'),
});
export class DeleteArticlesDto extends createZodDto(DeleteArticlesSchema) {
  @ApiProperty({ description: '待删除的ID数组', type: [String] })
  ids!: string[];
}

// --- Responses ---
// Base info without content
export const ArticleListResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string().nullable().optional(),
  bannerUrl: z.string().nullable().optional(),
  viewCount: z.number(),
  createdAt: z.any(),
  updatedAt: z.any(),
  category: CategoryResponseSchema.nullable().optional(),
  tags: z.array(TagResponseSchema).optional(),
});

export class ArticleListResponseDto extends createZodDto(
  ArticleListResponseSchema,
) {
  @ApiProperty({ description: '文章ID（短链接标识）' }) id!: string;
  @ApiProperty({ description: '文章标题' }) title!: string;
  @ApiPropertyOptional({ description: '文章小摘要' }) summary?: string | null;
  @ApiPropertyOptional({ description: '封面Banner URL' }) bannerUrl?:
    | string
    | null;
  @ApiProperty({ description: '总计浏览数' }) viewCount!: number;
  @ApiProperty({ description: '创建时间' }) createdAt!: Date;
  @ApiProperty({ description: '最后更新时间' }) updatedAt!: Date;
  @ApiPropertyOptional({
    type: CategoryResponseDto,
    description: '关联的分类节点',
  })
  category?: CategoryResponseDto | null;
  @ApiPropertyOptional({
    type: [TagResponseDto],
    description: '被贴上的标签集',
  })
  tags?: TagResponseDto[];
}

export const PaginatedArticleSchema = z.object({
  total: z.number(),
  items: z.array(ArticleListResponseSchema),
});
export class PaginatedArticleDto extends createZodDto(PaginatedArticleSchema) {
  @ApiProperty({ description: '总条目数' })
  total!: number;
  @ApiProperty({ type: [ArticleListResponseDto] })
  items!: ArticleListResponseDto[];
}

export const ArticleDetailResponseSchema = ArticleListResponseSchema.extend({
  content: z.string(),
});
export class ArticleDetailResponseDto extends createZodDto(
  ArticleDetailResponseSchema,
) {
  @ApiProperty({ description: '文章ID（短链接标识）' }) id!: string;
  @ApiProperty({ description: '文章标题' }) title!: string;
  @ApiProperty({ description: '完整的 Markdown 内容' }) content!: string;
  @ApiPropertyOptional({ description: '文章小摘要' }) summary?: string | null;
  @ApiPropertyOptional({ description: '封面Banner URL' }) bannerUrl?:
    | string
    | null;
  @ApiProperty({ description: '总计浏览数' }) viewCount!: number;
  @ApiProperty({ description: '创建时间' }) createdAt!: Date;
  @ApiProperty({ description: '最后更新时间' }) updatedAt!: Date;
  @ApiPropertyOptional({
    type: CategoryResponseDto,
    description: '关联的分类节点',
  })
  category?: CategoryResponseDto | null;
  @ApiPropertyOptional({
    type: [TagResponseDto],
    description: '被贴上的标签集',
  })
  tags?: TagResponseDto[];
}

import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export const CreateCategorySchema = z.object({
  name: z
    .string()
    .min(1, '分类名称不能为空')
    .max(50, '分类名称不能超过50个字符'),
  slug: z
    .string()
    .min(1, 'SEO路径不能为空')
    .max(50, 'SEO路径不能超过50个字符')
    .regex(/^[a-z0-9-]+$/, 'SEO路径只能包含小写字母、数字和连字符(-)'),
});

export class CreateCategoryDto extends createZodDto(CreateCategorySchema) {
  @ApiProperty({ description: '分类名称', example: '前端技术' })
  name!: string;

  @ApiProperty({
    description: '唯一标识短路径 (主要用于SEO)',
    example: 'front-end',
  })
  slug!: string;
}

export const UpdateCategorySchema = z.object({
  name: z
    .string()
    .min(1, '分类名称不能为空')
    .max(50, '分类名称不能超过50个字符'),
  slug: z
    .string()
    .min(1, 'SEO路径不能为空')
    .max(50, 'SEO路径不能超过50个字符')
    .regex(/^[a-z0-9-]+$/, 'SEO路径只能包含小写字母、数字和连字符(-)')
    .optional(),
});

export class UpdateCategoryDto extends createZodDto(UpdateCategorySchema) {
  @ApiProperty({ description: '分类名称', example: '后端技术' })
  name!: string;

  @ApiPropertyOptional({
    description: '唯一标识短路径 (主要用于SEO)',
    example: 'backend',
  })
  slug?: string;
}

export const DeleteCategoriesSchema = z.object({
  ids: z
    .array(z.string().min(1, 'ID不能为空').max(20, '未知的验证ID超长'))
    .min(1, '请至少选择一个分类进行删除'),
});

export class DeleteCategoriesDto extends createZodDto(DeleteCategoriesSchema) {
  @ApiProperty({ description: '待删除的分类ID数组', type: [String] })
  ids!: string[];
}

import { TagResponseDto, TagResponseSchema } from '../../tag/dto/tag.dto';

export const CategoryResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  tags: z.array(TagResponseSchema).optional(),
});

export class CategoryResponseDto extends createZodDto(CategoryResponseSchema) {
  @ApiProperty({ description: '分类ID' })
  id!: string;

  @ApiProperty({ description: '分类名称' })
  name!: string;

  @ApiProperty({ description: 'SEO短路径' })
  slug!: string;

  @ApiProperty({
    description: '关联标签',
    type: [TagResponseDto],
    required: false,
  })
  tags?: TagResponseDto[];
}

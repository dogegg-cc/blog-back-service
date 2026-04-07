import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const CreateTagSchema = z.object({
  name: z
    .string()
    .min(1, '标签名称不能为空')
    .max(50, '标签名称不能超过50个字符'),
  categoryId: z.string().min(1, '分类ID不能为空'),
});

export class CreateTagDto extends createZodDto(CreateTagSchema) {
  @ApiProperty({ description: '标签名称', example: '前端开发' })
  name!: string;

  @ApiProperty({ description: '分类ID', example: 'cat123' })
  categoryId!: string;
}

export const UpdateTagSchema = z.object({
  name: z
    .string()
    .min(1, '标签名称不能为空')
    .max(50, '标签名称不能超过50个字符')
    .optional(),
  categoryId: z.string().optional(),
});

export class UpdateTagDto extends createZodDto(UpdateTagSchema) {
  @ApiProperty({
    description: '标签名称',
    example: '后端开发',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: '分类ID',
    example: 'cat123',
    required: false,
  })
  categoryId?: string;
}

export const DeleteTagsSchema = z.object({
  ids: z
    .array(z.string().min(1, 'ID不能为空').max(20, '未知的验证ID超长'))
    .min(1, '请至少选择一个标签进行删除'),
});

export class DeleteTagsDto extends createZodDto(DeleteTagsSchema) {
  @ApiProperty({ description: '待删除的标签ID数组', type: [String] })
  ids!: string[];
}

export const TagResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  categoryId: z.string(),
});

export class TagResponseDto extends createZodDto(TagResponseSchema) {
  @ApiProperty({ description: '标签ID' })
  id!: string;

  @ApiProperty({ description: '标签名称' })
  name!: string;

  @ApiProperty({ description: '分类ID' })
  categoryId!: string;
}

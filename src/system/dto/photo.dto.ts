import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const PhotoMetadataSchema = z.object({
  mediumUrl: z.string().min(1, '图片中等路径'),
  thumbnailUrl: z.string().min(1, '图片缩略图路径'),
});

export class PhotoMetadataDto extends createZodDto(PhotoMetadataSchema) {
  @ApiProperty({ description: '图片中等路径' })
  mediumUrl!: string;

  @ApiProperty({ description: '图片缩略图路径' })
  thumbnailUrl!: string;
}

export const PhotoSchema = z.object({
  id: z.string().min(1, '图片id'),
  originalUrl: z.string().min(1, '图片原始路径'),
  metadata: PhotoMetadataSchema.optional().nullable(),
  height: z.number(),
  width: z.number(),
  ratio: z.number(),
  mimetype: z.string().min(1, '图片类型'),
  createdAt: z.any(),
});

export class PhotoDto extends createZodDto(PhotoSchema) {
  @ApiProperty({ description: '图片id' })
  id!: string;

  @ApiProperty({ description: '图片原始路径' })
  originalUrl!: string;

  @ApiProperty({ description: '图片元数据', required: false, nullable: true })
  metadata?: PhotoMetadataDto | null;

  @ApiProperty({ description: '图片高度' })
  height!: number;

  @ApiProperty({ description: '图片宽度' })
  width!: number;

  @ApiProperty({ description: '图片比例' })
  ratio!: number;

  @ApiProperty({ description: '图片类型' })
  mimetype!: string;

  @ApiProperty({ description: '创建时间' })
  createdAt!: Date;
}

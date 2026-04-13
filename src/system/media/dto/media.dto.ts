import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PhotoDto, PhotoSchema } from '../../dto/photo.dto';

// --- Query ---
export const GetStaticImagesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export class GetStaticImagesQueryDto extends createZodDto(
  GetStaticImagesQuerySchema,
) {
  @ApiPropertyOptional({ description: '当前页码', default: 1 })
  page!: number;

  @ApiPropertyOptional({ description: '每页条数', default: 10 })
  limit!: number;
}

// --- Paginated Response ---
export const StaticImagePageSchema = z.object({
  total: z.number(),
  items: z.array(PhotoSchema),
});

export class StaticImagePageDto extends createZodDto(StaticImagePageSchema) {
  @ApiProperty({ description: '总条数' })
  total!: number;

  @ApiProperty({ type: [PhotoDto], description: '图片列表' })
  items!: PhotoDto[];
}

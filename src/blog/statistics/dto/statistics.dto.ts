import { ApiProperty } from '@nestjs/swagger';

export class CategoryRatioDto {
  @ApiProperty({ description: '分类名称', example: '技术分享' })
  name!: string;

  @ApiProperty({ description: '文章数量', example: 10 })
  value!: number;
}

export class CategoryPopularityDto {
  @ApiProperty({ description: '分类名称', example: '前端开发' })
  name!: string;

  @ApiProperty({ description: '平均阅读量', example: 125 })
  value!: number;
}

export class PostTrendDto {
  @ApiProperty({ description: '统计周期（月份）', example: '2024-03' })
  label!: string;

  @ApiProperty({ description: '发布文章数量', example: 8 })
  value!: number;
}

export class StatisticsSummaryDto {
  @ApiProperty({ description: '文章总数', example: 50 })
  articleCount!: number;

  @ApiProperty({ description: '分类总数', example: 12 })
  categoryCount!: number;

  @ApiProperty({ description: '标签总数', example: 35 })
  tagCount!: number;

  @ApiProperty({ description: '全站阅读量', example: 12500 })
  totalViews!: number;
}

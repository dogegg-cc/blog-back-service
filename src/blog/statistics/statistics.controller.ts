import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import {
  CategoryRatioDto,
  CategoryPopularityDto,
  PostTrendDto,
} from './dto/statistics.dto';
import { ResponseDto } from '../../common/dto/response.dto';
import { ApiSuccessResponse } from '../../common/decorators/swagger.decorator';

@ApiTags('Blog Statistics - 博客数据统计')
@Controller('api/blog/statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('category-ratio')
  @ApiOperation({ summary: '各个分类下的文章数量占比 (饼图)' })
  @ApiSuccessResponse({
    type: CategoryRatioDto,
    isArray: true,
    description: '获取成功',
  })
  async getCategoryRatio() {
    const data = await this.statisticsService.getCategoryRatio();
    return ResponseDto.success(data, '获取成功');
  }

  @Get('category-popularity')
  @ApiOperation({ summary: '各分类平均热度/阅读量 (条形图)' })
  @ApiSuccessResponse({
    type: CategoryPopularityDto,
    isArray: true,
    description: '获取成功',
  })
  async getCategoryPopularity() {
    const data = await this.statisticsService.getCategoryPopularity();
    return ResponseDto.success(data, '获取成功');
  }

  @Get('post-trend')
  @ApiOperation({ summary: '文章发布趋势图 (面积图)' })
  @ApiSuccessResponse({
    type: PostTrendDto,
    isArray: true,
    description: '获取成功',
  })
  async getPublishingTrend() {
    const data = await this.statisticsService.getPublishingTrend();
    return ResponseDto.success(data, '获取成功');
  }
}

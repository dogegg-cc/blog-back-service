import { Controller, Get } from '@nestjs/common';
import { HomeService } from './home.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseDto } from '../../common/dto/response.dto';
import { ApiSuccessResponse } from '../../common/decorators/swagger.decorator';
import { HomeResponseDto } from './dto/home-response.dto';

@ApiTags('首页聚合')
@Controller('api/blog/home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '获取博客首页聚合数据' })
  @ApiSuccessResponse({
    type: HomeResponseDto,
    description: '获取成功',
  })
  async getHomeData() {
    const data = await this.homeService.getHomeData();
    return ResponseDto.success(data, '获取成功');
  }
}

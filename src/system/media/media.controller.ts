import { Controller, Get, Query, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { GetStaticImagesQueryDto, StaticImagePageDto } from './dto/media.dto';
import { ResponseDto } from '../../common/dto/response.dto';

@ApiTags('媒体管理')
@Controller('system/media')
export class MediaController {
  private readonly logger = new Logger(MediaController.name);

  constructor(private readonly mediaService: MediaService) {}

  @Get('static-images')
  @ApiOperation({ summary: '分页获取 public/static 目录下的所有照片' })
  @ApiResponse({
    status: 200,
    description: '成功返回静态图片列表',
    type: StaticImagePageDto,
  })
  getStaticImages(
    @Query() query: GetStaticImagesQueryDto,
  ): ResponseDto<StaticImagePageDto> {
    const result = this.mediaService.getStaticImages(query);
    return ResponseDto.success(result);
  }
}

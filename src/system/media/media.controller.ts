import { Controller, Get, Query, Logger, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { GetStaticImagesQueryDto, StaticImagePageDto } from './dto/media.dto';
import { ResponseDto } from '../../common/dto/response.dto';
import { ZodValidationPipe } from 'nestjs-zod';

@ApiTags('媒体管理')
@Controller('system/media')
export class MediaController {
  private readonly logger = new Logger(MediaController.name);

  constructor(private readonly mediaService: MediaService) {}

  @Get('static-images')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({ summary: '分页获取数据库中的所有照片' })
  @ApiResponse({
    status: 200,
    description: '成功返回图片列表',
    type: StaticImagePageDto,
  })
  async getStaticImages(
    @Query() query: GetStaticImagesQueryDto,
  ): Promise<ResponseDto<StaticImagePageDto>> {
    const result = await this.mediaService.getStaticImages(query);
    return ResponseDto.success(result);
  }
}

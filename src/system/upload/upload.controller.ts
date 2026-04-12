import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Logger,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

import { BusinessException } from '../../common/exceptions/business.exception';
import { UploadService } from './upload.service';
import { ResponseDto } from '../../common/dto/response.dto';
import { PhotoDto } from '../dto/photo.dto';
import { ApiSuccessResponse } from '../../common/decorators/swagger.decorator';

@ApiTags('文件资源(Upload)')
@ApiBearerAuth()
@Controller('api/upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @ApiOperation({ summary: '上传单张图片' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '待上传的图片文件 (限制在5MB以内)',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  @ApiSuccessResponse({
    description: '上传图片成功',
    type: PhotoDto,
  })
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp|gif)' }),
        ],
        // 如果校验失败，自定义异常处理
        exceptionFactory: (error) => {
          throw new BusinessException({
            code: 10013,
            message: error.includes('size')
              ? '图片太大啦，不能超过 5MB'
              : '不支持的图片格式',
          });
        },
      }),
    )
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BusinessException({
        code: 10014,
        message: '未接收到有效文件内容！',
      });
    }
    const data = await this.uploadService.uploadAndProcess(file);
    return ResponseDto.success(data);
  }
}

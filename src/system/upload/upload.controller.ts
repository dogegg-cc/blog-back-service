import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ResponseDto } from '../../common/dto/response.dto';
import * as fs from 'fs';
import ShortUniqueId from 'short-unique-id';
import { BusinessException } from '../../common/exceptions/business.exception';
import { imageSize } from 'image-size';

// 确保存储目录必须在线存在
const staticPath = join(process.cwd(), 'public/static');
if (!fs.existsSync(staticPath)) {
  fs.mkdirSync(staticPath, { recursive: true });
}

const uid = new ShortUniqueId({ length: 12 });

@ApiTags('文件资源(Upload)')
@ApiBearerAuth()
@Controller('api/upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

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
      storage: diskStorage({
        destination: staticPath,
        filename: (req, file, cb) => {
          // 清洗与生成安全文件名
          const ext = extname(file.originalname).toLowerCase();
          const filename = `${uid.rnd()}${ext}`;
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 硬限制 5MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(
            new BusinessException({
              code: 10013,
              message: '由于安全限制，仅支持常见的图片格式！',
            }),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BusinessException({
        code: 10014,
        message: '未接收到有效文件内容！',
      });
    }

    // 拼合最终通过网络可以直接访问的 URL 地址
    const url = `/static/${file.filename}`;

    // 获取图片尺寸
    let dimensions = { width: 0, height: 0 };
    try {
      if (fs.existsSync(file.path)) {
        const size = imageSize(fs.readFileSync(file.path));
        if (size) {
          dimensions = {
            width: size.width || 0,
            height: size.height || 0,
          };
        }
      }
    } catch (error) {
      this.logger.error(`获取图片尺寸失败: ${file.path}`, error);
    }

    return ResponseDto.success(
      {
        url,
        ...dimensions,
      },
      '图片上传成功',
    );
  }
}

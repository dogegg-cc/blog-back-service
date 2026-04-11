import { Injectable, Logger } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import { GetStaticImagesQueryDto, StaticImagePageDto } from './dto/media.dto';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly staticPath = join(process.cwd(), 'public', 'static');

  /**
   * 获取 public/static 目录下的所有照片并分页
   */
  getStaticImages(query: GetStaticImagesQueryDto): StaticImagePageDto {
    const { page, limit } = query;

    try {
      // 1. 检查目录是否存在
      if (!fs.existsSync(this.staticPath)) {
        this.logger.warn(`目录不存在: ${this.staticPath}`);
        return { total: 0, items: [] };
      }

      // 2. 读取目录下所有文件
      const allFiles = fs.readdirSync(this.staticPath);

      // 3. 过滤出图片文件
      const imageExtensions = [
        '.jpg',
        '.jpeg',
        '.png',
        '.gif',
        '.webp',
        '.svg',
        '.bmp',
      ];
      const imageFiles = allFiles
        .filter((file) => {
          const stats = fs.statSync(join(this.staticPath, file));
          if (!stats.isFile()) return false;
          const dotIndex = file.lastIndexOf('.');
          if (dotIndex === -1) return false;
          const ext = file.substring(dotIndex).toLowerCase();
          return imageExtensions.includes(ext);
        })
        .map((file) => ({
          url: `static/${file}`, // 拼接前缀 static/，满足用户 https://api.xxx.cc/static/xxx.jpg 的格式要求
          name: file,
        }));

      // 4. 分页逻辑
      const total = imageFiles.length;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedItems = imageFiles.slice(start, end);

      return {
        total,
        items: paginatedItems,
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`读取静态图片失败: ${msg}`);
      return { total: 0, items: [] };
    }
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Photo } from '../../sql/entities/photo.entity';
import { Repository } from 'typeorm';
import { PhotoSchema, PhotoDto } from '../dto/photo.dto';
import pLimit from 'p-limit';
import { BusinessException } from '../../common/exceptions/business.exception';
import ShortUniqueId from 'short-unique-id';
import * as fs from 'fs-extra';
import { join } from 'path';
import sharp from 'sharp';

const uid = new ShortUniqueId({ length: 12 });

@Injectable()
export class UploadService {
  private readonly queue = pLimit(1);
  constructor(
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
  ) {}
  async uploadAndProcess(file: Express.Multer.File): Promise<PhotoDto> {
    // 使用限制器包裹逻辑，确保多图并发上传时排队处理
    return this.queue(async () => {
      try {
        return await this.processImage(file);
      } catch (error) {
        console.error('图片处理失败:', error);
        throw new BusinessException({
          code: 10013,
          message: '图片处理或入库失败',
        });
      }
    });
  }

  private async processImage(file: Express.Multer.File): Promise<PhotoDto> {
    const staticDir = join(process.cwd(), 'public/static');
    const dirs = {
      original: join(staticDir, 'original'),
      medium: join(staticDir, 'medium'),
      thumbnail: join(staticDir, 'thumbnail'),
    };

    // 1. 确保目录存在
    await Promise.all(Object.values(dirs).map((dir) => fs.ensureDir(dir)));

    // 2. 生成文件名
    const newFileName = `${uid.rnd()}.webp`;

    // 3. Sharp 处理
    const image = sharp(file.buffer);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      throw new BusinessException({
        code: 10013,
        message: '无法解析图片元数据',
      });
    }

    // 4. 并行生成三个版本的 WebP 文件并写入磁盘
    await Promise.all([
      // 原图 WebP
      image
        .clone()
        .webp({ quality: 90 })
        .toFile(join(dirs.original, newFileName)),

      // 中图 (宽度 800)
      image
        .clone()
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(join(dirs.medium, newFileName)),

      // 缩略图 (宽度 400)
      image
        .clone()
        .resize({ width: 400, withoutEnlargement: true })
        .webp({ quality: 70 })
        .toFile(join(dirs.thumbnail, newFileName)),
    ]);

    // 5. 组装实体数据并保存到数据库
    const photo = this.photoRepository.create({
      originalUrl: `/static/original/${newFileName}`,
      width: metadata.width,
      height: metadata.height,
      ratio: parseFloat((metadata.width / metadata.height).toFixed(2)),
      mimetype: 'image/webp',
      metadata: {
        mediumUrl: `/static/medium/${newFileName}`,
        thumbnailUrl: `/static/thumbnail/${newFileName}`,
      },
    });
    const result = await this.photoRepository.save(photo);
    return PhotoSchema.parse(result);
  }
}

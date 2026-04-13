import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Photo } from '../../sql/entities/photo.entity';
import { PhotoDto } from '../dto/photo.dto';
import { GetStaticImagesQueryDto, StaticImagePageDto } from './dto/media.dto';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
  ) {}

  /**
   * 分页获取数据库中的所有照片
   */
  async getStaticImages(
    query: GetStaticImagesQueryDto,
  ): Promise<StaticImagePageDto> {
    const { page, limit } = query;

    try {
      const [items, total] = await this.photoRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: {
          createdAt: 'DESC',
        },
      });

      return {
        total,
        items: items.map((item) => ({
          ...item,
          metadata: item.metadata
            ? {
                mediumUrl: item.metadata.mediumUrl ?? '',
                thumbnailUrl: item.metadata.thumbnailUrl ?? '',
              }
            : null,
        })) as any as PhotoDto[],
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`获取图片列表失败: ${msg}`);
      return { total: 0, items: [] };
    }
  }
}

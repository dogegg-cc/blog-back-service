import 'dotenv/config';
import * as path from 'path';
import { AppDataSource } from '../data-source';
import { PageModule } from '../src/sql/entities/pageModule.entity';
import { Photo } from '../src/sql/entities/photo.entity';

async function migratePageModules() {
  try {
    console.log('--- 🧩 开始清洗页面模块数据 (PageModule Content) ---');

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const moduleRepo = AppDataSource.getRepository(PageModule);
    const photoRepo = AppDataSource.getRepository(Photo);

    // 1. 获取所有模块
    const modules = await moduleRepo.find();
    console.log(`读取到 ${modules.length} 个模块记录...`);

    let updatedCount = 0;

    for (const module of modules) {
      const { content } = module;

      // 检查是否有待处理的 imageUrls 且尚未处理 photoIds
      // 1. 必须有待处理的 imageUrls
      // 2. 且 photoIds 不存在，或者 photoIds 的长度为 0 (说明还没清洗过)
      const hasImageUrls = content?.imageUrls && content.imageUrls.length > 0;
      const hasPhotoIds = content?.photoIds && content.photoIds.length > 0;

      if (!hasImageUrls || hasPhotoIds) {
        console.log(`跳过模块 [${module.title}]: 无需处理或已完成清洗。`);
        continue;
      }

      // 准备存储找到的 ID
      const foundPhotoIds: string[] = [];
      const urls: string[] = [];
      for (const url of content.imageUrls as string[]) {
        // 提取不带后缀的文件名
        const fileNameWithoutExt = path.parse(url).name;

        // 在 Photo 表中匹配 originalUrl
        const matchedPhoto = await photoRepo
          .createQueryBuilder('photo')
          .where('photo.originalUrl LIKE :name', {
            name: `%/${fileNameWithoutExt}.webp`,
          })
          .getOne();

        if (matchedPhoto) {
          foundPhotoIds.push(matchedPhoto.id);
          urls.push(matchedPhoto.originalUrl);
        }
      }

      // 2. 如果找到了 ID，更新 content 字段
      if (foundPhotoIds.length > 0) {
        // 注意：TypeORM 对 JSON 字段的“深度监听”有时不灵敏
        // 建议重新赋值整个对象或确保 photoIds 被写入
        module.content = {
          ...module.content,
          imageUrls: urls,
          photoIds: foundPhotoIds,
        };

        await moduleRepo.save(module);
        console.log(
          `✅ 模块 [${module.title}] 已成功关联 ${foundPhotoIds.length} 张图片`,
        );
        updatedCount++;
      }
    }

    console.log(`\n--- 🎉 清洗完成！成功更新 ${updatedCount} 个模块 ---`);
  } catch (error) {
    console.error('💥 脚本运行崩溃:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

void migratePageModules();

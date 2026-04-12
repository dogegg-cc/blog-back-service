import * as path from 'path';
import * as fs from 'fs-extra';
import { glob } from 'glob';
import sharp from 'sharp';
import pLimit from 'p-limit';
import { AppDataSource } from '../data-source';
import { Photo } from '../src/sql/entities/photo.entity';

async function runMigration() {
  const limit = pLimit(3);
  try {
    console.log('-----初始化数据库-----');
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    const photoRepo = AppDataSource.getRepository(Photo);
    // 路径定义
    const staticDir = path.join(process.cwd(), 'public/static');
    const dirs = {
      original: path.join(staticDir, 'original'),
      medium: path.join(staticDir, 'medium'),
      thumb: path.join(staticDir, 'thumb'),
    };
    // 1. 自动创建目标文件夹（recursive: true）
    console.log('--- 📁 检查并创建目录 ---');
    await Promise.all(Object.values(dirs).map((dir) => fs.ensureDir(dir)));

    // 2. 扫描旧图片
    const allFiles = await glob('**/*.{jpg,jpeg,png,webp}', {
      cwd: staticDir,
      ignore: ['original/**', 'medium/**', 'thumb/**'],
      absolute: true,
    });

    if (allFiles.length === 0) {
      console.log('💡 未发现待处理的旧图片。');
      return;
    }
    console.log(`🚀 发现 ${allFiles.length} 张图片，准备处理...`);

    // 3. 循环处理
    const tasks = allFiles.map((fullPath) =>
      limit(async () => {
        const fileName = path.basename(fullPath);
        const baseName = path.basename(fullPath, path.extname(fullPath));
        const newFileName = `${baseName}.webp`;

        try {
          const image = sharp(fullPath);
          const metadata = await image.metadata();

          // --- 图像压缩策略 ---
          // 原图转 WebP
          await image
            .clone()
            .webp({ quality: 90 })
            .toFile(path.join(dirs.original, newFileName));

          // 中图 (800px, 且不放大)
          await image
            .clone()
            .resize({ width: 800, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(path.join(dirs.medium, newFileName));

          // 缩略图 (400px, 且不放大)
          await image
            .clone()
            .resize({ width: 400, withoutEnlargement: true })
            .webp({ quality: 70 })
            .toFile(path.join(dirs.thumb, newFileName));

          // --- 存入数据库 ---
          const photo = photoRepo.create({
            originalUrl: `/static/original/${newFileName}`,
            width: metadata.width,
            height: metadata.height,
            ratio: parseFloat((metadata.width / metadata.height).toFixed(2)),
            mimetype: 'image/webp',
            metadata: {
              mediumUrl: `/static/medium/${newFileName}`,
              thumbnailUrl: `/static/thumb/${newFileName}`,
            },
          });

          await photoRepo.save(photo);

          // --- 安全删除源文件 ---
          await fs.remove(fullPath);

          console.log(`✅ 已处理并清理: ${fileName}`);
        } catch (error) {
          console.error(`❌ 处理失败 [${fileName}]:`, error);
        }
      }),
    );
    await Promise.all(tasks);
    console.log('\n--- 🎉 所有图片处理完成，数据库已更新，原图已清理 ---');
  } catch (error) {
    console.error('失败了', error);
  } finally {
    await AppDataSource.destroy();
  }
}
void runMigration();

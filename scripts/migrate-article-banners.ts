import 'dotenv/config';
import * as path from 'path';
import { AppDataSource } from '../data-source';
import { Article } from '../src/sql/entities/article.entity';
import { Photo } from '../src/sql/entities/photo.entity';

async function migrateArticleBanners() {
  try {
    console.log('--- 📝 开始清洗文章封面数据 (Article Banner) ---');

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const articleRepo = AppDataSource.getRepository(Article);
    const photoRepo = AppDataSource.getRepository(Photo);

    // 1. 获取所有包含旧 banner_url 且没有 banner_id 的文章
    const articles = await articleRepo.find();
    console.log(`读取到 ${articles.length} 篇文章记录...`);

    let updatedCount = 0;

    for (const article of articles) {
      // 如果没有旧封面地址，或者已经关联过 ID，跳过
      if (!article.bannerUrl || article.bannerId) continue;

      // 2. 提取不带后缀的文件名 (如 "/static/cover.jpg" -> "cover")
      const fileNameWithoutExt = path.parse(article.bannerUrl).name;

      // 3. 在 Photo 表中通过 originalUrl 模糊匹配
      // 匹配规则：路径包含 "-文件名.webp"
      const matchedPhoto = await photoRepo
        .createQueryBuilder('photo')
        .where('photo.originalUrl LIKE :name', {
          name: `%/${fileNameWithoutExt}.webp`,
        })
        .getOne();

      if (matchedPhoto) {
        // 4. 关联新的 Photo ID
        article.bannerId = matchedPhoto.id;
        article.bannerUrl = matchedPhoto.originalUrl;
        await articleRepo.save(article);

        console.log(
          `✅ 文章 [${article.title}] 封面匹配成功: ${path.basename(matchedPhoto.originalUrl)}`,
        );
        updatedCount++;
      }
    }

    console.log(
      `读取到 ${articles.length} 篇文章记录...\n--- 🎉 清洗完成！成功更新 ${updatedCount} 篇文章。---`,
    );
  } catch (error) {
    console.error('💥 脚本崩溃:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

void migrateArticleBanners();

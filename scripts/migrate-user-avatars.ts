import 'dotenv/config';
import * as path from 'path';
import { AppDataSource } from '../data-source';
import { User } from '../src/sql/entities/user.entity';
import { Photo } from '../src/sql/entities/photo.entity';

async function migrateUserAvatars() {
  try {
    console.log('--- 👤 开始清洗用户头像数据 (基于 originalUrl 匹配) ---');

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const userRepo = AppDataSource.getRepository(User);
    const photoRepo = AppDataSource.getRepository(Photo);

    const users = await userRepo.find();
    console.log(`读取到 ${users.length} 个用户记录...`);

    let updatedCount = 0;

    for (const user of users) {
      // 跳过已处理或无旧头像的用户
      if (!user.avatar || user.avatarId) continue;

      // 1. 提取不带后缀的文件名 (例如 "/static/avatar.jpg" -> "avatar")
      const fileNameWithoutExt = path.parse(user.avatar).name;

      // 2. 在 Photo 表中匹配 original_url
      // 逻辑：originalUrl 包含 "-filename.webp" 这样的特征
      const matchedPhoto = await photoRepo
        .createQueryBuilder('photo')
        .where('photo.originalUrl LIKE :name', {
          name: `%/${fileNameWithoutExt}.webp`,
        })
        .getOne();

      if (matchedPhoto) {
        // 3. 关联 ID
        user.avatarId = matchedPhoto.id;
        user.avatar = matchedPhoto.originalUrl;
        await userRepo.save(user);

        console.log(
          `✅ 用户 [${user.username}] 匹配成功: ${path.basename(matchedPhoto.originalUrl)}`,
        );
        updatedCount++;
      }
    }
    console.log(
      `读取到 ${users.length} 个用户记录...\n--- 🎉 清洗完成！成功更新 ${updatedCount} 条记录 ---`,
    );
  } catch (error) {
    console.error('💥 脚本崩溃:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

void migrateUserAvatars();

import * as path from 'path';
import * as fs from 'fs-extra';

async function rollbackFilesOnly() {
  const staticDir = path.join(process.cwd(), 'public/static');
  const originalDir = path.join(staticDir, 'original');

  try {
    if (!(await fs.pathExists(originalDir))) {
      console.error('❌ 找不到 original 文件夹，无法还原。');
      return;
    }

    const files = await fs.readdir(originalDir);
    console.log(`📂 发现 ${files.length} 个文件待还原...`);

    for (const file of files) {
      if (file === '.DS_Store') continue;

      const fullPath = path.join(originalDir, file);

      // 逻辑：去除时间戳前缀
      // 我们之前的命名规则是 `${Date.now()}-${baseName}.webp`
      // 匹配第一个 "-" 之后的内容
      const firstDashIndex = file.indexOf('-');
      let restoredName = file;

      if (firstDashIndex !== -1) {
        restoredName = file.substring(firstDashIndex + 1);
      }

      // 注意：由于没有数据库，我们默认恢复为 webp。
      // 如果你非要改回 .jpg，可以将下面的 .webp 替换为 .jpg
      // 但请记住，文件本质已经是 webp 格式了。
      const targetPath = path.join(staticDir, restoredName);

      try {
        await fs.copy(fullPath, targetPath);
        console.log(`✅ 已提取: ${file} -> ${restoredName}`);
      } catch (err) {
        console.error(`❌ 提取失败 [${file}]:`, err);
      }
    }

    console.log('\n--- ✨ 还原操作完成 ---');
    console.log('现在图片已回到 static 根目录。');
  } catch (err) {
    console.error('💥 脚本运行出错:', err);
  }
}

void rollbackFilesOnly();

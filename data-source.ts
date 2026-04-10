import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 获取当前环境，默认为 development
const env = process.env.NODE_ENV || 'development';

// 根据环境加载对应的文件
dotenv.config({
  path: path.resolve(process.cwd(), `.env.${env}`),
});

console.log(`正在使用环境配置: .env.${env}`);

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432') || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '你的密码',
  database: process.env.DB_DATABASE || 'blog',

  // 关键配置：自动扫描所有的实体文件
  entities: [__dirname + '/src/**/*.entity{.ts}'],

  // 关键配置：迁移文件的存放位置
  migrations: [__dirname + '/src/migrations/*{.ts}'],

  synchronize: false, // 必须为 false，否则 Migration 无意义
  logging: true, // 建议开启，可以看到生成的 SQL 语句
});

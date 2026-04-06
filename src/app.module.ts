import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SqlModule } from './sql/sql.module';
import { RedisModule } from './redis/redis.module';
import { UserModule } from './user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './common/guards/auth.guard';
import { TagModule } from './blog/tag/tag.module';
import { CategoryModule } from './blog/category/category.module';
import { ArticleModule } from './blog/article/article.module';
import { PageModuleModule } from './blog/page-module/page-module.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UploadModule } from './system/upload/upload.module';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public/static'), // 本地物理路径
      serveRoot: '/static', // 这个路径将被作为静态服务器前缀跳过 Controller
    }),
    SqlModule,
    RedisModule,
    UserModule,
    TagModule,
    CategoryModule,
    ArticleModule,
    PageModuleModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}

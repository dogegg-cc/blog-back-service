import { Module } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { UserModule } from '../../user/user.module';
import { PageModuleModule } from '../page-module/page-module.module';
import { ArticleModule } from '../article/article.module';

@Module({
  imports: [UserModule, PageModuleModule, ArticleModule],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}

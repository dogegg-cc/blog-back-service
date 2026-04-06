import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PageModule } from '../../sql/entities/pageModule.entity';
import { Article } from '../../sql/entities/article.entity';
import { PageModuleService } from './page-module.service';
import { PageModuleController } from './page-module.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PageModule, Article])],
  controllers: [PageModuleController],
  providers: [PageModuleService],
  exports: [PageModuleService],
})
export class PageModuleModule {}

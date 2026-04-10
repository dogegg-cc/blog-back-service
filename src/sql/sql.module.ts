import { Module } from '@nestjs/common';
import { SqlConfigService, UserInitService } from './sql.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Article } from './entities/article.entity';
import { Category } from './entities/category.entity';
import { Tag } from './entities/tag.entity';

@Module({
  providers: [SqlConfigService, UserInitService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: SqlConfigService,
    }),
    TypeOrmModule.forFeature([User, Article, Category, Tag]),
  ],
})
export class SqlModule {}

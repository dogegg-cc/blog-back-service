import { Module } from '@nestjs/common';
import { ProjectConfigService, DbInitService } from './tool.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
@Module({
  providers: [ProjectConfigService, DbInitService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: ProjectConfigService,
    }),
    TypeOrmModule.forFeature([User]),
  ],
  exports: [ProjectConfigService],
})
export class ToolModule {}

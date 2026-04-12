import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Photo } from '../../sql/entities/photo.entity';
import { UploadService } from './upload.service';

@Module({
  imports: [TypeOrmModule.forFeature([Photo])],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}

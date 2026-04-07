import { Module } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { UserModule } from '../../user/user.module';
import { PageModuleModule } from '../page-module/page-module.module';

@Module({
  imports: [UserModule, PageModuleModule],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}

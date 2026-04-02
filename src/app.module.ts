import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ToolModule } from './tool/tool.module';

@Module({
  imports: [ToolModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

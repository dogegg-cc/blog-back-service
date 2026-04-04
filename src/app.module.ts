import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SqlModule } from './sql/sql.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [SqlModule, RedisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SqlModule } from './sql/sql.module';
import { RedisModule } from './redis/redis.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [SqlModule, RedisModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

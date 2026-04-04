import { Module } from '@nestjs/common';
import { RedisModule as IORedisModule } from '@nestjs-modules/ioredis';
import { ConfigModule } from '@nestjs/config';
import { RedisConfigService, RedisConnectionService } from './redis.service';

@Module({
  imports: [
    ConfigModule,
    IORedisModule.forRootAsync({
      useClass: RedisConfigService,
    }),
  ],
  providers: [RedisConfigService, RedisConnectionService],
  exports: [IORedisModule],
})
export class RedisModule {}

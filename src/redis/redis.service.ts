import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  RedisModuleOptions,
  RedisModuleOptionsFactory,
  InjectRedis,
} from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Injectable()
export class RedisConfigService implements RedisModuleOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  get redisHost(): string {
    return this.config.get<string>('REDIS_HOST') || '127.0.0.1';
  }

  get redisPort(): number {
    return parseInt(this.config.get<string>('REDIS_PORT') || '6379', 10);
  }

  get redisPassword(): string | undefined {
    return this.config.get<string>('REDIS_PASSWORD') || undefined; // If empty string, map to undefined
  }

  get redisDb(): number {
    return parseInt(this.config.get<string>('REDIS_DB') || '0', 10);
  }

  createRedisModuleOptions(): RedisModuleOptions {
    return {
      type: 'single',
      options: {
        host: this.redisHost,
        port: this.redisPort,
        password: this.redisPassword,
        db: this.redisDb,
      },
    };
  }
}

@Injectable()
export class RedisConnectionService implements OnModuleInit {
  private readonly logger = new Logger(RedisConnectionService.name);

  // 注入已实例化的 Redis 客户端
  constructor(@InjectRedis() private readonly redis: Redis) {}

  onModuleInit() {
    // 监听连接成功的事件
    this.redis.on('connect', () => {
      this.logger.log('Redis 连接建立成功 ✅');
    });

    // 监听连接出现异常的事件
    this.redis.on('error', (err) => {
      this.logger.error('Redis 出现连接异常 ❌', err);
    });

    // 主动发送一个 ping 测试命令
    this.redis
      .ping()
      .then((res) => {
        this.logger.log(`Redis PING 测试响应: ${res} 🚀`);
      })
      .catch((err) => {
        this.logger.error('Redis PING 操作失败', err);
      });
  }
}

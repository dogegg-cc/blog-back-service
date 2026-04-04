import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class ProjectConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  get dbHost(): string {
    return this.config.get<string>('DB_HOST')!;
  }

  get dbPort(): number {
    return parseInt(this.config.get<string>('DB_PORT')!, 10) || 5432;
  }

  get dbUsername(): string {
    return this.config.get<string>('DB_USERNAME')!;
  }

  get dbPassword(): string {
    return this.config.get<string>('DB_PASSWORD')!;
  }

  get dbDatabase(): string {
    return this.config.get<string>('DB_DATABASE')!;
  }

  get dbSync(): boolean {
    return this.config.get<string>('DB_SYNC')! === 'true';
  }

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const isProduction = this.config.get<string>('NODE_ENV') === 'production';
    const enableSync = isProduction ? false : this.dbSync; // 严禁在生产环境开启 `synchronize: true`

    return {
      type: 'postgres',
      host: this.dbHost,
      port: this.dbPort,
      username: this.dbUsername,
      password: this.dbPassword,
      database: this.dbDatabase,
      autoLoadEntities: true,
      synchronize: enableSync, // 开发环境适用，生产环境强制关闭
      logging: enableSync,
    };
  }
}

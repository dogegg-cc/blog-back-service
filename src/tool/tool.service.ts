import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  TypeOrmOptionsFactory,
  TypeOrmModuleOptions,
  InjectRepository,
} from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';

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
    return this.config.get<boolean>('DB_SYNC')!;
  }

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.dbHost,
      port: this.dbPort,
      username: this.dbUsername,
      password: this.dbPassword,
      database: this.dbDatabase,
      autoLoadEntities: true,
      synchronize: this.dbSync, // 开发环境适用，生产环境建议关闭
      logging: this.dbSync,
    };
  }
}

@Injectable()
export class DbInitService implements OnModuleInit {
  private readonly logger = new Logger(DbInitService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    this.logger.log('检查数据库初始化状态...');
    const count = await this.userRepository.count();

    if (count === 0) {
      this.logger.log('User 表为空，准备创建默认管理员账号...');
      const defaultUsername =
        this.config.get<string>('DEFAULT_USERNAME') || 'admin';
      const defaultPassword =
        this.config.get<string>('DEFAULT_PASSWORD') || '123456';

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

      const user = this.userRepository.create({
        name: defaultUsername,
        password: hashedPassword,
      });
      await this.userRepository.save(user);
      this.logger.log(`默认管理员账号 [${defaultUsername}] 创建成功。`);
    } else {
      this.logger.log('数据库已存在数据，跳过初始化。');
    }
  }
}

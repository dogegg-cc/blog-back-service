import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { BcryptUtil } from '../common/utils/bcrypt.util';

@Injectable()
export class SqlConfigService implements TypeOrmOptionsFactory {
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
      synchronize: false, // 开发环境适用，生产环境强制关闭
      logging: enableSync,
      migrations: ['./src/migrations/*.ts'],
      migrationsRun: enableSync,
    };
  }
}

@Injectable()
export class UserInitService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UserInitService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  /**
   * 应用启动阶段的回调钩子，负责初始化默认系统设置
   * 主要检查 sys_user 实体是否存在管理员账户，若无则自动根据环境变量生成默认管理员
   */
  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('检查数据库初始化状态...');
    // 查询现有用户总数，以判断是否需要进行初始数据录入
    const count = await this.userRepository.count();

    if (count === 0) {
      this.logger.log('User 表为空，准备创建默认管理员账号...');

      // 从配置服务获取默认的管理员用户名和密码
      const defaultUsername = this.config.get<string>('DEFAULT_USERNAME') || '';
      const defaultPassword = this.config.get<string>('DEFAULT_PASSWORD') || '';

      // 密码写入数据库前必须经过 hash 加密，严禁明文存储敏感信息
      const hashedPassword = await BcryptUtil.hashPassword(defaultPassword);

      // 通过 TypeORM Entity 实例创建一个新用户，确保所有默认值与时区正确写入
      const user = this.userRepository.create({
        username: defaultUsername,
        password: hashedPassword,
      });
      // 将新建管理账户保存入库
      await this.userRepository.save(user);
      this.logger.log(`默认管理员账号 [${defaultUsername}] 创建成功。`);
    } else {
      this.logger.log('数据库已存在数据，跳过初始化。');
    }
  }
}

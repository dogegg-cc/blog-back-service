import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';

@Injectable()
export class UserInitService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UserInitService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('检查数据库初始化状态...');
    const count = await this.userRepository.count();

    if (count === 0) {
      this.logger.log('User 表为空，准备创建默认管理员账号...');
      const defaultUsername = this.config.get<string>('DEFAULT_USERNAME') || '';
      const defaultPassword = this.config.get<string>('DEFAULT_PASSWORD') || '';

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

      const user = this.userRepository.create({
        username: defaultUsername,
        password: hashedPassword,
      });
      await this.userRepository.save(user);
      this.logger.log(`默认管理员账号 [${defaultUsername}] 创建成功。`);
    } else {
      this.logger.log('数据库已存在数据，跳过初始化。');
    }
  }
}

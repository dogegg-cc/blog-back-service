import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../sql/entities/user.entity';
import { Repository } from 'typeorm';
import { LogonDto } from './dto/logon.dto';
import * as bcrypt from 'bcrypt';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { randomUUID } from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRedis()
    private readonly redisClient: Redis,
  ) {}

  /**
   * 处理用户登录逻辑：校验账号密码，并生成存入 Redis 的 token
   */
  async logon(logonDto: LogonDto) {
    const { username, password } = logonDto;

    // 根据账号查询用户，必须显式 select password 才能用于比对
    const user = await this.userRepository.findOne({
      where: { username },
      select: ['id', 'username', 'password', 'isUpdatePassword'],
    });

    if (!user) {
      throw new UnauthorizedException('账号或密码错误');
    }

    // 校验密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('账号或密码错误');
    }

    // 创建 token (UUID)
    const token = randomUUID();

    // 准备存入 Redis 的用户信息（排除敏感数据）
    const userInfo = {
      id: user.id,
      username: user.username,
      isUpdatePassword: user.isUpdatePassword,
    };

    // 将 token 存入 Redis，有效期设定为 24 小时
    await this.redisClient.set(
      `token:${token}`,
      JSON.stringify(userInfo),
      'EX',
      60 * 60 * 24,
    );

    // 返回给控制器的结果
    return {
      token,
      isUpdatePassword: user.isUpdatePassword,
    };
  }
}

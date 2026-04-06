import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../sql/entities/user.entity';
import { Repository } from 'typeorm';
import {
  LogonDto,
  LogonResponseDto,
  LogonResponseSchema,
} from './dto/logon.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { randomUUID } from 'crypto';
import { BusinessException } from '../common/exceptions/business.exception';
import { ErrorCode } from '../common/constants/error-code.constant';
import { BcryptUtil } from '../common/utils/bcrypt.util';
import { UserInfoDto, UserInfoSchema } from './dto/user-info.dto';

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
  async logon(logonDto: LogonDto): Promise<LogonResponseDto> {
    const { username, password } = logonDto;

    // 根据账号查询用户，必须显式 select password 才能用于比对
    const user = await this.userRepository.findOne({
      where: { username },
      select: [
        'id',
        'username',
        'password',
        'isUpdatePassword',
        'name',
        'email',
        'github',
        'slogan',
        'avatar',
      ],
    });

    if (!user) {
      throw new BusinessException(ErrorCode.ACCOUNT_PASSWORD_ERROR);
    }

    // 校验密码
    const isPasswordValid = await BcryptUtil.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BusinessException(ErrorCode.ACCOUNT_PASSWORD_ERROR);
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
    return LogonResponseSchema.parse({ ...user, token: token });
  }

  /**
   * 处理修改密码逻辑
   */
  async updatePassword(
    userId: string,
    token: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    const { oldPassword, newPassword } = updatePasswordDto;

    if (oldPassword === newPassword) {
      throw new BusinessException(ErrorCode.PASSWORD_SAME);
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new BusinessException(ErrorCode.USER_NOT_FOUND);
    }

    const isPasswordValid = await BcryptUtil.comparePassword(
      oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BusinessException(ErrorCode.PASSWORD_ERROR);
    }

    // 生成新密码的 hash
    const newPasswordHash = await BcryptUtil.hashPassword(newPassword);

    // 更新密码及 isUpdatePassword 标志
    await this.userRepository.update(userId, {
      password: newPasswordHash,
      isUpdatePassword: true,
    });

    // 更新当前 token 对应的 Redis 缓存信息
    await this.updateRedisCache(token, { isUpdatePassword: true });
  }

  /**
   * 利用 token 更新 Redis 中缓存的用户信息字段
   */
  async updateRedisCache(
    token: string,
    partialUser: Partial<User>,
  ): Promise<void> {
    if (!token || Object.keys(partialUser).length === 0) return;

    const cacheKey = `token:${token}`;
    const cacheData = await this.redisClient.get(cacheKey);
    if (cacheData) {
      try {
        const userInfo = JSON.parse(cacheData) as Record<string, unknown>;

        // 用传递过来的 user 中带数据的字段，去覆写已有缓存对象
        for (const key of Object.keys(partialUser)) {
          const val = (partialUser as Record<string, unknown>)[key];
          if (val !== undefined) {
            userInfo[key] = val;
          }
        }

        const ttl = await this.redisClient.ttl(cacheKey);
        if (ttl > 0) {
          await this.redisClient.set(
            cacheKey,
            JSON.stringify(userInfo),
            'EX',
            ttl,
          );
        }
      } catch {
        // 忽略解析异常
      }
    }
  }

  /**
   * 处理退出登录逻辑
   */
  async logoff(token?: string): Promise<void> {
    if (token) {
      await this.redisClient.del(`token:${token}`);
    }
  }

  /**
   * 更新用户信息
   */
  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserInfoDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BusinessException(ErrorCode.USER_NOT_FOUND);
    }

    await this.userRepository.update(userId, updateUserDto);
    const userInfo = (await this.userRepository.findOne({
      where: { id: userId },
    })) as User;
    // 返回更新后的完整用户信息
    return UserInfoSchema.parse(userInfo);
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(userId: string): Promise<UserInfoDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BusinessException(ErrorCode.USER_NOT_FOUND);
    }

    return UserInfoSchema.parse(user);
  }
}

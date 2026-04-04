import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../sql/entities/user.entity';
import { Repository } from 'typeorm';
import { LogonDto, LogonResponseDto } from './dto/logon.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { randomUUID } from 'crypto';
import { BusinessException } from '../common/exceptions/business.exception';
import { ErrorCode } from '../common/constants/error-code.constant';
import { BcryptUtil } from '../common/utils/bcrypt.util';

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
      select: ['id', 'username', 'password', 'isUpdatePassword'],
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
    return {
      token,
      isUpdatePassword: user.isUpdatePassword,
    };
  }

  /**
   * 处理修改密码逻辑
   */
  async updatePassword(
    userId: string,
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
  }

  /**
   * 处理退出登录逻辑
   */
  async logoff(token?: string): Promise<void> {
    if (token) {
      await this.redisClient.del(`token:${token}`);
    }
  }
}

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { BusinessException } from '../exceptions/business.exception';
import { ErrorCode } from '../constants/error-code.constant';

interface AuthenticatedRequest {
  headers: Record<string, string | string[] | undefined>;
  user?: Record<string, unknown>;
  token?: string | string[];
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRedis() private readonly redisClient: Redis,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 如果接口被标记为 public，直接放行
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    // Headers 名称在 Express 中会自动转换为小写
    const token = request.headers['dogtoken'];

    if (!token || typeof token !== 'string') {
      throw new BusinessException(ErrorCode.TOKEN_MISSING);
    }

    // 与 Redis 中的 token 进行比对，获取用户信息
    const userInfoStr = await this.redisClient.get(`token:${token}`);

    if (!userInfoStr) {
      throw new BusinessException(ErrorCode.TOKEN_INVALID);
    }

    try {
      const userInfo = JSON.parse(userInfoStr) as Record<string, unknown>;
      // 将用户信息传递下去，供其他接口直接使用
      request.user = userInfo;
      // 也可以为了方便扩展，把 token 也挂在 request 上
      request.token = token;
    } catch {
      throw new BusinessException(ErrorCode.TOKEN_PARSE_ERROR);
    }

    return true;
  }
}

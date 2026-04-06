import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const LogonSchema = z.object({
  username: z.string().min(1, '请输入账号'),
  password: z.string().min(1, '请输入密码'),
});

export class LogonDto extends createZodDto(LogonSchema) {
  @ApiProperty({ description: '用户账号' })
  username!: string;

  @ApiProperty({ description: '用户密码' })
  password!: string;
}

export const LogonResponseSchema = z.object({
  token: z.string().min(1, 'token'),
  isUpdatePassword: z.boolean().default(false),
  name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  github: z.string().optional().nullable(),
  slogan: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
});

export class LogonResponseDto extends createZodDto(LogonResponseSchema) {
  @ApiProperty({ description: 'token' })
  token!: string;

  @ApiProperty({ description: '是否需要修改默认密码' })
  isUpdatePassword!: boolean;

  @ApiProperty({ description: '用户名称' })
  name?: string | null;

  @ApiProperty({ description: '用户邮箱' })
  email?: string | null;

  @ApiProperty({ description: '用户github' })
  github?: string | null;

  @ApiProperty({ description: '用户座右铭' })
  slogan?: string | null;

  @ApiProperty({ description: '用户头像' })
  avatar?: string | null;
}

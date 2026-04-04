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
});

export class LogonResponseDto extends createZodDto(LogonResponseSchema) {
  @ApiProperty({ description: 'token' })
  token!: string;

  @ApiProperty({ description: '是否需要修改默认密码' })
  isUpdatePassword!: boolean;
}

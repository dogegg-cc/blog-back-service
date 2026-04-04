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

import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

// 至少包含一个小写、一个大写、一个数字、一个特殊字符，最少8位
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const UpdatePasswordSchema = z.object({
  oldPassword: z.string().min(1, '请输入旧密码'),
  newPassword: z
    .string()
    .regex(passwordRegex, '密码需包含大小写字母、数字和特殊字符，且至少8位'),
});

export class UpdatePasswordDto extends createZodDto(UpdatePasswordSchema) {
  @ApiProperty({ description: '旧密码' })
  oldPassword!: string;

  @ApiProperty({ description: '新密码' })
  newPassword!: string;
}

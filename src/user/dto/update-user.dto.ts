import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const UpdateUserSchema = z.object({
  name: z.string().max(255, '名称过长').optional(),
  email: z
    .string()
    .email('邮箱格式不正确')
    .max(255)
    .optional()
    .or(z.literal('')),
  github: z.string().max(255).optional().or(z.literal('')),
  slogan: z.string().max(255).optional().or(z.literal('')),
  avatar: z.string().max(255).optional().or(z.literal('')),
  avatarId: z.string().max(255).optional().or(z.literal('')),
});

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {
  @ApiProperty({ description: '用户名称', required: false })
  name?: string;

  @ApiProperty({ description: '用户邮箱', required: false })
  email?: string;

  @ApiProperty({ description: 'github地址', required: false })
  github?: string;

  @ApiProperty({ description: '座右铭', required: false })
  slogan?: string;

  @ApiProperty({ description: '头像地址', required: false })
  avatar?: string;

  @ApiProperty({ description: '头像ID', required: false })
  avatarId?: string;
}

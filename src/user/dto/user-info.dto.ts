import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { PhotoDto, PhotoSchema } from '../../system/dto/photo.dto';

export const UserInfoSchema = z.object({
  name: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  github: z.string().optional().nullable(),
  slogan: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  isUpdatePassword: z.boolean(),
  avatarItem: PhotoSchema.optional().nullable(),
});

export class UserInfoDto extends createZodDto(UserInfoSchema) {
  @ApiProperty({ description: '用户名称' })
  name?: string | null;

  @ApiProperty({ description: '用户邮箱' })
  email?: string | null;

  @ApiProperty({ description: 'github地址' })
  github?: string | null;

  @ApiProperty({ description: '座右铭' })
  slogan?: string | null;

  @ApiProperty({ description: '头像地址' })
  avatar?: string | null;

  @ApiProperty({ description: '是否修改过密码' })
  isUpdatePassword!: boolean;

  @ApiProperty({ description: '用户头像详细信息' })
  avatarItem?: PhotoDto | null;
}

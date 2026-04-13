import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';
import { PageModuleResponseSchema } from '../../page-module/dto/page-module.dto';
import { PhotoDto, PhotoSchema } from '../../../system/dto/photo.dto';

/**
 * 博主信息 Schema
 */
export const HomeUserSchema = z.object({
  name: z.string().describe('博主姓名'),
  email: z.string().describe('电子邮箱'),
  github: z.string().describe('github地址'),
  slogan: z.string().describe('座右铭'),
  avatarItem: PhotoSchema.nullable().optional().describe('头像详细信息'),
});

export class HomeUserDto extends createZodDto(HomeUserSchema) {
  @ApiProperty({ description: '博主姓名' })
  name!: string;

  @ApiProperty({ description: '电子邮箱' })
  email!: string;

  @ApiProperty({ description: 'github地址' })
  github!: string;

  @ApiProperty({ description: '座右铭' })
  slogan!: string;

  @ApiProperty({ description: '头像详细信息', required: false, nullable: true })
  avatarItem?: PhotoDto | null;
}

/**
 * 首页响应 Schema
 */
export const HomeResponseSchema = z.object({
  user: HomeUserSchema.nullable().describe('博主信息'),
  pageModule: z.array(PageModuleResponseSchema).describe('首页模块列表'),
});

export class HomeResponseDto extends createZodDto(HomeResponseSchema) {
  @ApiProperty({ description: '博主信息', type: HomeUserDto, nullable: true })
  user!: HomeUserDto | null;

  @ApiProperty({ description: '首页模块列表', type: [String] }) // Swagger 里的具体 type 稍后在 Service 中应用
  pageModule!: any[];
}

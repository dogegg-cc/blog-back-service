import { ApiProperty } from '@nestjs/swagger';
import { PageModuleResponseDto } from '../../page-module/dto/page-module.dto';

export class HomeUserDto {
  @ApiProperty({ description: '博主姓名' })
  name!: string;

  @ApiProperty({ description: '电子邮箱' })
  email!: string;

  @ApiProperty({ description: 'github地址' })
  github!: string;

  @ApiProperty({ description: '座右铭' })
  slogan!: string;

  @ApiProperty({ description: '头像' })
  avatar!: string;
}

export class HomeResponseDto {
  @ApiProperty({ description: '博主信息', type: HomeUserDto, nullable: true })
  user!: HomeUserDto | null;

  @ApiProperty({ description: '首页模块列表', type: [PageModuleResponseDto] })
  pageModule!: PageModuleResponseDto[];
}

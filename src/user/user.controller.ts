import { Controller, Post, Body, UsePipes, Headers } from '@nestjs/common';
import { UserService } from './user.service';
import { LogonDto, LogonResponseDto } from './dto/logon.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserInfoDto } from './dto/user-info.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { ResponseDto } from '../common/dto/response.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiSuccessResponse } from '../common/decorators/swagger.decorator';

@ApiTags('用户管理')
@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('logon')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({ summary: '用户登录' })
  @ApiSuccessResponse({
    description: '登录成功',
    type: LogonResponseDto,
  })
  async logon(@Body() logonDto: LogonDto) {
    const data = await this.userService.logon(logonDto);
    return ResponseDto.success(data, '登录成功');
  }

  @Public()
  @Post('logoff')
  @ApiOperation({ summary: '用户退出登录' })
  @ApiBearerAuth()
  async logoff(@Headers('dogtoken') token?: string) {
    await this.userService.logoff(token);
    return ResponseDto.success(null, '退出登录成功');
  }

  @Post('updatePassword')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({ summary: '修改密码' })
  @ApiBearerAuth()
  async updatePassword(
    @Headers('dogtoken') token: string,
    @CurrentUser('id') userId: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    await this.userService.updatePassword(userId, token, updatePasswordDto);
    return ResponseDto.success(null, '密码修改成功');
  }

  @Post('update')
  @UsePipes(ZodValidationPipe)
  @ApiOperation({ summary: '修改用户信息' })
  @ApiBearerAuth()
  @ApiSuccessResponse({
    description: '修改成功',
    type: UserInfoDto,
  })
  async update(
    @CurrentUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const data = await this.userService.update(userId, updateUserDto);
    return ResponseDto.success(data, '信息修改成功');
  }
}

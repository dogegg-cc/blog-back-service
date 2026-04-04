import { Controller, Post, Body, UsePipes, Headers } from '@nestjs/common';
import { UserService } from './user.service';
import { LogonDto } from './dto/logon.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { ResponseDto } from '../common/dto/response.dto';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('logon')
  @UsePipes(ZodValidationPipe)
  async logon(@Body() logonDto: LogonDto) {
    const data = await this.userService.logon(logonDto);
    return ResponseDto.success(data, '登录成功');
  }

  @Public()
  @Post('logoff')
  async logoff(@Headers('dogtoken') token?: string) {
    await this.userService.logoff(token);
    return ResponseDto.success(null, '退出登录成功');
  }

  @Post('updatePassword')
  @UsePipes(ZodValidationPipe)
  async updatePassword(
    @CurrentUser('id') userId: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    await this.userService.updatePassword(userId, updatePasswordDto);
    return ResponseDto.success(null, '密码修改成功');
  }
}

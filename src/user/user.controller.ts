import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import { UserService } from './user.service';
import { LogonDto } from './dto/logon.dto';
import { ZodValidationPipe } from 'nestjs-zod';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('logon')
  @HttpCode(HttpStatus.OK)
  @UsePipes(ZodValidationPipe)
  async logon(@Body() logonDto: LogonDto) {
    const data = await this.userService.logon(logonDto);
    return {
      code: 200,
      message: '登录成功',
      data,
    };
  }
}

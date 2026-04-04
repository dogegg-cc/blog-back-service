import { ApiProperty, ApiExtraModels } from '@nestjs/swagger';

export class ResponseDto<T = null> {
  @ApiProperty({ description: '响应状态码' })
  code!: number;

  @ApiProperty({ description: '响应消息' })
  message!: string;

  @ApiProperty({ description: '响应数据' })
  @ApiExtraModels()
  data!: T;

  static success<T>(
    data: T = null as unknown as T,
    message = '成功',
  ): ResponseDto<T> {
    return {
      code: 1,
      message,
      data,
    };
  }
}

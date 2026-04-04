export class ResponseDto<T = null> {
  code!: number;
  message!: string;
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

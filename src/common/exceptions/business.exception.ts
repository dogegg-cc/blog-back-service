import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  private readonly businessCode: number;

  constructor(error: { code: number; message: string }) {
    super(error.message, HttpStatus.OK);
    this.businessCode = error.code;
  }

  getBusinessCode() {
    return this.businessCode;
  }
}

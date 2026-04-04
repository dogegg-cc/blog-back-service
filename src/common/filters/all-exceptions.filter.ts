import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    // type Response & Request from express implicitly or explicitly
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let code = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';

    if (exception instanceof ZodValidationException) {
      code = exception.getStatus();
      try {
        const zodError = exception.getZodError() as ZodError;
        message = String(zodError.issues.map((e) => e.message).join(', '));
      } catch {
        message = exception.message;
      }
    } else if (exception instanceof HttpException) {
      code = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null && 'message' in res) {
        const msg = (res as { message: unknown }).message;
        if (Array.isArray(msg)) {
          message = msg.map(String).join(', ');
        } else if (typeof msg === 'string') {
          message = msg;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(
      `${String(request.method)} ${String(request.url)} - ${String(code)} - ${message}`,
      exception instanceof Error ? exception.stack : '',
    );

    // 根据要求，统一返回格式： code非200表示错误
    response.status(code).json({
      code,
      data: null,
      message,
    });
  }
}

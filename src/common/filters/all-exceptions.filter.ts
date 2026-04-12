import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ZodValidationException } from 'nestjs-zod';
import { BusinessException } from '../exceptions/business.exception';
import { ZodError } from 'zod';
import { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (request.url === '/favicon.ico') {
      return response.status(204).end();
    }

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';

    if (exception instanceof BusinessException) {
      httpStatus = HttpStatus.OK;
      code = exception.getBusinessCode();
      message = exception.message;
    } else if (exception instanceof ZodValidationException) {
      httpStatus = exception.getStatus();
      code = httpStatus;
      try {
        const zodError = exception.getZodError() as ZodError;
        message = String(zodError.issues.map((e) => e.message).join(', '));
      } catch {
        message = (exception as Error).message;
      }
    } else if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      code = httpStatus;
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
    response.status(200).json({
      code,
      data: null,
      message,
    });
  }
}

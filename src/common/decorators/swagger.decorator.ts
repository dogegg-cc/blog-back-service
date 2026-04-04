import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ResponseDto } from '../dto/response.dto';

/**
 * 封装 Swagger 的成功响应装饰器，解决泛型 DTO 文档生成问题
 */
export const ApiSuccessResponse = <TModel extends Type<any>>(options: {
  type: TModel;
  description?: string;
  isArray?: boolean;
}) => {
  return applyDecorators(
    ApiExtraModels(ResponseDto, options.type),
    ApiResponse({
      status: 200,
      description: options.description || '成功',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ResponseDto) },
          {
            properties: {
              data: options.isArray
                ? {
                    type: 'array',
                    items: { $ref: getSchemaPath(options.type) },
                  }
                : {
                    $ref: getSchemaPath(options.type),
                  },
            },
          },
        ],
      },
    }),
  );
};

/**
 * 封装 Swagger 的失败响应装饰器，用于业务异常展示
 */
export const ApiFailedResponse = (options: {
  code: number;
  message: string;
}) => {
  return applyDecorators(
    ApiResponse({
      status: 200, // 业务异常通常也返回 200
      description: options.message,
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'number',
            example: options.code,
            description: '业务状态码',
          },
          message: {
            type: 'string',
            example: options.message,
            description: '业务消息',
          },
          data: {
            type: 'object',
            nullable: true,
            example: null,
            description: '附加数据',
          },
        },
      },
    }),
  );
};

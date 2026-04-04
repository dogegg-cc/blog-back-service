import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const instance = WinstonModule.createLogger({
  transports: [
    // 1. 控制台：要漂亮、要颜色、要 Nest 风格
    new winston.transports.Console({
      // 这里的 format 是关键
      format: winston.format.combine(
        winston.format.timestamp(), // 添加时间戳
        winston.format.ms(), // 添加耗时（如 +2ms）
        nestWinstonModuleUtilities.format.nestLike('BlogAdmin', {
          // 这里的第一个参数是应用名称
          colors: true, // 开启颜色
          prettyPrint: true, // 让 JSON 更易读
        }),
      ),
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d', // 保留14天
    }),
  ],
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: instance });

  // 启用跨域资源共享 (CORS)
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalFilters(new AllExceptionsFilter());
  // main.ts中读取.env文件中的PORT配置
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const env =
    configService.get<string>('NODE_ENV') ||
    process.env.NODE_ENV ||
    'development';

  if (env !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Blog Admin API')
      .setDescription('Blog后台管理接口文档')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  if (env !== 'production') {
    console.log(
      `Swagger Docs is available at: http://localhost:${port}/api/docs`,
    );
  }
}
void bootstrap();

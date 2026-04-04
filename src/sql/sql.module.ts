import { Module } from '@nestjs/common';
import { SqlConfigService, UserInitService } from './sql.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
@Module({
  providers: [SqlConfigService, UserInitService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: SqlConfigService,
    }),
    TypeOrmModule.forFeature([User]),
  ],
})
export class SqlModule {}

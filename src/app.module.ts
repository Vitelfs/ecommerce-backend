import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { HashModule } from './auth/hash/hash.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envValidationSchema } from './common/env.validation';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgresConfigurationService } from './database/pg_config.service';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { AuditModule } from './audit/audit.module';
import { ClsModule } from 'nestjs-cls';
import { ClsInterceptor } from './common/interceptors/cls.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): ThrottlerModuleOptions => ({
        throttlers: [
          {
            ttl: configService.get<number>('THROTTLE_TTL') ?? 60,
            limit: configService.get<number>('THROTTLE_LIMIT') ?? 100,
          },
        ],
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      useClass: PostgresConfigurationService
    }),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    UsersModule,
    AuthModule,
    HashModule,
    AuditModule],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: ClsInterceptor },
  ],
})
export class AppModule { }

import { BullModule } from '@nestjs/bullmq';
import redisConfig from 'src/config/redis.config';
import refreshTokenConfig from 'src/config/refresh-token.config';
import superadminConfig from 'src/config/superadmin.config';
import appConfig from 'src/config/app.config';
import databaseConfig from 'src/config/database.config';
import jwtConfig from 'src/config/jwt.config';
import { envValidationSchema } from 'src/config/env.validation';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/modules/users/users.module';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { AuthModule } from 'src/modules/auth/auth.module';
import { AdminModule } from 'src/modules/admin/admin.module';
import { WalletModule } from 'src/modules/wallet/wallet.module';
import { TransactionModule } from 'src/modules/transactions/transaction.module';
import { AuditLogModule } from 'src/modules/audit-log/audit-log.module';
import { MailModule } from 'src/modules/mail/mail.module';
import { NotificationsModule } from 'src/modules/notifications/notifications.module';

@Module({
  imports: [
    NotificationsModule,
    MailModule,
    AuditLogModule,
    TransactionModule,
    WalletModule,
    AdminModule,
    AuthModule,
    UsersModule,
    PrismaModule,
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.getOrThrow<string>('redis.host'),
          port: configService.getOrThrow<number>('redis.port'),
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
        refreshTokenConfig,
        superadminConfig,
        redisConfig,
      ],
      validationSchema: envValidationSchema,
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}

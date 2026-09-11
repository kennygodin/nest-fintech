import refreshTokenConfig from 'src/config/refresh-token.config';
import appConfig from 'src/config/app.config';
import databaseConfig from 'src/config/database.config';
import jwtConfig from 'src/config/jwt.config';
import { envValidationSchema } from 'src/config/env.validation';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    TransactionModule,
    WalletModule,
    AdminModule,
    AuthModule,
    UsersModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, refreshTokenConfig],
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

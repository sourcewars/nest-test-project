import { Module, NestModule, RequestMethod, MiddlewareConsumer } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './api/users/users.module';
import { RequestLanguageMiddleware } from './interceptors/request-language.middleware';
import { StandardResponseInterceptor } from './interceptors/standard-response.interceptor';
import { ErrorsResponseInterceptor } from './interceptors/errors-response.interceptor';
import { CryptoService } from './helpers/crypto.service';
import { RequestRequiredHeadersMiddleware } from './interceptors/request-required-headers.middleware';
import { AuthService } from './api/auth/auth.service';
import { AuthModule } from './api/auth/auth.module';
import { UsersService } from './api/users/users.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ApplicationModule } from './api/application/application.module';

import TranslatorService from './translations/translator.service';
import * as envVar from './config/env.util';
import { AllExceptionsFilter } from './interceptors/all-exceptions.filter';
import { RolesGuard } from './api/auth/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useExisting: ConfigService,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secretOrPrivateKey: envVar.default.JWT_SECRET_KEY || 'secret-key',
      signOptions: {
        expiresIn: envVar.default.JWT_TTL || 86400,
      },
    }),
    UsersModule,
    AuthModule,
    ApplicationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    TranslatorService,
    CryptoService,
    UsersService,
    AuthService,
    {
      provide: APP_INTERCEPTOR,
      useClass: StandardResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorsResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLanguageMiddleware)
      .forRoutes(AppController);
  }
}

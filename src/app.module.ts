import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ChallengeModule } from './challenges/challenges.module';
import { CommonHeadersInterceptor } from './interceptors/common-headers.interceptor';

@Module({
  imports: [UsersModule, ChallengeModule, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CommonHeadersInterceptor,
    },
  ],
})
export class AppModule {}

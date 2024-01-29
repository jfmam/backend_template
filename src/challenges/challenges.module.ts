import { Module } from '@nestjs/common';
import { ChallengeController } from './challenges.controller';
import { ChallengeService } from './challenges.service';
import { ChallengeRepository } from './challenges.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserRepository } from '../users/users.repository';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [ChallengeController],
  providers: [
    ChallengeService,
    ChallengeRepository,
    UsersService,
    UserRepository,
  ],
})
export class ChallengeModule {}

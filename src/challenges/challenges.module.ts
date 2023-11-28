import { Module } from '@nestjs/common';
import { ChallengeController } from './challenges.controller';
import { ChallengeService } from './challenges.service';
import { ChallengeRepository } from './challenges.repository';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { UserRepository } from 'src/users/users.repository';

@Module({
  imports: [ConfigModule],
  controllers: [ChallengeController],
  providers: [
    ChallengeService,
    ChallengeRepository,
    JwtService,
    UsersService,
    UserRepository,
  ],
})
export class ChallengeModule {}

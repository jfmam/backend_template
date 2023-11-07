import { Module } from '@nestjs/common';
import { ChallengeController } from './challenges.controller';
import { ChallengeService } from './challenges.service';
import { ChallengeRepository } from './challenges.repository';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [ChallengeController],
  providers: [ChallengeService, ChallengeRepository],
})
export class ChallengeModule {}

import { Injectable } from '@nestjs/common';
import { ChallengeRepository } from './challenges.repository';
import { ChallengeDto } from './challenges.dto';

@Injectable()
export class ChallengeService {
  constructor(private readonly challengesRepository: ChallengeRepository) {}

  async createChallenge(challengeDto: ChallengeDto) {
    return this.challengesRepository.createChallenge(challengeDto);
  }

  async getChallenges(limit: number, lastKey: Record<string, string>) {
    return this.challengesRepository.getChallenges(limit, lastKey);
  }

  async getMyAchievements(limit: number, lastKey: Record<string, string>) {
    return this.challengesRepository.getMyAchievements(limit, lastKey);
  }

  async getAchievements(limit: number, lastKey: Record<string, string>) {
    return this.challengesRepository.getAchievements(limit, lastKey);
  }
}

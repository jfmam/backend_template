import { Injectable } from '@nestjs/common';

import { generateRandomId, getDate, getTotalDays } from '../utils';

import { ChallengeRepository } from './challenges.repository';
import { ChallengeDto, ChallengeInputMapper } from './challenges.dto';

@Injectable()
export class ChallengeService {
  constructor(private readonly challengesRepository: ChallengeRepository) {}

  async createChallenge(challengeDto: ChallengeDto, userId: string) {
    const startDay = getDate(challengeDto.startDate);
    const completeStatus = [{ [startDay]: false }];
    const totalDays = getTotalDays(
      challengeDto.startDate,
      challengeDto.endDate,
      challengeDto.actionDay,
    );
    const id = generateRandomId();
    const challengeInputMapper: ChallengeInputMapper = {
      ...challengeDto,
      id,
      userId,
      completeStatus,
      totalDays,
      completeCount: 0,
    };
    return this.challengesRepository.createChallenge(challengeInputMapper);
  }

  async getChallenges(limit: number, lastKey: Record<string, string>) {
    return this.challengesRepository.getChallenges(limit, lastKey);
  }

  async getMyAchievements(limit: number, lastKey: Record<string, string>) {
    return this.challengesRepository.getMyAchievements(limit, lastKey);
  }

  async getAchievements(limit: number, lastKey: Record<string, string>) {
    return this.challengesRepository.getChallenges(limit, lastKey);
  }

  async updateChallengeStatus(challengeId: string, status: boolean) {
    return this.challengesRepository.updateChallengeStatus(challengeId, status);
  }
}

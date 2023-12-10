import { Injectable } from '@nestjs/common';

import {
  createEndDate,
  createStartDate,
  generateRandomId,
  getDate,
  getTotalDays,
} from '../utils';

import { ChallengeRepository } from './challenges.repository';
import {
  ChallengeDto,
  ChallengeInputMapper,
  Pagination,
} from './challenges.dto';

@Injectable()
export class ChallengeService {
  constructor(private readonly challengesRepository: ChallengeRepository) {}

  async createChallenge(challengeDto: ChallengeDto, userId: string) {
    const startDate = createStartDate(challengeDto.startDate);
    const endDate = createEndDate(challengeDto.endDate);
    const startDay = getDate(startDate);
    const completeStatus = [{ [startDay]: false }];
    const totalDays = getTotalDays(startDate, endDate, challengeDto.actionDay);
    const id = generateRandomId();
    const challengeInputMapper: ChallengeInputMapper = {
      ...challengeDto,
      id,
      userId,
      completeStatus,
      totalDays,
      completeCount: 0,
      startDate,
      endDate,
    };
    return this.challengesRepository.createChallenge(challengeInputMapper);
  }

  async getChallenges(pagination: Pagination) {
    return this.challengesRepository.getChallenges(pagination);
  }

  async getMyAchievements(pagination: Pagination) {
    return this.challengesRepository.getMyAchievements(pagination);
  }

  async getAchievements(pagination: Pagination) {
    return this.challengesRepository.getAchievements(pagination);
  }

  async updateChallengeStatus(challengeId: string, status: boolean) {
    return this.challengesRepository.updateChallengeStatus(challengeId, status);
  }
}

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
  ChallengeOutput,
  ChallengeToggleDto,
  Pagination,
} from './challenges.dto';

@Injectable()
export class ChallengeService {
  constructor(private readonly challengesRepository: ChallengeRepository) {}

  async createChallenge(challengeDto: ChallengeDto, userId: string) {
    const startDate = createStartDate(challengeDto.startDate);
    const endDate = createEndDate(challengeDto.endDate);
    const startDay = getDate(startDate);
    const completeStatus = { [startDay]: false };
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
    const { items, ...rest } =
      await this.challengesRepository.getChallenges(pagination);
    const today = new Date().toISOString().split('T')[0];
    const result: ChallengeOutput[] = items.map((v) => ({
      ...v,
      todayCompleteStatus: v.completeStatus[today],
      completeStatus: undefined,
    }));

    return {
      ...rest,
      items: result,
    };
  }

  async getMyAchievements(pagination: Pagination) {
    return this.challengesRepository.getMyAchievements(pagination);
  }

  async getAchievements(pagination: Pagination) {
    return this.challengesRepository.getAchievements(pagination);
  }

  async updateChallengeStatus(challengeToggleDto: ChallengeToggleDto) {
    return this.challengesRepository.updateChallengeStatus(challengeToggleDto);
  }
}

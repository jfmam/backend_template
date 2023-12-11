import { Injectable } from '@nestjs/common';

import {
  createEndDate,
  createStartDate,
  generateRandomId,
  getTotalDays,
} from '../utils';

import { ChallengeRepository } from './challenges.repository';
import {
  AchievementOutput,
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
    const totalDays = getTotalDays(startDate, endDate, challengeDto.actionDay);
    const id = generateRandomId();
    const challengeInputMapper: ChallengeInputMapper = {
      ...challengeDto,
      id,
      userId,
      totalDays,
      completeCount: 0,
      startDate,
      endDate,
      completeStatus: {},
    };
    return this.challengesRepository.createChallenge(challengeInputMapper);
  }

  async getChallenges(pagination: Pagination) {
    const { items, ...rest } =
      await this.challengesRepository.getChallenges(pagination);
    const today = new Date().toISOString().split('T')[0];
    const result: ChallengeOutput[] = items.map((v) => ({
      ...v,
      todayCompleteStatus: v.completeStatus?.[today] || false,
      completeStatus: undefined,
    }));

    return {
      ...rest,
      items: result,
    };
  }

  async getMyAchievements(pagination: Pagination) {
    const { items, ...rest } =
      await this.challengesRepository.getMyAchievements(pagination);

    const myAchievements: AchievementOutput[] = items.map((v) => {
      return {
        ...v,
        completeRatio: 100,
      };
    });

    return {
      ...rest,
      items: myAchievements,
    };
  }

  async getAchievements(pagination: Pagination) {
    const { items, ...rest } =
      await this.challengesRepository.getAchievements(pagination);

    const achievements: AchievementOutput[] = items.map((v) => {
      const completeCount = Object.values(v.completeStatus).filter(
        (status) => status,
      ).length;
      return {
        ...v,
        completeRatio: Math.floor((completeCount / v.totalDays) * 100),
        completeCount: undefined,
        completeStatus: undefined,
      };
    });

    return {
      ...rest,
      items: achievements,
    };
  }

  async updateChallengeStatus(challengeToggleDto: ChallengeToggleDto) {
    return this.challengesRepository.updateChallengeStatus(challengeToggleDto);
  }
}

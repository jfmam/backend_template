import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ChallengeDto } from './challenges.dto';
import { ChallengeService } from './challenges.service';

@Controller('challenges')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Post()
  async createChallenge(@Body() challengeDto: ChallengeDto) {
    try {
      return this.challengeService.createChallenge(challengeDto);
    } catch (e) {
      console.error(e);
    }
  }

  @Get()
  async getChallenges(
    @Query('limit') limit: number = 5,
    @Query('lastKey') lastKey: Record<string, string>,
  ) {
    try {
      return this.challengeService.getChallenges(limit, lastKey);
    } catch (e) {
      console.error(e);
    }
  }

  @Get('/my-achievements')
  async getMyAchievement(
    @Query('limit') limit: number = 9,
    @Query('lastKey') lastKey: Record<string, string>,
  ) {
    try {
      return this.challengeService.getMyAchievements(limit, lastKey);
    } catch (e) {
      console.error(e);
    }
  }

  @Get('/achievements')
  async getAchievement(
    @Query('limit') limit: number = 5,
    @Query('lastKey') lastKey: Record<string, string>,
  ) {
    try {
      return this.challengeService.getAchievements(limit, lastKey);
    } catch (e) {
      console.error(e);
    }
  }
}

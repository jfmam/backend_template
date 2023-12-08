import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Request,
  UseGuards,
  Patch,
  Param,
} from '@nestjs/common';
import { Request as Req } from 'express';

import { ChallengeDto, ChallengeToggleDto } from './challenges.dto';
import { ChallengeService } from './challenges.service';
import { AuthGuard } from 'src/users/auth.guard';

@Controller('challenges')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createChallenge(
    @Body() challengeDto: ChallengeDto,
    @Request() req: Req,
  ) {
    try {
      const userId = req.user.id;
      return this.challengeService.createChallenge(challengeDto, userId);
    } catch (e) {
      console.error(e);
    }
  }

  @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
  @Get('my-achievements')
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

  @UseGuards(AuthGuard)
  @Get('achievements')
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

  @UseGuards(AuthGuard)
  @Patch('/:challengeId/toggle')
  async toggleChallenge(
    @Body() challengeToggleDto: ChallengeToggleDto,
    @Param('challengeId') challengeId: string,
  ) {
    try {
      return this.challengeService.updateChallengeStatus(
        challengeId,
        challengeToggleDto.status,
      );
    } catch (e) {
      console.error(e);
    }
  }
}

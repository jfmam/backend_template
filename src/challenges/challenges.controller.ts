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

import { ChallengeDto } from './challenges.dto';
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
      return { message: 'Failed create challenge' };
    }
  }

  @UseGuards(AuthGuard)
  @Get()
  async getChallenges(
    @Query('limit') limit: number = 5,
    @Query('lastKey') lastKey: string,
    @Request() req: Req,
  ) {
    try {
      const userId = req.user.id;

      return this.challengeService.getChallenges({ limit, lastKey, userId });
    } catch (e) {
      return { message: 'Failed retrieve challenges' };
    }
  }

  @UseGuards(AuthGuard)
  @Get('my-achievements')
  async getMyAchievement(
    @Query('limit') limit: number = 9,
    @Query('lastKey') lastKey: string,
    @Request() req: Req,
  ) {
    try {
      const userId = req.user.id;
      return this.challengeService.getMyAchievements({
        limit,
        lastKey,
        userId,
      });
    } catch (e) {
      return { message: 'Failed retrieve my achievements' };
    }
  }

  @UseGuards(AuthGuard)
  @Get('achievements')
  async getAchievement(
    @Query('limit') limit: number = 5,
    @Query('lastKey') lastKey: string,
    @Request() req: Req,
  ) {
    try {
      const userId = req.user.id;

      return this.challengeService.getAchievements({ limit, lastKey, userId });
    } catch (e) {
      return { message: 'Failed retrieve achievements' };
    }
  }

  @UseGuards(AuthGuard)
  @Patch('/:challengeId/toggle')
  async toggleChallenge(
    @Body('status') status: boolean,
    @Param('challengeId') challengeId: string,
    @Request() req: Req,
  ) {
    try {
      const userId = req.user.id;

      return this.challengeService.updateChallengeStatus({
        id: challengeId,
        status,
        userId,
      });
    } catch (e) {
      return { message: 'Failed update challenge status' };
    }
  }
}

import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Get,
  Request,
  UseGuards,
  Delete,
  HttpCode,
  Patch,
} from '@nestjs/common';
import { Request as Req } from 'express';

import { CreateUserDto, LoginUserDto } from './users.dto';
import { UsersService } from './users.service';
import { AuthGuard } from './auth.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.usersService.createUser(createUserDto);
    } catch (e) {
      return { message: 'Failed create user' };
    }
  }

  @HttpCode(200)
  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req: Req) {
    return req.user;
  }

  @Post('login')
  async login(@Body() { email, password }: LoginUserDto) {
    try {
      const user = await this.usersService.findOneByEmail(email);
      const isCorrect = await this.usersService.comparePassword(
        password,
        user.password,
      );

      if (!isCorrect) {
        throw new UnauthorizedException();
      }

      const accessToken = this.usersService.login(user.email);
      return { token: accessToken };
    } catch (e) {
      return { message: e.message };
    }
  }

  @Post('forgot-password')
  async findPassword(@Body('email') email: string) {
    try {
      const user = await this.usersService.findOneByEmail(email);

      if (!user) throw new UnauthorizedException();

      const token = this.usersService.generateAccessToken(user.email);
      await this.usersService.sendPasswordResetEmail(email, token);

      return { message: '이메일을 전송하였습니다.' };
    } catch (e) {
      throw e;
    }
  }

  @UseGuards(AuthGuard)
  @Patch('reset-password')
  async resetPassword(@Body('password') password: string, @Request() req: Req) {
    try {
      const newPassword = await this.usersService.hashPassowrd(password);
      const email = req.user.email;

      await this.usersService.updatePassword(email, newPassword);
      return { message: '패스워드 업데이트 성공 하였습니다.' };
    } catch (e) {
      throw e;
    }
  }

  @UseGuards(AuthGuard)
  @Delete()
  async deleteUser(@Request() req: Req) {
    try {
      const email = req.user.email;
      await this.usersService.resignUser(email);

      return { message: 'Success resign user' };
    } catch (e) {
      throw e;
    }
  }
  @Post('kakao')
  async kakoLogin(@Request() req: Req, @Body('code') code: string) {
    try {
      const token = await this.usersService.oAuthKakao(code);

      return { token };
    } catch (e) {
      return { message: e.message, code: e.status };
    }
  }

  @Post('naver')
  async NaverLogin(@Request() req: Req, @Body('code') code: string) {
    try {
      const token = await this.usersService.oAuthKakao(code);

      return { token };
    } catch (e) {
      return { message: e.message, code: e.status };
    }
  }
}

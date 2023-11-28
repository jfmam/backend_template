import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  Get,
  Request,
  UseGuards,
  Delete,
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
      return { message: 'Invalid credentials' };
    }
  }

  @Post('forgot-password')
  async findPassword(@Body('email') email: string) {
    try {
      await this.usersService.sendPasswordResetEmail(email);
    } catch (e) {
      return { message: 'Invalid Email' };
    }
  }

  @UseGuards(AuthGuard)
  @Delete()
  async deleteUser(@Request() req: Req) {
    try {
      const email = req.user.email;
      await this.usersService.sendPasswordResetEmail(email);

      return { message: 'Success resign user' };
    } catch (e) {
      return { message: 'Invalid Email' };
    }
  }
}

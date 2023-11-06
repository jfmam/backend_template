import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';

import { CreateUserDto, LoginUserDto } from './users.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      return this.usersService.createUser(createUserDto);
    } catch (e) {
      console.error(e);
    }
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

      const accessToken = this.usersService.generateAccessToken(user.id);
      const refreshToken = this.usersService.generateRefreshToken(user.id);
      return { accessToken, refreshToken };
    } catch (e) {
      return { message: 'Invalid credentials' };
    }
  }

  @Post('refresh-token')
  async refreshAccessToken(@Body() body: { refreshToken: string }) {
    const { refreshToken } = body;

    try {
      const decoded = jwt.verify(
        refreshToken,
        this.configService.get('JWT_REFRESH_SECRET'),
      );
      console.log(decoded);
      const user = await this.usersService.findOneByEmail(decoded as any);
      if (user) {
        const accessToken = this.usersService.generateAccessToken(user.id);
        return { accessToken };
      }
    } catch (error) {
      return { message: 'Invalid refresh token' };
    }
  }
}

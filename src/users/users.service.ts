import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { UserRepository } from './users.repository';
import { CreateUserDto, UserDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const hashedPassword = await this.hashPassowrd(createUserDto.password);

    return this.userRepository.createUser({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  findOneByEmail(email: string): Promise<UserDto> {
    return this.userRepository.findOneByEmail(email);
  }

  login(userId: number) {
    const payload = { sub: userId };
    const token = this.jwtService.sign(payload, { expiresIn: '15m' });

    return token;
  }

  generateRefreshToken(userId: number) {
    const payload = { sub: userId };
    const refreshToken = jwt.sign(
      payload,
      this.configService.get('JWT_REFRESH_SECRET'),
      {
        expiresIn: '30d',
      },
    );

    return refreshToken;
  }

  async hashPassowrd(password: string): Promise<string> {
    const hashingPassword = await bcrypt.hash(password, 12);

    return hashingPassword;
  }

  async comparePassword(
    password: string,
    savedHashPassoword: string,
  ): Promise<boolean> {
    const result = await bcrypt.compare(password, savedHashPassoword);

    return result;
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordCorrect = this.comparePassword(pass, user.password);

    if (!isPasswordCorrect) {
      throw new UnauthorizedException();
    }
    return { email: user.email, name: user.name };
  }
}

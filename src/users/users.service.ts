import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { UserRepository } from './users.repository';
import { CreateUserDto, UserDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
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

  generateAccessToken(userId: number) {
    const payload = { sub: userId };
    const token = jwt.sign(payload, this.configService.get('JWT_SECRET'), {
      expiresIn: '15m',
    });
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
}

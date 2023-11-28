import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

import { UserRepository } from './users.repository';
import { CreateUserDto, UserOutput } from './users.dto';

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

  findOneByEmail(email: string): Promise<UserOutput> {
    return this.userRepository.findOneByEmail(email);
  }

  login(email: string) {
    const token = this.jwtService.sign({ email }, { expiresIn: '15m' });

    return token;
  }

  generateRefreshToken(userId: string) {
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

  async validateUser(
    email: string,
    pass: string,
  ): Promise<{ email: string; name: string }> {
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

  async sendPasswordResetEmail(userEmail: string): Promise<string> {
    try {
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'your_email@gmail.com', // Gmail 계정
          pass: 'your_password', // Gmail 암호
        },
      });

      const mailOptions = {
        from: 'no-reply@gmail.com',
        to: userEmail,
        subject: '패스워드 초기화 요청',
        text: '패스워드 초기화 링크를 전송합니다.', // 본문 내용
        // HTML을 사용할 경우:
        // html: '<p>패스워드 초기화 링크를 전송합니다.</p>'
      };

      await transporter.sendMail(mailOptions);
      return '이메일이 전송되었습니다. 패스워드를 초기화하세요.';
    } catch (error) {
      throw new Error('이메일 전송 중 오류가 발생했습니다.');
    }
  }

  async resignUser(email: string) {
    return this.userRepository.deleteUser(email);
  }
}

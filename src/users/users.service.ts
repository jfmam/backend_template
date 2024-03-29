import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import ejs from 'ejs';
import { resolve } from 'path';

import { UserRepository } from './users.repository';
import { CreateUserDto, UserOutput, kakaoLoginOutput } from './users.dto';
import axios from 'axios';

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
    const token = this.jwtService.sign({ email }, { expiresIn: '1d' });

    return token;
  }

  generateAccessToken(email: string) {
    const token = this.jwtService.sign({ email }, { expiresIn: '30m' });

    return token;
  }

  generateRefreshToken(userId: string) {
    const payload = { sub: userId };
    const refreshToken = jwt.sign(
      payload,
      this.configService.get('JWT_REFRESH_SECRET'),
      {
        expiresIn: '1d',
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

  async sendPasswordResetEmail(
    userEmail: string,
    token: string,
  ): Promise<string> {
    try {
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: this.configService.get('NODEMAILER_ID'),
          pass: this.configService.get('NODEMAILER_PW'),
        },
      });

      const mailOptions = {
        from: 'WESAVE <no-reply@gmail.com>',
        to: userEmail,
        subject: '[WESAVE] 패스워드 초기화 요청',
        html: await ejs.renderFile(
          resolve('src/views/email.ejs'),
          {
            link: `${this.configService.get(
              'PROTOCOL',
            )}://${this.configService.get(
              'DOMAIN',
            )}/reset-password?token=${token}`,
          },
          {
            async: true,
          },
        ),
        attachments: [
          {
            filename: 'wesave.png',
            path: resolve(`src/public/wesave.png`),
            cid: 'wesave',
          },
          {
            filename: 'wesaver.png',
            path: resolve('src/public/wesaver.png'),
            cid: 'wesaver',
          },
        ],
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

  async updatePassword(email: string, password: string) {
    return this.userRepository.updatePassword(email, password);
  }

  async oAuthKakao(code: string) {
    const REST_API_KEY = this.configService.get('REST_API_KEY');
    const REDIRECT_URI = this.configService.get('REDIRECT_URI');
    const CLIENT_SECRET = this.configService.get('CLIENT_SECRET');
    try {
      const oAuthData = {
        grant_type: 'authorization_code',
        client_id: REST_API_KEY,
        redirect_uri: REDIRECT_URI,
        client_secret: CLIENT_SECRET,
        code,
      };
      const result = await axios.post<kakaoLoginOutput>(
        'https://kauth.kakao.com/oauth/token',
        oAuthData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
      );
      const { data } = await axios.post(
        'https://kapi.kakao.com/v2/user/me',
        {},
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            Authorization: `Bearer ${result.data.access_token}`,
          },
        },
      );

      const user = await this.userRepository.findOneByEmail(
        data.kakao_account.email,
      );

      if (!user) {
        await this.userRepository.createUser({
          email: data.kakao_account.email,
          name: data.kakao_account.name,
        });
      }

      const token = this.generateAccessToken(data.kakao_account.email);

      return token;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async oAuthNaver(code: string) {
    const NAVER_REST_API_KEY = this.configService.get('NAVER_REST_API_KEY');
    const NAVER_REDIRECT_URI = this.configService.get('NAVER_REDIRECT_URI');
    const NAVER_CLIENT_SECRET = this.configService.get('NAVER_CLIENT_SECRET');
    try {
      const oAuthData = {
        grant_type: 'authorization_code',
        client_id: NAVER_REST_API_KEY,
        redirect_uri: NAVER_REDIRECT_URI,
        client_secret: NAVER_CLIENT_SECRET,
        code,
      };
      const result = await axios.post<kakaoLoginOutput>(
        'https://nid.naver.com/oauth2.0/token',
        oAuthData,
      );
      const { data } = await axios.post(
        'https://openapi.naver.com/v1/nid/me',
        {},
        {
          headers: {
            Authorization: `Bearer ${result.data.access_token}`,
          },
        },
      );

      const user = await this.userRepository.findOneByEmail(data.email);

      if (!user) {
        await this.userRepository.createUser({
          email: data.email,
          name: data.name,
        });
      }

      const token = this.generateAccessToken(data.email);

      return token;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}

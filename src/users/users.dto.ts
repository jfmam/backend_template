import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  readonly name: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
    message: '비밀번호는 영문자와 숫자를 포함하여야 합니다.',
  })
  readonly password?: string;
}

export class LoginUserDto {
  readonly email: string;
  readonly password: string;
}

export class UserOutput {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly password: string;
}

export class kakaoLoginOutput {
  access_token: string;
  token_type: 'bearer';
  refresh_token: string;
  expires_in: number;
  scope: string;
  refresh_token_expires_in: number;
}

export class NaverLoginOutput {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  error: string;
  error_description: string;
}

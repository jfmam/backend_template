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
  readonly password: string;
}

export class LoginUserDto {
  readonly email: string;
  readonly password: string;
}

export class UserDto {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly password: string;
}

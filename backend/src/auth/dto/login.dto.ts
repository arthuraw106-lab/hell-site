import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsOptional()
  @IsEmail({}, { message: 'ایمیل معتبر نیست.' })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'نام کاربری حداقل ۳ کاراکتر باشد.' })
  @MaxLength(64)
  username?: string;

  @IsString()
  @MinLength(6, { message: 'پسورد باید حداقل ۶ کاراکتر باشد.' })
  @MaxLength(128)
  password!: string;
}
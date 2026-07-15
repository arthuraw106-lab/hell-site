import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'ایمیل معتبر نیست.' })
  email!: string;

  @IsString()
  @MinLength(3, { message: 'نام کاربری باید حداقل ۳ کاراکتر باشد.' })
  @MaxLength(32, { message: 'نام کاربری نباید بیشتر از ۳۲ کاراکتر باشد.' })
  username!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  displayName?: string;

  @IsString()
  @MinLength(8, { message: 'پسورد باید حداقل ۸ کاراکتر باشد.' })
  @MaxLength(128)
  password!: string;
}

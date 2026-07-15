import { IsOptional, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';

export class VerifyOtpDto {
  @Matches(/^09\d{9}$/, { message: 'شماره موبایل باید با فرمت 09xxxxxxxxx باشد.' })
  phone!: string;

  @IsString()
  @Length(4, 8)
  code!: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  username?: string;
}

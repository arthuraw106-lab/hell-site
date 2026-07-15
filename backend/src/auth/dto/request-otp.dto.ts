import { Matches } from 'class-validator';

export class RequestOtpDto {
  @Matches(/^09\d{9}$/, { message: 'شماره موبایل باید با فرمت 09xxxxxxxxx باشد.' })
  phone!: string;
}

import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { RequestUser } from '../common/types/request-user.type';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.register(dto);
    this.setAuthCookies(response, result.accessToken, result.refreshToken);
    return result;
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(dto);
    this.setAuthCookies(response, result.accessToken, result.refreshToken);
    return result;
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.refresh(dto.refreshToken);
    this.setAuthCookies(response, result.accessToken, result.refreshToken);
    return result;
  }

  @Post('logout')
  async logout(@CurrentUser() user: RequestUser, @Res({ passthrough: true }) response: Response) {
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
    return this.authService.logout(user.sub);
  }

  @Get('me')
  me(@CurrentUser() user: RequestUser) {
    return user;
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  google() {
    return { ok: true };
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() request: any, @Res() response: Response) {
    const result = await this.authService.googleLogin(request.user);
    this.setAuthCookies(response, result.accessToken, result.refreshToken);

    const frontend = process.env.FRONTEND_URL || 'http://localhost:3001';
    const redirectUrl = new URL('/auth/google/success', frontend);
    redirectUrl.searchParams.set('accessToken', result.accessToken);
    redirectUrl.searchParams.set('refreshToken', result.refreshToken);

    return response.redirect(redirectUrl.toString());
  }

  private setAuthCookies(response: Response, accessToken: string, refreshToken: string) {
    const secure = process.env.COOKIE_SECURE === 'true';

    response.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      maxAge: 15 * 60 * 1000,
    });

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }
}

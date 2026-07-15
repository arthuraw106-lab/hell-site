import { BadRequestException, ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

import * as bcrypt from 'bcryptjs';

type TokenPayload = {
  sub: string;
  username: string;
  role: Role;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const username = dto.username.trim();

    const exists = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    });

    if (exists?.email === email) {
      throw new ConflictException('این ایمیل قبلاً ثبت شده است.');
    }

    if (exists?.username === username) {
      throw new ConflictException('این نام کاربری قبلاً استفاده شده است.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        displayName: dto.displayName || username,
        passwordHash,
      },
    });

    return this.issueTokens(user);
  }

  async login(dto: LoginDto) {
    const email = dto.email?.trim().toLowerCase();
    const username = dto.username?.trim();

    if (!email && !username) {
      throw new BadRequestException('ایمیل یا نام کاربری الزامی است.');
    }

    const user = await this.prisma.user.findFirst({
      where: email ? { email } : { username: username! },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('ایمیل/نام کاربری یا پسورد اشتباه است.');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!valid) {
      throw new UnauthorizedException('ایمیل/نام کاربری یا پسورد اشتباه است.');
    }

    return this.issueTokens(user);
  }

  async googleLogin(profile: {
    googleId: string;
    email?: string;
    displayName?: string;
    avatar?: string;
  }) {
    if (!profile.googleId) {
      throw new BadRequestException('اطلاعات Google ناقص است.');
    }

    const email = profile.email?.trim().toLowerCase();
    const fallbackUsername = email
      ? email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').slice(0, 24) || `google_${profile.googleId.slice(-8)}`
      : `google_${profile.googleId.slice(-8)}`;

    const existingByGoogle = await this.prisma.user.findUnique({
      where: { googleId: profile.googleId },
    });

    if (existingByGoogle) {
      const user = await this.prisma.user.update({
        where: { id: existingByGoogle.id },
        data: {
          email: email || existingByGoogle.email,
          displayName: profile.displayName || existingByGoogle.displayName,
          avatar: profile.avatar || existingByGoogle.avatar,
        },
      });

      return this.issueTokens(user);
    }

    if (email) {
      const existingByEmail = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingByEmail) {
        const user = await this.prisma.user.update({
          where: { id: existingByEmail.id },
          data: {
            googleId: profile.googleId,
            displayName: profile.displayName || existingByEmail.displayName,
            avatar: profile.avatar || existingByEmail.avatar,
          },
        });

        return this.issueTokens(user);
      }
    }

    const username = await this.makeUniqueUsername(fallbackUsername);

    const user = await this.prisma.user.create({
      data: {
        googleId: profile.googleId,
        email,
        username,
        displayName: profile.displayName || username,
        avatar: profile.avatar,
      },
    });

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string) {
    let payload: TokenPayload;

    try {
      payload = this.jwt.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('رفرش توکن نامعتبر است.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('نشست کاربر پیدا نشد.');
    }

    const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);

    if (!valid) {
      // Token reuse detected — possible theft: invalidate ALL sessions
      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { refreshTokenHash: null },
      });
      throw new UnauthorizedException('رفرش توکن نامعتبر است. لطفاً دوباره وارد شوید.');
    }

    // Issue new tokens AND rotate: invalidate the old refresh token
    const result = await this.issueTokens(user);
    return result;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });

    return { ok: true };
  }

  private async makeUniqueUsername(base: string) {
    const clean = base.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '').slice(0, 24) || 'user';

    let username = clean;
    let counter = 1;

    while (await this.prisma.user.findUnique({ where: { username } })) {
      username = `${clean}_${counter}`;
      counter += 1;
    }

    return username;
  }

  private async issueTokens(user: User) {
    if (user.isBanned) {
      throw new ForbiddenException('حساب شما مسدود شده است.');
    }

    const payload: TokenPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwt.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES || '30d',
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshTokenHash: await bcrypt.hash(refreshToken, 10),
      },
    });

    return {
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  }
}

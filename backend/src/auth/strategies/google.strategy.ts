import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || 'change_me',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'change_me',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  validate(_: string, __: string, profile: any, done: VerifyCallback) {
    const email = profile.emails?.[0]?.value;
    const avatar = profile.photos?.[0]?.value;

    done(null, {
      googleId: profile.id,
      email,
      displayName: profile.displayName,
      avatar,
    });
  }
}

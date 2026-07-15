import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('30d'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  BACKEND_URL: z.string().url().default('http://localhost:4000'),
  PORT: z.coerce.number().default(4000),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),
  OTP_TTL_SECONDS: z.coerce.number().default(120),
  OTP_DEV_CODE: z.string().default('111111'),
  S3_ENDPOINT: z.string().min(1),
  S3_PUBLIC_ENDPOINT: z.string().min(1),
  S3_REGION: z.string().default('us-east-1'),
  S3_BUCKET: z.string().min(1),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_FORCE_PATH_STYLE: z.coerce.boolean().default(true),
  AI_BOT_ENABLED: z.coerce.boolean().default(false),
  AI_BASE_URL: z.string().default('https://api.freemodel.dev/v1'),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().default('gpt-4o-mini'),
});

export function validateEnv(config: Record<string, unknown>) {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
    throw new Error(`Environment validation failed:\n${errors}`);
  }

  return parsed.data;
}

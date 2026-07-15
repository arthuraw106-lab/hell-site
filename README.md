# Hell Manhwa | هل مانهوا

پروژه Full-Stack و Production-ready برای سایت مانهوا با معماری مدرن.

## Stack

### Frontend
- Next.js App Router
- TypeScript
- TailwindCSS
- ShadCN-style UI
- Zustand
- React Query
- Framer Motion
- Socket.IO Client
- SEO، sitemap، robots

### Backend
- NestJS
- Prisma ORM
- PostgreSQL
- Redis
- WebSocket / Socket.IO
- JWT + Refresh Token
- OTP Login
- Google OAuth
- RBAC
- Swagger
- S3/MinIO Upload

### Services
- PostgreSQL
- Redis
- MinIO

## اجرای پروژه

بعد از اجرای فایل‌های ۱ تا ۴:

```bash
docker compose up --build
```

آدرس‌ها:

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- Swagger: http://localhost:4000/docs
- MinIO Console: http://localhost:9001

## ورود تستی

شماره پیش‌فرض ادمین:

```text
09120000000
```

کد OTP در حالت توسعه:

```text
111111
```

## مسیرهای مهم

### Frontend
- `/`
- `/auth`
- `/manga`
- `/manga/[slug]`
- `/reader/[chapterId]`
- `/profile`
- `/chat`
- `/team`
- `/polls`
- `/tickets`
- `/admin`

### Backend
- `/api/auth/otp/request`
- `/api/auth/otp/verify`
- `/api/auth/google`
- `/api/users/me`
- `/api/manga`
- `/api/comments`
- `/api/stories`
- `/api/upload`
- `/api/team`
- `/api/polls`
- `/api/tickets`
- `/api/chat`
- `/api/admin`
- `/api/health`

## نکته Production

در production حتما این موارد را تغییر بده:

- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `POSTGRES_PASSWORD`
- `S3_SECRET_KEY`
- Google OAuth credentials
- SMS provider real API
- دامنه‌های `FRONTEND_URL` و `BACKEND_URL`
- `COOKIE_SECURE=true`

## Reset کامل Docker

```bash
docker compose down -v --remove-orphans
docker compose up --build
```

## ورود ایمیلی

سیستم ورود با شماره تلفن حذف شد و ورود ایمیلی فعال است.

ادمین پیش‌فرض:

```text
Email: admin@hell.local
Password: Admin123456
```

Routeهای Auth:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
GET  /api/auth/google
```

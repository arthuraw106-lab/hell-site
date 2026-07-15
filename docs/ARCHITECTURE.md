# Hell Manhwa Architecture

این پروژه به صورت Monorepo ساخته شده:

- backend: NestJS + Prisma + PostgreSQL + Redis + WebSocket
- frontend: Next.js App Router + React Query + Zustand + TailwindCSS + ShadCN-style components
- infra: Docker Compose شامل PostgreSQL، Redis، MinIO

## Backend Modules

در فایل شماره ۲ ساخته می‌شوند:

- Auth
- Users
- Manga
- Chapters
- Comments
- Upload
- Stories
- Team
- Polls
- Tickets
- Chat
- Admin
- Notifications
- Common Guards/Filters/Interceptors

## Frontend Modules

در فایل شماره ۳ ساخته می‌شوند:

- Home
- Auth
- Manga list/detail
- Reader
- Profile
- Chat
- Tickets
- Team
- Admin Panel
- SEO files

## Hardening

در فایل شماره ۴ تکمیل می‌شود:

- refresh token flow
- seed
- healthcheck
- cache
- RBAC
- docs

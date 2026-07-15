# مرحله ۴ بازطراحی فرانت Hell Manhwa

## انجام شد

صفحه اصلی پروژه بازطراحی شد.

### فایل‌های تغییر کرده

- `frontend/components/home/home-page.tsx`
- `frontend/components/home/story-strip.tsx`
- `frontend/app/page.tsx`

### فایل‌های اضافه شده

- `frontend/components/home/home-manga-card.tsx`

## قابلیت‌های UI اضافه‌شده

- Hero سینمایی و premium
- کارت featured manga
- افکت‌های شناور
- آمار سریع صفحه اصلی
- Story strip حرفه‌ای‌تر
- بخش مانهواهای ترند
- کارت مانهوا با hover و motion
- بخش آخرین چپترها
- کارت انتخاب ویژه
- preview رأی‌گیری پروژه‌ها
- سکشن امکانات سایت
- استفاده از theme مرحله ۲
- هماهنگی با AppShell مرحله ۳

## APIهای استفاده‌شده

- `GET /api/manga`
- `GET /api/manga/popular`
- `GET /api/stories`
- `GET /api/polls`
- `POST /api/polls/:id/vote`

## نکته

اگر کاربر لاگین نباشد، رأی دادن ممکن است از سمت API خطای احراز هویت بدهد. این رفتار طبیعی است و در مرحله polish می‌توانیم پیام بهتر برای آن اضافه کنیم.

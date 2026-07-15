# مرحله ۵ بازطراحی فرانت Hell Manhwa

## انجام شد

صفحه Library و صفحه جزئیات مانهوا بازطراحی شدند.

### فایل‌های تغییر کرده

- `frontend/components/manga/manga-list-page.tsx`
- `frontend/components/manga/manga-detail-page.tsx`
- `frontend/app/manga/page.tsx`
- `frontend/app/manga/[slug]/page.tsx`

### فایل‌های اضافه شده

- `frontend/components/manga/manga-card.tsx`

## قابلیت‌های UI اضافه‌شده

### Library
- هدر سینمایی برای کتابخانه
- جستجوی debounced
- فیلتر وضعیت
- ژانرهای سریع
- مرتب‌سازی:
  - جدیدترین
  - محبوب‌ترین
  - بیشترین چپتر
- کارت‌های مانهوا حرفه‌ای
- empty state بهتر
- skeleton loading

### Manga Detail
- هدر cinematic با banner
- کاور premium
- آمار سریع
- دکمه شروع خواندن
- دکمه آخرین چپتر
- لایک و بوکمارک
- لیست چپترهای بهتر
- sidebar اطلاعات سریع
- نمایش tagها
- لینک PDF/ZIP
- هماهنگی با Theme و AppShell جدید

## نکته فنی

در صفحه `/manga` از `useSearchParams` استفاده شده، بنابراین route داخل `Suspense` قرار گرفت تا در Next.js 15 خطای build نگیریم.

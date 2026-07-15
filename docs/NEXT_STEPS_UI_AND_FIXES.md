# لیست مراحل بعدی Hell Manhwa

## خطاهای فنی که باید همیشه در نسخه‌های بعدی مراقبشان باشیم

### 1. خطای ساخت مانهوا با Genre/Tag تکراری

خطا:

```text
Invalid this.prisma.manga.create() invocation
Unique constraint failed on the fields: (name)
```

علت:

این خطا معمولاً از `slug` مانهوا نیست. مربوط به مدل‌های `Genre` یا `Tag` است؛ چون فیلد `name` در آن‌ها unique است. اگر موقع افزودن مانهوا، ژانر یا تگ تکراری ارسال شود یا قبلاً در دیتابیس وجود داشته باشد، کد نباید دوباره بسازد، باید به رکورد موجود connect کند.

راه‌حل انجام‌شده:

- حذف استفاده مستقیم از `connectOrCreate`
- ساخت توابع `ensureGenres` و `ensureTags`
- جستجو با هر دو فیلد `slug` و `name`
- مدیریت خطای `P2002`
- حذف تکراری‌ها قبل از create/connect

## برنامه ۸ مرحله‌ای ارتقای فرانت با الهام از فایل مرجع

### مرحله ۱: استخراج تم و رنگ‌بندی
- پالت دارک
- بنفش/نیلی/اسلیت
- glassmorphism
- کارت‌های داشبوردی

### مرحله ۲: Theme Foundation
- اصلاح `globals.css`
- اصلاح `tailwind.config.ts`
- تعریف کلاس‌های پایه مثل glass، card، scrollbar

### مرحله ۳: Layout و Sidebar
- اضافه کردن layout داشبوردی حرفه‌ای
- Sidebar واکنش‌گرا
- Header جستجو

### مرحله ۴: صفحه اصلی
- Hero slider
- Trending grid
- Latest updates
- Stories
- Poll section

### مرحله ۵: Library و صفحات مانهوا
- فیلتر ژانر
- sort
- کارت‌های حرفه‌ای
- صفحه جزئیات قوی‌تر

### مرحله ۶: Reader
- کنترل‌های reader
- نمایش بهتر صفحات
- بخش کامنت بهتر
- حالت‌های خواندن

### مرحله ۷: Admin Panel
- داشبورد بهتر
- مدیریت مانهوا و چپتر
- جدول کاربران
- مدیریت فایل‌ها

### مرحله ۸: Polish نهایی
- انیمیشن‌ها
- responsive
- loading state
- empty state
- بهینه‌سازی UX

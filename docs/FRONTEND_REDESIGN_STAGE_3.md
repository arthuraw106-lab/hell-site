# مرحله ۳ بازطراحی فرانت Hell Manhwa

## انجام شد

در این مرحله App Shell اصلی پروژه بازطراحی شد.

### فایل‌های تغییر کرده

- `frontend/components/layout/app-shell.tsx`
- `frontend/components/layout/navbar.tsx`

## قابلیت‌های اضافه‌شده

- Sidebar حرفه‌ای RTL برای دسکتاپ
- Mobile drawer برای موبایل
- Header جدید با عنوان صفحه
- Search bar بالا
- نمایش وضعیت کاربر در Header و Sidebar
- لینک‌های واقعی به صفحات پروژه
- Highlight کردن route فعال
- دکمه خروج
- لینک تلگرام
- هماهنگی با theme مرحله ۲

## نکته

از این مرحله به بعد تمام صفحاتی که داخل `AppShell` هستند، layout جدید را می‌گیرند. صفحه Auth همچنان layout مستقل خودش را دارد.

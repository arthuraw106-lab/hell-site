# مرحله ۱ بازطراحی فرانت Hell Manhwa

این مرحله فقط مرحله تحلیل و پایه‌گذاری طراحی است و عمداً ظاهر صفحات را خراب یا جایگزین نمی‌کند.

## هدف

الهام گرفتن از فایل مرجع `a.html` و تبدیل ایده‌های قابل استفاده آن به یک Design System تمیز برای پروژه Next.js فعلی.

فایل مرجع مستقیم قابل استفاده نیست، چون:

- داخل iframe و srcdoc ساخته شده
- HTML و JS و CSS همه در یک فایل هستند
- از inline onclick استفاده می‌کند
- routing واقعی ندارد
- داده‌ها mock هستند
- با API واقعی پروژه وصل نیست
- مناسب Next.js App Router نیست
- زبان و جهت آن انگلیسی و LTR است، ولی پروژه ما فارسی و RTL است

پس ما فقط از رنگ‌بندی، فضا، layout و ایده‌های UI آن الهام می‌گیریم.

---

## چیزهای خوب فایل مرجع

### 1. رنگ‌بندی

فایل مرجع از تم دارک با طیف‌های زیر استفاده کرده:

- slate / navy dark
- purple / violet
- blue accent
- glass transparent panels
- borderهای خیلی نرم
- hoverهای آرام

این فضا برای سایت مانهوا خیلی مناسبه، چون حس premium و dark fantasy می‌دهد.

### 2. ساختار Layout

ایده‌های خوب:

- sidebar برای desktop
- mobile header
- search bar بالا
- main content scrollable
- بخش‌های جداگانه مثل library، chat، admin، support
- کارت‌های آماری در admin

### 3. کامپوننت‌های قابل الهام

- hero slider
- story strip
- trending grid
- latest updates
- poll card
- future works
- reader controls
- chat layout
- support tabs
- admin stats cards

---

## چیزهایی که نباید مستقیم کپی شوند

### 1. iframe / srcdoc

در پروژه اصلی نباید iframe برای UI استفاده شود.

### 2. inline onclick

کدهایی مثل:

```html
onclick="navigate('home')"
```

در Next.js باید تبدیل شود به:

- `Link`
- `useRouter`
- state
- component-level handlers

### 3. Tailwind CDN

در پروژه ما Tailwind از build pipeline می‌آید، نه CDN.

### 4. mock data

تمام داده‌ها باید از API واقعی پروژه بیایند:

- `/api/manga`
- `/api/stories`
- `/api/polls`
- `/api/admin`
- `/api/chat`

### 5. LTR English Layout

همه چیز باید RTL و فارسی شود.

---

## پالت پیشنهادی جدید

### رنگ‌های اصلی

- `void`: پس‌زمینه خیلی تاریک
- `panel`: سطح کارت‌ها
- `panelSoft`: سطح نرم‌تر
- `line`: border
- `text`: متن اصلی
- `muted`: متن کم‌رنگ
- `violet`: رنگ برند اصلی
- `purple`: رنگ مکمل
- `red`: رنگ اکشن و خطر
- `gold`: رنگ premium
- `cyan`: رنگ real-time و status

### حس کلی

Dark Premium Manhwa Dashboard

---

## مسیر ۸ مرحله‌ای نهایی

### مرحله ۱: Design Audit و Theme Tokens

وضعیت: انجام شد.

خروجی:

- مستند تحلیل طراحی
- فایل tokens طراحی
- لیست مراحل بعدی

### مرحله ۲: Theme Foundation

کارها:

- اصلاح `globals.css`
- اصلاح `tailwind.config.ts`
- تعریف کلاس‌های عمومی:
  - glass
  - neo-card
  - premium-button
  - custom-scrollbar
  - text-gradient
  - background effects

### مرحله ۳: App Shell جدید

کارها:

- ساخت layout داشبوردی حرفه‌ای
- sidebar برای desktop
- mobile header
- top search bar
- user menu
- active nav state

### مرحله ۴: صفحه اصلی

کارها:

- hero حرفه‌ای‌تر
- trending section
- latest chapters
- story strip
- poll preview
- future works
- animationهای بهتر

### مرحله ۵: Library و Manga Pages

کارها:

- فیلتر ژانر
- sort
- search UI
- کارت‌های مانهوا حرفه‌ای
- صفحه جزئیات cinematic

### مرحله ۶: Reader

کارها:

- reader controls
- progress
- next/prev chapter
- comments UI بهتر
- modeهای reading

### مرحله ۷: Admin Panel

کارها:

- داشبورد آماری بهتر
- فرم‌های بهتر
- جدول مدیریت کاربران
- مدیریت مانهوا و چپتر با UI بهتر
- modalهای ویرایش

### مرحله ۸: Polish نهایی

کارها:

- responsive کامل
- loading skeleton
- empty state
- toast
- micro animations
- UX cleanup

---

## خطاهای فنی که باید در طول redesign حواسمان باشد

### خطای Genre/Tag تکراری

```text
Unique constraint failed on the fields: (name)
```

علت:

تکراری بودن `name` در `Genre` یا `Tag`.

راه‌حل:

- استفاده نکردن از `connectOrCreate` خام
- استفاده از `ensureGenres`
- استفاده از `ensureTags`
- جستجو با `name` و `slug`
- مدیریت `P2002`

### خطای توکن هنگام آپلود

علت:

منقضی شدن access token.

راه‌حل:

- refresh token خودکار در `frontend/lib/api.ts`

### خطای Admin Redirect

علت:

middleware سمت Next به localStorage دسترسی ندارد.

راه‌حل:

- محافظت اصلی routeها سمت API باشد
- auth redirect در client مدیریت شود

---

## تصمیم طراحی

از این مرحله به بعد، هدف این است که ظاهر پروژه از یک سایت ساده به یک پنل/پلتفرم premium شبیه اپ‌های مدرن مانهوا تبدیل شود، ولی بدون اینکه API واقعی و ساختار فعلی خراب شود.

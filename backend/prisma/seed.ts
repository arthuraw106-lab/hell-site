import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function ensureAdmin() {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@hell.local').trim().toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin123456';
  const adminUsername = process.env.SEED_ADMIN_USERNAME || 'admin';

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const userByEmail = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (userByEmail) {
    return prisma.user.update({
      where: { id: userByEmail.id },
      data: {
        role: Role.SUPER_ADMIN,
        passwordHash,
        displayName: userByEmail.displayName || 'مدیر هل مانهوا',
        bio: userByEmail.bio || 'اکانت پیش‌فرض مدیریت',
        isBanned: false,
      },
    });
  }

  const userByUsername = await prisma.user.findUnique({
    where: { username: adminUsername },
  });

  if (userByUsername) {
    return prisma.user.update({
      where: { id: userByUsername.id },
      data: {
        email: adminEmail,
        role: Role.SUPER_ADMIN,
        passwordHash,
        displayName: userByUsername.displayName || 'مدیر هل مانهوا',
        bio: userByUsername.bio || 'اکانت پیش‌فرض مدیریت',
        isBanned: false,
      },
    });
  }

  return prisma.user.create({
    data: {
      email: adminEmail,
      username: adminUsername,
      displayName: 'مدیر هل مانهوا',
      role: Role.SUPER_ADMIN,
      bio: 'اکانت پیش‌فرض مدیریت',
      passwordHash,
      isBanned: false,
    },
  });
}

// Local placeholder cover — no external URLs, instant load
const PLACEHOLDER_COVER = '/api/placeholder-cover?title=';
const PLACEHOLDER_PAGES: string[] = [
  PLACEHOLDER_COVER + 'صفحه%201',
  PLACEHOLDER_COVER + 'صفحه%202',
];

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin123456';

  const admin = await ensureAdmin();

  const actionGenre = await prisma.genre.upsert({
    where: { slug: 'action' },
    update: {},
    create: { name: 'اکشن', slug: 'action' },
  });

  const fantasyGenre = await prisma.genre.upsert({
    where: { slug: 'fantasy' },
    update: {},
    create: { name: 'فانتزی', slug: 'fantasy' },
  });

  const dramaGenre = await prisma.genre.upsert({
    where: { slug: 'drama' },
    update: {},
    create: { name: 'درام', slug: 'drama' },
  });

  const hellKing = await prisma.manga.upsert({
    where: { slug: 'hell-king' },
    update: {},
    create: {
      slug: 'hell-king',
      title: 'پادشاه جهنم',
      altTitle: 'Hell King',
      description: 'یک شکارچی تنها در دنیایی تاریک دوباره متولد می‌شود و باید از برج سایه‌ها عبور کند.',
      cover: null,  // uses local placeholder fallback
      banner: null,
      seoTitle: 'پادشاه جهنم | Hell Manhwa',
      seoDescription: 'خواندن آنلاین مانهوا پادشاه جهنم با ترجمه فارسی',
      genres: {
        connect: [{ id: actionGenre.id }, { id: fantasyGenre.id }],
      },
      chapters: {
        create: [
          {
            number: 1,
            title: 'دروازه سیاه',
            pages: PLACEHOLDER_PAGES,
            summary: 'شروع سفر قهرمان از یک دروازه مرموز.',
          },
          {
            number: 2,
            title: 'نشان شعله',
            pages: PLACEHOLDER_PAGES,
            summary: 'قدرت تازه‌ای در تاریکی بیدار می‌شود.',
          },
        ],
      },
    },
  });

  await prisma.manga.upsert({
    where: { slug: 'red-shadows' },
    update: {},
    create: {
      slug: 'red-shadows',
      title: 'سایه‌های سرخ',
      altTitle: 'Red Shadows',
      description: 'رازهای یک خاندان نفرین‌شده در دل شهری مدرن، آرام آرام به خون و آتش می‌رسد.',
      cover: null,
      banner: null,
      genres: {
        connect: [{ id: dramaGenre.id }, { id: fantasyGenre.id }],
      },
      chapters: {
        create: [
          {
            number: 1,
            title: 'نقاب',
            pages: PLACEHOLDER_PAGES,
            summary: 'اولین نشانه‌های نفرین آشکار می‌شود.',
          },
        ],
      },
    },
  });

  await prisma.pollProject.upsert({
    where: { id: 'seed_poll_project_solo_dark' },
    update: {},
    create: {
      id: 'seed_poll_project_solo_dark',
      title: 'Solo Dark Hunter',
      description: 'پروژه پیشنهادی برای ترجمه بعدی تیم هل مانهوا',
      cover: null,
    },
  });

  const globalRoom = await prisma.chatRoom.upsert({
    where: { id: 'global_room' },
    update: {
      name: 'چت عمومی هل مانهوا',
    },
    create: {
      id: 'global_room',
      type: 'GROUP',
      name: 'چت عمومی هل مانهوا',
    },
  });

  await prisma.chatMember.upsert({
    where: {
      roomId_userId: {
        roomId: globalRoom.id,
        userId: admin.id,
      },
    },
    update: {},
    create: {
      roomId: globalRoom.id,
      userId: admin.id,
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: 'home' },
    update: {
      value: {
        telegramUrl: 'https://t.me/',
        heroTitle: 'هل مانهوا؛ دنیای تاریک مانهواهای فارسی',
        heroSubtitle: 'خواندن آنلاین، چت، استوری، رای‌گیری، تیم ترجمه و پنل مدیریت حرفه‌ای',
      },
    },
    create: {
      key: 'home',
      value: {
        telegramUrl: 'https://t.me/',
        heroTitle: 'هل مانهوا؛ دنیای تاریک مانهواهای فارسی',
        heroSubtitle: 'خواندن آنلاین، چت، استوری، رای‌گیری، تیم ترجمه و پنل مدیریت حرفه‌ای',
      },
    },
  });

  console.log('Seed completed:', {
    adminEmail: admin.email,
    adminUsername: admin.username,
    adminPassword,
    manga: hellKing.slug,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
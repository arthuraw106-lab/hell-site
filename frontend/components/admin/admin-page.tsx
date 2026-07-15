'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Check,
  ChevronLeft,
  Edit3,
  Eye,
  ImagePlus,
  Layers,
  MessageSquareWarning,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Send,
  Shield,
  Sparkles,
  Ticket,
  Trash2,
  UploadCloud,
  UserCog,
  Users,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Reveal } from '@/components/effects/reveal';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ProButton } from '@/components/ui/pro-button';
import { Textarea } from '@/components/ui/textarea';
import { ChapterZipUpload } from '@/components/upload/chapter-zip-upload';
import { UploadBox } from '@/components/upload/upload-box';
import { FeaturedMangaAdminCard } from '@/components/admin/featured-manga-admin-card';
import PollProjectsAdminCard from '@/components/admin/poll-projects-admin-card';
import { apiDelete, apiGet, apiPatch, apiPost } from '@/lib/api';
import type { Manga, Paginated } from '@/lib/types';

type Tab = 'dashboard' | 'manga' | 'users' | 'comments' | 'team' | 'tickets';

type Dashboard = {
  users: number;
  mangas: number;
  chapters: number;
  comments: number;
  stories: number;
  tickets: number;
  pendingTeamRequests: number;
};

type AdminUser = {
  id: string;
  username: string;
  phone?: string | null;
  email?: string | null;
  role: 'USER' | 'TRANSLATOR' | 'ADMIN' | 'SUPER_ADMIN';
  isBanned: boolean;
};

type TeamRequest = {
  id: string;
  requestedRole?: string | null;
  skills: string;
  experience: string;
  sampleUrl?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  user: {
    id: string;
    username: string;
    role: string;
  };
};

type AdminComment = {
  id: string;
  body: string;
  reports: number;
  isHidden: boolean;
  user: {
    username: string;
  };
  manga: {
    title: string;
  };
};

type AdminTicket = {
  id: string;
  category: string;
  subject: string;
  status: 'OPEN' | 'ANSWERED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    displayName?: string | null;
    avatar?: string | null;
    email?: string | null;
  };
  messages: {
    id: string;
    userId: string;
    body: string;
    isAdmin: boolean;
    createdAt: string;
  }[];
};

type MangaForm = {
  id?: string;
  title: string;
  altTitle: string;
  slug: string;
  description: string;
  cover: string;
  banner: string;
  genres: string;
  tags: string;
  status: 'ONGOING' | 'COMPLETED' | 'HIATUS' | 'UPCOMING';
  published: boolean;
  seoTitle: string;
  seoDescription: string;
};

type ChapterForm = {
  mangaId: string;
  number: string;
  title: string;
  pages: string;
  pdfUrl: string;
  zipUrl: string;
  summary: string;
  published: boolean;
};

const emptyMangaForm: MangaForm = {
  title: '',
  altTitle: '',
  slug: '',
  description: '',
  cover: '',
  banner: '',
  genres: 'اکشن, فانتزی',
  tags: '',
  status: 'ONGOING',
  published: true,
  seoTitle: '',
  seoDescription: '',
};

const emptyChapterForm: ChapterForm = {
  mangaId: '',
  number: '',
  title: '',
  pages: '',
  pdfUrl: '',
  zipUrl: '',
  summary: '',
  published: true,
};

const tabs: { key: Tab; label: string; icon: any; hint: string }[] = [
  { key: 'dashboard', label: 'داشبورد', icon: BarChart3, hint: 'آمار کلی سایت' },
  { key: 'manga', label: 'مانهوا و چپتر', icon: BookOpen, hint: 'مدیریت محتوا' },
  { key: 'users', label: 'کاربران', icon: Users, hint: 'نقش‌ها و بن' },
  { key: 'comments', label: 'کامنت‌ها', icon: MessageSquareWarning, hint: 'گزارش و مخفی‌سازی' },
  { key: 'team', label: 'تیم ترجمه', icon: Shield, hint: 'درخواست‌های عضویت' },
  { key: 'tickets', label: 'تیکت‌ها', icon: Ticket, hint: 'پاسخ‌گویی پشتیبانی' },
];

function csvToArray(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function linesToArray(value: string) {
  return value.split('\n').map((item) => item.trim()).filter(Boolean);
}

function mangaToForm(manga: Manga): MangaForm {
  return {
    id: manga.id,
    title: manga.title || '',
    altTitle: manga.altTitle || '',
    slug: manga.slug || '',
    description: manga.description || '',
    cover: manga.cover || '',
    banner: manga.banner || '',
    genres: manga.genres?.map((genre) => genre.name).join(', ') || '',
    tags: manga.tags?.map((tag) => tag.name).join(', ') || '',
    status: manga.status || 'ONGOING',
    published: manga.published,
    seoTitle: manga.seoTitle || '',
    seoDescription: manga.seoDescription || '',
  };
}

export function AdminPage() {
  const [tab, setTab] = useState<Tab>('dashboard');

  const { data: dashboard } = useQuery({
    queryKey: ['admin-dashboard-ticket-ui'],
    queryFn: () => apiGet<Dashboard>('/admin/dashboard'),
  });

  return (
    <AppShell>
      <main className="relative z-10 mx-auto max-w-7xl px-5 py-10">
        <Reveal>
          <section className="neo-card relative mb-8 overflow-hidden rounded-[2.5rem] p-7 md:p-10">
            <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-hell-violet/25 bg-hell-violet/10 px-4 py-2 text-sm font-black text-violet-100">
                  <Sparkles size={16} />
                  Control Center
                </div>
                <h1 className="text-5xl font-black leading-tight md:text-7xl">
                  پنل <span className="text-gradient">مدیریت</span>
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/55">
                  مدیریت محتوا، کاربران، کامنت‌ها، درخواست‌های تیم و پاسخ‌گویی به تیکت‌ها.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:w-[420px]">
                <MiniStat label="تیکت‌ها" value={dashboard?.tickets || 0} icon={Ticket} />
                <MiniStat label="درخواست‌های تیم" value={dashboard?.pendingTeamRequests || 0} icon={Shield} />
              </div>
            </div>
          </section>
        </Reveal>

        <section className="mb-8 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {tabs.map((item, index) => {
            const Icon = item.icon;
            const active = tab === item.key;

            return (
              <Reveal key={item.key} delay={index * 0.035}>
                <button
                  type="button"
                  onClick={() => setTab(item.key)}
                  className={
                    active
                      ? 'neo-card premium-border w-full rounded-[2rem] p-4 text-right shadow-violet'
                      : 'rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 text-right transition hover:bg-white/[0.075]'
                  }
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className={active ? 'grid h-11 w-11 place-items-center rounded-2xl bg-hell-violet/20 text-hell-cyan' : 'grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-white/45'}>
                      <Icon size={20} />
                    </span>
                    {active ? <Check size={18} className="text-hell-cyan" /> : <ChevronLeft size={18} className="text-white/25" />}
                  </div>
                  <strong>{item.label}</strong>
                  <p className="mt-2 text-xs leading-5 text-white/42">{item.hint}</p>
                </button>
              </Reveal>
            );
          })}
        </section>

        {tab === 'dashboard' ? <DashboardTab dashboard={dashboard} /> : null}
        {tab === 'manga' ? <MangaAdminTab /> : null}
        {tab === 'users' ? <UsersAdminTab /> : null}
        {tab === 'comments' ? <CommentsAdminTab /> : null}
        {tab === 'team' ? <TeamAdminTab /> : null}
        {tab === 'tickets' ? <TicketsAdminTab /> : null}
      </main>
    </AppShell>
  );
}

function MiniStat({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-4">
      <Icon className="mb-3 text-hell-cyan" size={22} />
      <div className="text-3xl font-black">{value}</div>
      <div className="mt-1 text-sm text-white/45">{label}</div>
    </div>
  );
}

function DashboardTab({ dashboard }: { dashboard?: Dashboard }) {
  const cards = [
    ['کاربران', dashboard?.users || 0, Users, 'کل کاربران ثبت‌شده'],
    ['مانهواها', dashboard?.mangas || 0, BookOpen, 'تعداد آثار ثبت‌شده'],
    ['چپترها', dashboard?.chapters || 0, Layers, 'کل چپترهای موجود'],
    ['کامنت‌ها', dashboard?.comments || 0, MessageSquareWarning, 'تعامل کاربران'],
    ['استوری‌ها', dashboard?.stories || 0, Eye, 'استوری‌های فعال/ثبت‌شده'],
    ['تیکت‌ها', dashboard?.tickets || 0, Ticket, 'درخواست‌های پشتیبانی'],
    ['درخواست‌های تیم', dashboard?.pendingTeamRequests || 0, Shield, 'منتظر بررسی'],
  ];

  return (
    <div className="grid gap-6">
      <PollProjectsAdminCard />
      <Reveal>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon, hint]: any, index) => (
          <div key={label} className="neo-card rounded-[2rem] p-6">
            <div className="mb-5 flex items-center justify-between">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-hell-violet/15 text-hell-cyan">
                <Icon size={24} />
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/42">#{index + 1}</span>
            </div>
            <div className="text-4xl font-black">{value}</div>
            <div className="mt-2 font-bold">{label}</div>
            <p className="mt-2 text-sm leading-6 text-white/45">{hint}</p>
          </div>
        ))}
      </div>
    </Reveal>
    </div>
  );
}

function MangaAdminTab() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<MangaForm>(emptyMangaForm);
  const [chapterForm, setChapterForm] = useState<ChapterForm>(emptyChapterForm);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-manga-list-ticket-ui'],
    queryFn: () => apiGet<Paginated<Manga>>('/manga', { page: 1, limit: 100 }),
  });

  const mangas = data?.items || [];

  const filteredMangas = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mangas;
    return mangas.filter((manga) => manga.title.toLowerCase().includes(q) || manga.slug.toLowerCase().includes(q));
  }, [mangas, search]);

  const saveMangaMutation = useMutation({
    mutationFn: () => {
      const payload = {
        title: form.title,
        altTitle: form.altTitle || undefined,
        slug: form.slug,
        description: form.description,
        cover: form.cover || undefined,
        banner: form.banner || undefined,
        status: form.status,
        published: form.published,
        genres: csvToArray(form.genres),
        tags: csvToArray(form.tags),
        seoTitle: form.seoTitle || undefined,
        seoDescription: form.seoDescription || undefined,
      };
      if (editing && form.id) return apiPatch(`/manga/${form.id}`, payload);
      return apiPost('/manga', payload);
    },
    onSuccess: async () => {
      setMessage(editing ? 'مانهوا ویرایش شد.' : 'مانهوا ساخته شد.');
      setForm(emptyMangaForm);
      setEditing(false);
      await refetch();
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : 'خطا در ذخیره مانهوا'),
  });

  const deleteMangaMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/manga/${id}`),
    onSuccess: async () => {
      setMessage('مانهوا حذف شد.');
      await refetch();
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : 'خطا در حذف مانهوا'),
  });

  const addChapterMutation = useMutation({
    mutationFn: () =>
      apiPost(`/manga/${chapterForm.mangaId}/chapters`, {
        number: Number(chapterForm.number),
        title: chapterForm.title,
        pages: linesToArray(chapterForm.pages),
        pdfUrl: chapterForm.pdfUrl || undefined,
        zipUrl: chapterForm.zipUrl || undefined,
        summary: chapterForm.summary || undefined,
        published: chapterForm.published,
      }),
    onSuccess: async () => {
      setMessage('چپتر اضافه شد.');
      setChapterForm({
        mangaId: '',
        number: '',
        title: '',
        pages: '',
        pdfUrl: '',
        zipUrl: '',
        summary: '',
        published: true,
      });
      await refetch();
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : 'خطا در افزودن چپتر'),
  });

  const deleteChapterMutation = useMutation({
    mutationFn: (chapterId: string) => apiDelete(`/manga/chapters/${chapterId}`),
    onSuccess: async () => {
      setMessage('چپتر حذف شد.');
      await refetch();
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : 'خطا در حذف چپتر'),
  });

  function startEdit(manga: Manga) {
    setForm(mangaToForm(manga));
    setEditing(true);
    setMessage(`در حال ویرایش: ${manga.title}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startAddChapter(manga: Manga) {
    setChapterForm({
      mangaId: manga.id,
      number: '',
      title: '',
      pages: '',
      pdfUrl: '',
      zipUrl: '',
      summary: '',
      published: true,
    });
    setMessage(`افزودن چپتر برای ${manga.title}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="grid gap-6">
      <FeaturedMangaAdminCard />
      {message ? <div className="neo-card rounded-[2rem] p-4 text-sm leading-7 text-violet-100">{message}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_440px]">
        <Card className="neo-card rounded-[2.5rem] p-6">
          <h2 className="text-3xl font-black">{editing ? 'ویرایش مانهوا' : 'افزودن مانهوا'}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="عنوان فارسی" />
            <Input value={form.altTitle} onChange={(e) => setForm({ ...form, altTitle: e.target.value })} placeholder="عنوان جایگزین" />
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="slug" />
            <Input value={form.genres} onChange={(e) => setForm({ ...form, genres: e.target.value })} placeholder="ژانرها با کاما" />
            <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="تگ‌ها با کاما" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as MangaForm['status'] })} className="h-12 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-white outline-none">
              <option value="ONGOING">در حال انتشار</option>
              <option value="COMPLETED">کامل شده</option>
              <option value="HIATUS">متوقف</option>
              <option value="UPCOMING">به‌زودی</option>
            </select>
            <Input value={form.cover} onChange={(e) => setForm({ ...form, cover: e.target.value })} placeholder="لینک کاور" />
            <Input value={form.banner} onChange={(e) => setForm({ ...form, banner: e.target.value })} placeholder="لینک بنر" />
            <Input value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} placeholder="SEO Title" />
            <Input value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} placeholder="SEO Description" />
            <div className="md:col-span-2">
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="خلاصه داستان" className="min-h-36" />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-white/60">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              منتشر شده باشد
            </label>
            <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
              <UploadBox label="آپلود کاور" onUploaded={(upload) => setForm({ ...form, cover: upload.url })} />
              <UploadBox label="آپلود بنر" onUploaded={(upload) => setForm({ ...form, banner: upload.url })} />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <ProButton disabled={saveMangaMutation.isPending || !form.title.trim() || !form.slug.trim() || !form.description.trim()} onClick={() => saveMangaMutation.mutate()}>
              <Save size={16} />
              {editing ? 'ذخیره ویرایش' : 'ساخت مانهوا'}
            </ProButton>
            {editing ? <Button variant="secondary" onClick={() => { setForm({ title: '', altTitle: '', slug: '', description: '', cover: '', banner: '', genres: 'اکشن, فانتزی', tags: '', status: 'ONGOING', published: true, seoTitle: '', seoDescription: '' }); setEditing(false); }}>لغو</Button> : null}
          </div>
        </Card>

        <Card className="neo-card rounded-[2.5rem] p-6">
          <h2 className="text-3xl font-black">افزودن چپتر</h2>
          <div className="mt-5 grid gap-4">
            <select value={chapterForm.mangaId} onChange={(e) => setChapterForm({ ...chapterForm, mangaId: e.target.value })} className="h-12 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-white outline-none">
              <option value="">انتخاب مانهوا</option>
              {mangas.map((manga) => <option key={manga.id} value={manga.id}>{manga.title}</option>)}
            </select>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input value={chapterForm.number} onChange={(e) => setChapterForm({ ...chapterForm, number: e.target.value })} placeholder="شماره چپتر" />
              <Input value={chapterForm.title} onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })} placeholder="عنوان چپتر" />
            </div>
            <ChapterZipUpload onExtracted={(result) => setChapterForm({ ...chapterForm, pages: result.pages.join('\n'), zipUrl: result.zipUrl })} />
            <Textarea value={chapterForm.pages} onChange={(e) => setChapterForm({ ...chapterForm, pages: e.target.value })} placeholder="لینک صفحات" className="min-h-36" />
            <Input value={chapterForm.pdfUrl} onChange={(e) => setChapterForm({ ...chapterForm, pdfUrl: e.target.value })} placeholder="لینک PDF اختیاری" />
            <Input value={chapterForm.zipUrl} onChange={(e) => setChapterForm({ ...chapterForm, zipUrl: e.target.value })} placeholder="لینک ZIP" />
            <Textarea value={chapterForm.summary} onChange={(e) => setChapterForm({ ...chapterForm, summary: e.target.value })} placeholder="خلاصه چپتر" />
            <ProButton disabled={addChapterMutation.isPending || !chapterForm.mangaId || !chapterForm.number.trim() || !chapterForm.title.trim() || !chapterForm.pages.trim()} onClick={() => addChapterMutation.mutate()}>
              <Plus size={16} />
              افزودن چپتر
            </ProButton>
          </div>
        </Card>
      </div>

      <Card className="neo-card rounded-[2.5rem] p-6">
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h2 className="text-3xl font-black">مانهواهای موجود</h2>
          <div className="relative w-full md:w-80">
            <Search className="absolute right-4 top-3.5 text-white/35" size={18} />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جستجوی مانهوا..." className="pr-11" />
          </div>
        </div>

        <div className="grid gap-3">
          {isLoading ? <div className="h-40 rounded-3xl skeleton" /> : filteredMangas.map((manga) => (
            <div key={manga.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
                <div className="flex min-w-0 gap-4">
                  <div className="h-28 w-20 shrink-0 overflow-hidden rounded-2xl bg-black">
                    {manga.cover ? <img src={manga.cover} alt={manga.title} className="h-full w-full object-cover" /> : <ImagePlus />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-black">{manga.title}</h3>
                    <p className="mt-1 truncate text-sm text-white/45">slug: {manga.slug}</p>
                    <p className="mt-1 text-sm text-white/45">چپترها: {manga.chapters?.length || 0} · وضعیت: {manga.status}</p>
                    {manga.chapters?.length ? (
                      <div className="mt-3 grid gap-2">
                        {manga.chapters.slice(0, 4).map((chapter) => (
                          <div key={chapter.id} className="flex items-center justify-between gap-2 rounded-2xl bg-black/20 px-3 py-2 text-xs text-white/55">
                            <span className="truncate">چپتر {chapter.number}: {chapter.title}</span>
                            <button type="button" className="shrink-0 rounded-xl bg-red-500/15 px-2 py-1 font-bold text-red-100 transition hover:bg-red-500/25" onClick={() => deleteChapterMutation.mutate(chapter.id)}>
                              حذف
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={() => { setForm(mangaToForm(manga)); setEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><Edit3 size={15} /><span className="mr-2">ویرایش</span></Button>
                  <Button variant="secondary" size="sm" onClick={() => setChapterForm({ ...chapterForm, mangaId: manga.id })}><UploadCloud size={15} /><span className="mr-2">چپتر جدید</span></Button>
                  <Button variant="danger" size="sm" onClick={() => { if (window.confirm(`مانهوای "${manga.title}" حذف شود؟`)) deleteMangaMutation.mutate(manga.id); }}><Trash2 size={15} /><span className="mr-2">حذف کامل</span></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function UsersAdminTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-users-ticket-ui'],
    queryFn: () => apiGet<AdminUser[]>('/admin/users'),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((user) => user.username.toLowerCase().includes(q) || user.email?.toLowerCase().includes(q));
  }, [data, search]);

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminUser> }) => apiPatch(`/admin/users/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users-ticket-ui'] }),
  });

  return (
    <Reveal>
      <Card className="neo-card rounded-[2.5rem] p-6">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-black">مدیریت کاربران</h2>
            <p className="mt-2 text-sm text-white/45">بن، آنبن و تغییر نقش کاربران</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute right-4 top-3.5 text-white/35" size={18} />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی کاربر..." className="pr-11" />
          </div>
        </div>

        {isLoading ? <div className="h-64 rounded-3xl skeleton" /> : (
          <div className="grid gap-3">
            {filtered.map((user) => (
              <div key={user.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div>
                    <strong className="text-lg">{user.username}</strong>
                    <p className="mt-1 text-sm text-white/45">{user.email || user.phone || 'بدون اطلاعات تماس'}</p>
                    <div className="mt-2 flex gap-2">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/55">{user.role}</span>
                      {user.isBanned ? <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs text-red-100">BANNED</span> : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant={user.isBanned ? 'primary' : 'danger'} onClick={() => mutation.mutate({ id: user.id, data: { isBanned: !user.isBanned } })}>{user.isBanned ? 'آنبن' : 'بن'}</Button>
                    <Button size="sm" variant="secondary" onClick={() => mutation.mutate({ id: user.id, data: { role: 'ADMIN' } })}>ادمین</Button>
                    <Button size="sm" variant="secondary" onClick={() => mutation.mutate({ id: user.id, data: { role: 'TRANSLATOR' } })}>مترجم</Button>
                    <Button size="sm" variant="secondary" onClick={() => mutation.mutate({ id: user.id, data: { role: 'USER' } })}>کاربر</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </Reveal>
  );
}

function CommentsAdminTab() {
  const queryClient = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-comments-ticket-ui'],
    queryFn: () => apiGet<AdminComment[]>('/admin/comments'),
  });

  const mutation = useMutation({
    mutationFn: (id: string) => apiPatch(`/admin/comments/${id}/hide`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-comments-ticket-ui'] }),
  });

  return (
    <Reveal>
      <Card className="neo-card rounded-[2.5rem] p-6">
        <h2 className="text-3xl font-black">مدیریت کامنت‌ها</h2>
        <div className="mt-6 grid gap-3">
          {isLoading ? <div className="h-64 rounded-3xl skeleton" /> : data.map((comment) => (
            <div key={comment.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <strong>{comment.user.username}</strong>
                  <p className="mt-1 text-sm text-white/45">{comment.manga.title}</p>
                </div>
                <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold text-red-100">{comment.reports} گزارش</span>
              </div>
              <p className="rounded-2xl bg-white/[0.035] p-4 leading-7 text-white/65">{comment.body}</p>
              <Button className="mt-4" size="sm" variant="danger" onClick={() => mutation.mutate(comment.id)}>مخفی کردن</Button>
            </div>
          ))}
        </div>
      </Card>
    </Reveal>
  );
}

function TeamAdminTab() {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-team-requests-ticket-ui'],
    queryFn: () => apiGet<TeamRequest[]>('/admin/team-requests'),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => apiPatch(`/admin/team-requests/${id}/approve`, { note }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-team-requests-ticket-ui'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) => apiPatch(`/admin/team-requests/${id}/reject`, { note }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-team-requests-ticket-ui'] }),
  });

  return (
    <Reveal>
      <Card className="neo-card rounded-[2.5rem] p-6">
        <h2 className="text-3xl font-black">درخواست‌های تیم ترجمه</h2>
        <div className="mt-6 grid gap-3">
          {isLoading ? <div className="h-64 rounded-3xl skeleton" /> : data.map((request) => (
            <div key={request.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <strong className="text-lg">{request.user.username}</strong>
                  <p className="mt-1 text-sm text-white/45">نقش درخواستی: {request.requestedRole || 'نامشخص'} · وضعیت: {request.status}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => approveMutation.mutate({ id: request.id, note: notes[request.id] })}>تایید</Button>
                  <Button size="sm" variant="danger" onClick={() => rejectMutation.mutate({ id: request.id, note: notes[request.id] })}>رد</Button>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-white/[0.035] p-4"><div className="mb-2 text-sm font-bold text-white/45">مهارت‌ها</div><p className="text-sm leading-7 text-white/65">{request.skills}</p></div>
                <div className="rounded-2xl bg-white/[0.035] p-4"><div className="mb-2 text-sm font-bold text-white/45">تجربه</div><p className="text-sm leading-7 text-white/65">{request.experience}</p></div>
              </div>
              <Textarea value={notes[request.id] || ''} onChange={(event) => setNotes({ ...notes, [request.id]: event.target.value })} placeholder="پیام ادمین برای کاربر..." className="mt-4 min-h-24" />
            </div>
          ))}
        </div>
      </Card>
    </Reveal>
  );
}

function TicketsAdminTab() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState('');
  const [reply, setReply] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'ANSWERED' | 'CLOSED'>('ALL');

  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-tickets-list-ui'],
    queryFn: () => apiGet<AdminTicket[]>('/admin/tickets'),
  });

  const filtered = useMemo(() => {
    if (statusFilter === 'ALL') return data;
    return data.filter((ticket) => ticket.status === statusFilter);
  }, [data, statusFilter]);

  const selected = useMemo(() => filtered.find((ticket) => ticket.id === selectedId) || filtered[0], [filtered, selectedId]);

  const replyMutation = useMutation({
    mutationFn: () => apiPatch(`/admin/tickets/${selected?.id}/reply`, { body: reply, status: 'ANSWERED' }),
    onSuccess: async () => {
      setReply('');
      await queryClient.invalidateQueries({ queryKey: ['admin-tickets-list-ui'] });
    },
  });

  const closeMutation = useMutation({
    mutationFn: (id: string) => apiPatch(`/admin/tickets/${id}`, { status: 'CLOSED' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-tickets-list-ui'] }),
  });

  return (
    <Reveal>
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card className="neo-card rounded-[2.5rem] p-5">
          <h2 className="text-3xl font-black">تیکت‌ها</h2>
          <p className="mt-2 text-sm text-white/45">لیست تیکت‌های کاربران</p>

          <div className="my-4 grid grid-cols-2 gap-2">
            {(['ALL', 'OPEN', 'ANSWERED', 'CLOSED'] as const).map((status) => (
              <button key={status} onClick={() => setStatusFilter(status)} className={statusFilter === status ? 'rounded-2xl bg-hell-violet px-3 py-2 text-xs font-black' : 'rounded-2xl bg-white/10 px-3 py-2 text-xs text-white/55'}>
                {status}
              </button>
            ))}
          </div>

          <div className="custom-scrollbar grid max-h-[650px] gap-2 overflow-y-auto">
            {isLoading ? <div className="h-40 rounded-3xl skeleton" /> : filtered.map((ticket) => (
              <button key={ticket.id} type="button" onClick={() => setSelectedId(ticket.id)} className={selected?.id === ticket.id ? 'rounded-3xl bg-hell-violet/20 p-4 text-right' : 'rounded-3xl bg-white/[0.04] p-4 text-right hover:bg-white/[0.07]'}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <strong className="truncate">{ticket.subject}</strong>
                  <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[10px]">{ticket.status}</span>
                </div>
                <p className="truncate text-xs text-white/45">{ticket.user.displayName || ticket.user.username}</p>
                <p className="mt-1 truncate text-xs text-white/35">{ticket.category}</p>
              </button>
            ))}
            {!filtered.length && !isLoading ? <div className="rounded-3xl bg-white/[0.04] p-5 text-center text-white/45">تیکتی وجود ندارد.</div> : null}
          </div>
        </Card>

        <Card className="neo-card flex min-h-[720px] flex-col rounded-[2.5rem] p-0">
          {selected ? (
            <>
              <div className="border-b border-white/10 p-5">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <h2 className="text-2xl font-black">{selected.subject}</h2>
                    <p className="mt-2 text-sm text-white/45">
                      کاربر: {selected.user.displayName || selected.user.username} · {selected.user.email || 'بدون ایمیل'} · دسته: {selected.category}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-bold">{selected.status}</span>
                    <Button variant="danger" size="sm" disabled={closeMutation.isPending} onClick={() => closeMutation.mutate(selected.id)}>بستن</Button>
                  </div>
                </div>
              </div>

              <div className="custom-scrollbar flex-1 overflow-y-auto p-5">
                <div className="grid gap-3">
                  {selected.messages.map((message) => (
                    <div key={message.id} className={message.isAdmin ? 'flex justify-start' : 'flex justify-end'}>
                      <div className={message.isAdmin ? 'max-w-[82%] rounded-3xl border border-hell-cyan/20 bg-hell-cyan/10 p-4' : 'max-w-[82%] rounded-3xl bg-white/[0.07] p-4'}>
                        <div className="mb-2 text-xs font-bold text-white/40">{message.isAdmin ? 'ادمین' : selected.user.username}</div>
                        <p className="whitespace-pre-wrap leading-7 text-white/75">{message.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 p-5">
                <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="پاسخ ادمین را بنویس..." className="min-h-28" />
                <div className="mt-3 flex justify-end">
                  <Button disabled={!reply.trim() || replyMutation.isPending} onClick={() => replyMutation.mutate()}>
                    <Send size={16} />
                    <span className="mr-2">ارسال پاسخ</span>
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="grid flex-1 place-items-center p-8 text-center text-white/45">
              <div>
                <AlertTriangle className="mx-auto mb-4" size={42} />
                تیکتی انتخاب نشده.
              </div>
            </div>
          )}
        </Card>
      </div>
    </Reveal>
  );
}

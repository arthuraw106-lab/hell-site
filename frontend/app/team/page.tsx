'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { apiRequest, mediaUrl } from '@/lib/team-api';
import { useAuthStore } from '@/store/auth-store';

type TeamRole = 'TRANSLATOR' | 'TYPESETTER' | 'CLEANER';

type TestFile = { id: string; role: TeamRole; title: string; description?: string; fileUrl: string };

type TeamMe = {
  profile?: {
    id: string; teamRole: TeamRole; status: string;
    phone?: string; telegramId?: string; cardNumber?: string;
    walletBalance?: number;
    approvedTestAt?: string; fullyApprovedAt?: string;
  };
  requests?: Array<{
    id: string; status: string; requestedRole?: TeamRole;
    adminNote?: string;
  }>;
};

type TeamTask = {
  id: string; title: string; mangaId?: string; chapterId?: string;
  role: TeamRole; price: number; deadlineAt?: string; status: string;
  englishFileUrl?: string; translationFileUrl?: string; cleanedFileUrl?: string;
  extraFileUrl?: string; submittedFileUrl?: string; submittedNote?: string;
  adminNote?: string;
};

const roleLabel: Record<TeamRole, string> = {
  TRANSLATOR: 'مترجم', TYPESETTER: 'تایپیست', CLEANER: 'کلینر',
};

const statusLabel: Record<string, string> = {
  TEST_PENDING: 'در انتظار بررسی تست توسط ادمین',
  TEST_APPROVED: 'تست تایید شد — اطلاعات تکمیلی را وارد کنید',
  TEST_REJECTED: 'تست رد شد',
  PROFILE_PENDING: 'منتظر تایید نهایی ادمین',
  FULL_APPROVED: '✅ عضو فعال تیم ترجمه',
  REJECTED: 'رد شده',
};

export default function TeamPage() {
  const user = useAuthStore((s) => s.user);
  const [me, setMe] = useState<TeamMe | null>(null);
  const [tests, setTests] = useState<TestFile[]>([]);
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [requestedRole, setRequestedRole] = useState<TeamRole>('TRANSLATOR');
  const [description, setDescription] = useState('');
  const [testFile, setTestFile] = useState<File | null>(null);
  const [phone, setPhone] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [taskFiles, setTaskFiles] = useState<Record<string, File | null>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const profile = me?.profile;
  const isActive = profile?.status === 'FULL_APPROVED';
  const needsProfile = profile?.status === 'TEST_APPROVED';
  const canApply = !profile || profile.status === 'TEST_REJECTED' || profile.status === 'REJECTED';

  const selectedTest = useMemo(() => tests.find((t) => t.role === requestedRole), [tests, requestedRole]);

  async function load() {
    setLoading(true);
    try {
      const [meData, testData] = await Promise.all([
        apiRequest<TeamMe | null>('/team/me').catch(() => null),
        apiRequest<TestFile[]>('/team/test-files').catch(() => []),
      ]);
      setMe(meData);
      setTests(testData);

      if (meData?.profile?.status === 'FULL_APPROVED') {
        const taskData = await apiRequest<TeamTask[]>('/team/tasks').catch(() => []);
        setTasks(taskData);
      }
    } catch {
      setMessage('خطا در دریافت اطلاعات');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function submitApply(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!testFile) { setMessage('فایل تست را آپلود کنید.'); return; }
    const form = new FormData();
    form.append('requestedRole', requestedRole);
    form.append('experience', description);
    form.append('skills', description);
    form.append('testFile', testFile);
    try {
      setMessage('');
      await apiRequest('/team/request', { method: 'POST', body: form });
      setMessage('درخواست ثبت شد. منتظر بررسی ادمین باشید.');
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'خطا در ثبت');
    }
  }

  async function submitProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setMessage('');
      await apiRequest('/team/me/profile', { method: 'PATCH', body: { phone, telegramId, cardNumber } });
      setMessage('اطلاعات ثبت شد. منتظر تایید نهایی باشید.');
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'خطا');
    }
  }

  async function submitTask(taskId: string) {
    const file = taskFiles[taskId];
    if (!file) { setMessage('فایل خروجی را انتخاب کنید.'); return; }
    const form = new FormData();
    form.append('file', file);
    try {
      await apiRequest(`/team/tasks/${taskId}/submit`, { method: 'POST', body: form });
      setMessage('کار ارسال شد.');
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'خطا در ارسال');
    }
  }

  if (!user) {
    return <AppShell><p className="p-8 text-center text-hell-muted">برای دسترسی به بخش تیم، باید وارد شوید.</p></AppShell>;
  }

  if (loading) {
    return <AppShell><div className="p-8 text-center text-hell-muted">بارگذاری...</div></AppShell>;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6 p-4">
        {/* Header */}
        <div className="card p-6">
          <h1 className="text-2xl font-black"><span className="text-hell-violet">پنل</span> تیم ترجمه</h1>
          <p className="mt-2 text-sm text-hell-muted leading-7">
            درخواست عضویت، دانلود و آپلود تست، تکمیل اطلاعات و انجام کارهای تیم.
          </p>
        </div>

        {message && (
          <div className="rounded-lg border border-hell-border bg-hell-card p-3 text-sm">{message}</div>
        )}

        {/* Status */}
        {profile && (
          <div className="card p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs text-hell-muted">وضعیت</p>
                <h2 className="text-lg font-bold text-hell-light">{statusLabel[profile.status] || profile.status}</h2>
                {profile.teamRole && <p className="mt-1 text-sm text-hell-muted">نقش: {roleLabel[profile.teamRole]}</p>}
                {me?.requests?.[0]?.adminNote && <p className="mt-1 text-sm text-hell-muted">یادداشت ادمین: {me.requests[0].adminNote}</p>}
              </div>
              {profile.walletBalance !== undefined && (
                <div className="rounded-lg border border-hell-border bg-hell-bg px-5 py-3 text-center">
                  <p className="text-xs text-hell-muted">موجودی</p>
                  <p className="text-xl font-black text-hell-light">{Number(profile.walletBalance).toLocaleString('fa-IR')} تومان</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Apply form + test download */}
        {canApply && (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <form onSubmit={submitApply} className="card p-5 space-y-4">
              <h2 className="text-lg font-bold">فرم درخواست عضویت</h2>

              <label className="grid gap-1.5">
                <span className="text-sm font-bold">نقش مورد نظر</span>
                <select
                  value={requestedRole}
                  onChange={(e) => setRequestedRole(e.target.value as TeamRole)}
                  className="rounded-lg border border-hell-border bg-hell-bg px-3 py-2 text-white outline-none focus:border-hell-violet"
                >
                  <option value="TRANSLATOR">مترجم</option>
                  <option value="TYPESETTER">تایپیست</option>
                  <option value="CLEANER">کلینر</option>
                </select>
              </label>

              <label className="grid gap-1.5">
                <span className="text-sm font-bold">توضیحات / سابقه / مهارت‌ها</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="rounded-lg border border-hell-border bg-hell-bg px-3 py-2 text-white outline-none focus:border-hell-violet"
                  placeholder="مهارت‌ها و تجربه خود را بنویسید..."
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-sm font-bold">آپلود فایل تست انجام‌شده</span>
                <input
                  type="file"
                  onChange={(e) => setTestFile(e.target.files?.[0] || null)}
                  className="rounded-lg border border-dashed border-hell-border bg-hell-bg px-4 py-6 text-sm"
                  required
                />
              </label>

              <button className="w-full rounded-lg bg-hell-violet py-2.5 font-bold hover:bg-hell-violet2">
                ارسال درخواست
              </button>
            </form>

            <aside className="card p-5">
              <h3 className="font-bold">دانلود فایل تست</h3>
              <p className="mt-2 text-sm text-hell-muted">
                فایل تست را دانلود کنید، انجام دهید، سپس خروجی را آپلود کنید.
              </p>
              {selectedTest ? (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-bold">{selectedTest.title}</p>
                  {selectedTest.description && <p className="text-xs text-hell-muted">{selectedTest.description}</p>}
                  <a
                    href={mediaUrl(selectedTest.fileUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-lg bg-hell-violet py-2 text-center text-sm font-bold hover:bg-hell-violet2"
                  >
                    دانلود تست {roleLabel[selectedTest.role]}
                  </a>
                </div>
              ) : (
                <p className="mt-4 text-xs text-hell-muted">فایل تستی برای این نقش آپلود نشده.</p>
              )}
            </aside>
          </div>
        )}

        {/* Profile form (after test approved) */}
        {needsProfile && (
          <form onSubmit={submitProfile} className="card p-5 space-y-4">
            <h2 className="text-lg font-bold">تکمیل اطلاعات برای تایید نهایی</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="grid gap-1.5">
                <span className="text-sm font-bold">شماره تلفن</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="۰۹۱۲..." className="rounded-lg border border-hell-border bg-hell-bg px-3 py-2 outline-none focus:border-hell-violet" required />
              </label>
              <label className="grid gap-1.5">
                <span className="text-sm font-bold">آیدی تلگرام</span>
                <input value={telegramId} onChange={(e) => setTelegramId(e.target.value)} placeholder="@username" className="rounded-lg border border-hell-border bg-hell-bg px-3 py-2 outline-none focus:border-hell-violet" required />
              </label>
              <label className="grid gap-1.5">
                <span className="text-sm font-bold">شماره کارت</span>
                <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="۶۲۱۹..." className="rounded-lg border border-hell-border bg-hell-bg px-3 py-2 outline-none focus:border-hell-violet" required />
              </label>
            </div>
            <button className="rounded-lg bg-hell-violet px-5 py-2.5 font-bold hover:bg-hell-violet2">ثبت اطلاعات</button>
          </form>
        )}

        {/* Active member: tasks + chat */}
        {isActive && (
          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            <section className="card p-5 space-y-4">
              <h2 className="text-lg font-bold">کارهای ارسالی ادمین</h2>
              {tasks.length === 0 ? (
                <p className="text-sm text-hell-muted">فعلاً کاری برای شما ثبت نشده.</p>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="rounded-lg border border-hell-border bg-hell-bg p-4 space-y-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="font-bold">{task.title}</h3>
                        <p className="mt-1 text-sm text-hell-muted">{roleLabel[task.role]} | مبلغ: {Number(task.price).toLocaleString('fa-IR')} تومان</p>
                        {task.deadlineAt && (
                          <p className="text-xs text-hell-muted">ددلاین: {new Date(task.deadlineAt).toLocaleString('fa-IR')}</p>
                        )}
                      </div>
                      <span className="rounded-md bg-hell-purple/40 px-2 py-1 text-xs text-hell-light">{task.status}</span>
                    </div>

                    {/* Download files */}
                    <div className="flex flex-wrap gap-2">
                      {task.englishFileUrl && <a href={mediaUrl(task.englishFileUrl)} target="_blank" rel="noreferrer" className="rounded-md border border-hell-border bg-hell-card px-3 py-1.5 text-xs hover:bg-hell-purple/20">📄 فایل انگلیسی</a>}
                      {task.translationFileUrl && <a href={mediaUrl(task.translationFileUrl)} target="_blank" rel="noreferrer" className="rounded-md border border-hell-border bg-hell-card px-3 py-1.5 text-xs hover:bg-hell-purple/20">📝 ترجمه</a>}
                      {task.cleanedFileUrl && <a href={mediaUrl(task.cleanedFileUrl)} target="_blank" rel="noreferrer" className="rounded-md border border-hell-border bg-hell-card px-3 py-1.5 text-xs hover:bg-hell-purple/20">🧹 کلین</a>}
                      {task.extraFileUrl && <a href={mediaUrl(task.extraFileUrl)} target="_blank" rel="noreferrer" className="rounded-md border border-hell-border bg-hell-card px-3 py-1.5 text-xs hover:bg-hell-purple/20">📎 اضافی</a>}
                    </div>

                    {/* Submit */}
                    {task.status === 'ASSIGNED' && (
                      <div className="flex items-end gap-3">
                        <input type="file" onChange={(e) => setTaskFiles((p) => ({ ...p, [task.id]: e.target.files?.[0] || null }))} className="flex-1 rounded-lg border border-dashed border-hell-border bg-hell-bg px-4 py-3 text-sm" />
                        <button onClick={() => submitTask(task.id)} className="rounded-lg bg-hell-violet px-4 py-2.5 text-sm font-bold hover:bg-hell-violet2">ارسال</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </section>

            <aside className="space-y-4">
              <div className="card p-5">
                <h3 className="font-bold">گپ تیم ترجمه</h3>
                <p className="mt-2 text-sm text-hell-muted">گپ اختصاصی اعضای تیم برای هماهنگی.</p>
                <a href="/chat?room=team" className="mt-4 block rounded-lg bg-hell-violet py-2 text-center text-sm font-bold hover:bg-hell-violet2">
                  ورود به گپ تیم
                </a>
              </div>
            </aside>
          </div>
        )}
      </div>
    </AppShell>
  );
}
'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { apiRequest, mediaUrl } from '../../lib/team-api';

type TeamRole = 'TRANSLATOR' | 'TYPESETTER' | 'CLEANER';

type TestFile = {
  id: string;
  role: TeamRole;
  title: string;
  fileUrl: string;
};

type TeamMe = {
  id?: string;
  status?: string;
  requestedRole?: TeamRole;
  phone?: string | null;
  telegramId?: string | null;
  cardNumber?: string | null;
  walletBalance?: number;
  rejectionReason?: string | null;
};

type TeamTask = {
  id: string;
  title: string;
  mangaName: string;
  role: TeamRole;
  chapterNumber: string;
  price: number;
  deadlineAt?: string | null;
  status: string;
  sourceFileUrl?: string | null;
  translationFileUrl?: string | null;
  cleanedFileUrl?: string | null;
  englishFileUrl?: string | null;
};

const roleLabel: Record<TeamRole, string> = {
  TRANSLATOR: 'مترجم',
  TYPESETTER: 'تایپیست',
  CLEANER: 'کلینر',
};

const statusLabel: Record<string, string> = {
  PENDING_TEST: 'در انتظار بررسی تست',
  TEST_APPROVED: 'تست تایید شده، تکمیل اطلاعات لازم است',
  PROFILE_PENDING: 'در انتظار تایید نهایی اطلاعات',
  ACTIVE: 'عضو فعال تیم ترجمه',
  REJECTED: 'رد شده',
};

export default function TeamPortal() {
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

  const isActive = me?.status === 'ACTIVE';
  const needsProfile = me?.status === 'TEST_APPROVED';

  const selectedTest = useMemo(() => {
    return tests.find((item) => item.role === requestedRole);
  }, [tests, requestedRole]);

  async function load() {
    setLoading(true);
    setMessage('');
    try {
      const [meData, testData] = await Promise.all([
        apiRequest<TeamMe | null>('/team/me').catch(() => null),
        apiRequest<TestFile[]>('/team/test-files').catch(() => []),
      ]);
      setMe(meData);
      setTests(testData);

      if (meData?.status === 'ACTIVE') {
        const taskData = await apiRequest<TeamTask[]>('/team/tasks').catch(() => []);
        setTasks(taskData);
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'خطا در دریافت اطلاعات');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function submitApply(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!testFile) {
      setMessage('لطفاً فایل تست انجام‌شده را آپلود کن.');
      return;
    }

    const form = new FormData();
    form.append('requestedRole', requestedRole);
    form.append('description', description);
    form.append('testFile', testFile);

    try {
      setMessage('');
      await apiRequest('/team/apply', { method: 'POST', body: form });
      setMessage('درخواستت ثبت شد. حالا منتظر بررسی ادمین باش.');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'ثبت درخواست ناموفق بود');
    }
  }

  async function submitProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setMessage('');
      await apiRequest('/team/profile', {
        method: 'POST',
        body: { phone, telegramId, cardNumber },
      });
      setMessage('اطلاعاتت ثبت شد. منتظر تایید نهایی ادمین باش.');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'ثبت اطلاعات ناموفق بود');
    }
  }

  async function submitTask(taskId: string) {
    const file = taskFiles[taskId];
    if (!file) {
      setMessage('برای ارسال کار باید فایل خروجی را انتخاب کنی.');
      return;
    }

    const form = new FormData();
    form.append('file', file);

    try {
      setMessage('');
      await apiRequest(`/team/tasks/${taskId}/submit`, { method: 'POST', body: form });
      setMessage('کار ارسال شد. بعد از تایید ادمین مبلغ به کیف پولت اضافه میشه.');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'ارسال کار ناموفق بود');
    }
  }

  function onTaskFile(taskId: string, e: ChangeEvent<HTMLInputElement>) {
    setTaskFiles((prev) => ({ ...prev, [taskId]: e.target.files?.[0] || null }));
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white p-6">
        <div className="mx-auto max-w-5xl animate-pulse rounded-3xl border border-purple-900/40 bg-zinc-950 p-8">
          در حال بارگذاری بخش تیم...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#2e1065_0%,#050505_45%,#000_100%)] px-4 py-8 text-white">
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-purple-800/40 bg-black/55 p-6 shadow-2xl shadow-purple-950/30 backdrop-blur">
          <p className="text-sm text-purple-300">Hell Manhwa Team</p>
          <h1 className="mt-2 text-3xl font-black">درخواست عضویت و پنل تیم ترجمه</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300">
            اینجا می‌تونی تست نقش موردنظرت رو دانلود کنی، فایل انجام‌شده رو بفرستی و بعد از تایید دو مرحله‌ای وارد پنل اعضای تیم بشی.
          </p>
        </div>

        {message && (
          <div className="rounded-2xl border border-purple-700/50 bg-purple-950/40 px-4 py-3 text-sm text-purple-100">
            {message}
          </div>
        )}

        {me?.status && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-zinc-400">وضعیت درخواست</p>
                <h2 className="mt-1 text-xl font-bold text-purple-200">{statusLabel[me.status] || me.status}</h2>
                {me.requestedRole && <p className="mt-1 text-sm text-zinc-400">نقش: {roleLabel[me.requestedRole]}</p>}
                {me.rejectionReason && <p className="mt-2 text-sm text-red-300">دلیل رد: {me.rejectionReason}</p>}
              </div>
              <div className="rounded-2xl bg-purple-950/40 px-5 py-3 text-center">
                <p className="text-xs text-zinc-400">موجودی کیف پول</p>
                <p className="text-2xl font-black text-purple-200">{Number(me.walletBalance || 0).toLocaleString('fa-IR')} تومان</p>
              </div>
            </div>
          </div>
        )}

        {!me?.status || me.status === 'REJECTED' ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <form onSubmit={submitApply} className="rounded-3xl border border-zinc-800 bg-zinc-950/85 p-6">
              <h2 className="text-xl font-bold">فرم درخواست عضویت</h2>

              <div className="mt-5 grid gap-4">
                <label className="grid gap-2 text-sm">
                  نقش مورد نظر
                  <select
                    value={requestedRole}
                    onChange={(e) => setRequestedRole(e.target.value as TeamRole)}
                    className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none focus:border-purple-600"
                  >
                    <option value="TRANSLATOR">مترجم</option>
                    <option value="TYPESETTER">تایپیست</option>
                    <option value="CLEANER">کلینر</option>
                  </select>
                </label>

                <label className="grid gap-2 text-sm">
                  توضیحات و سابقه
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none focus:border-purple-600"
                    placeholder="مثلاً سابقه ترجمه، نمونه کار، زمان آزاد و..."
                  />
                </label>

                <label className="grid gap-2 text-sm">
                  آپلود فایل تست انجام‌شده
                  <input
                    type="file"
                    onChange={(e) => setTestFile(e.target.files?.[0] || null)}
                    className="rounded-2xl border border-dashed border-purple-800 bg-black px-4 py-6 text-sm"
                    required
                  />
                </label>

                <button className="rounded-2xl bg-purple-700 px-5 py-3 font-bold transition hover:bg-purple-600">
                  ارسال درخواست
                </button>
              </div>
            </form>

            <aside className="rounded-3xl border border-purple-900/50 bg-purple-950/25 p-6">
              <h3 className="text-lg font-bold">دانلود فایل تست</h3>
              <p className="mt-2 text-sm leading-7 text-zinc-300">
                اول فایل تست مربوط به نقشت رو دانلود کن، انجام بده، بعد همینجا خروجی رو آپلود کن.
              </p>

              {selectedTest ? (
                <a
                  href={mediaUrl(selectedTest.fileUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 block rounded-2xl bg-white px-5 py-3 text-center font-bold text-black transition hover:bg-purple-100"
                >
                  دانلود تست {roleLabel[selectedTest.role]}
                </a>
              ) : (
                <p className="mt-5 rounded-2xl bg-black/50 p-4 text-sm text-zinc-400">
                  هنوز فایل تست برای این نقش توسط ادمین آپلود نشده.
                </p>
              )}
            </aside>
          </div>
        ) : null}

        {needsProfile && (
          <form onSubmit={submitProfile} className="rounded-3xl border border-zinc-800 bg-zinc-950/85 p-6">
            <h2 className="text-xl font-bold">تکمیل اطلاعات برای تایید نهایی</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="شماره تلفن"
                className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 outline-none focus:border-purple-600"
                required
              />
              <input
                value={telegramId}
                onChange={(e) => setTelegramId(e.target.value)}
                placeholder="آیدی تلگرام"
                className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 outline-none focus:border-purple-600"
                required
              />
              <input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="شماره کارت"
                className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 outline-none focus:border-purple-600"
                required
              />
            </div>
            <button className="mt-5 rounded-2xl bg-purple-700 px-5 py-3 font-bold hover:bg-purple-600">
              ثبت اطلاعات
            </button>
          </form>
        )}

        {isActive && (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <section className="rounded-3xl border border-zinc-800 bg-zinc-950/85 p-6">
              <h2 className="text-xl font-bold">چپترها و کارهای ارسال‌شده توسط ادمین</h2>

              <div className="mt-5 space-y-4">
                {tasks.length === 0 ? (
                  <p className="rounded-2xl bg-black/50 p-5 text-sm text-zinc-400">فعلاً کاری برای تو ثبت نشده.</p>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="rounded-3xl border border-zinc-800 bg-black/70 p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <h3 className="text-lg font-bold">{task.title}</h3>
                          <p className="mt-1 text-sm text-zinc-400">
                            {task.mangaName} | چپتر {task.chapterNumber} | {roleLabel[task.role]}
                          </p>
                          <p className="mt-2 text-sm text-purple-300">
                            مبلغ: {Number(task.price).toLocaleString('fa-IR')} تومان
                          </p>
                          {task.deadlineAt && (
                            <p className="mt-1 text-xs text-zinc-500">
                              ددلاین: {new Date(task.deadlineAt).toLocaleString('fa-IR')}
                            </p>
                          )}
                        </div>
                        <span className="rounded-full bg-purple-950 px-4 py-2 text-xs text-purple-200">{task.status}</span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {task.sourceFileUrl && <a className="rounded-xl bg-zinc-900 px-3 py-2 text-xs hover:bg-zinc-800" href={mediaUrl(task.sourceFileUrl)} target="_blank">فایل اصلی</a>}
                        {task.translationFileUrl && <a className="rounded-xl bg-zinc-900 px-3 py-2 text-xs hover:bg-zinc-800" href={mediaUrl(task.translationFileUrl)} target="_blank">فایل ترجمه</a>}
                        {task.cleanedFileUrl && <a className="rounded-xl bg-zinc-900 px-3 py-2 text-xs hover:bg-zinc-800" href={mediaUrl(task.cleanedFileUrl)} target="_blank">فایل کلین</a>}
                        {task.englishFileUrl && <a className="rounded-xl bg-zinc-900 px-3 py-2 text-xs hover:bg-zinc-800" href={mediaUrl(task.englishFileUrl)} target="_blank">فایل انگلیسی</a>}
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                        <input
                          type="file"
                          onChange={(e) => onTaskFile(task.id, e)}
                          className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950 px-4 py-3 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => submitTask(task.id)}
                          className="rounded-2xl bg-purple-700 px-5 py-3 font-bold hover:bg-purple-600"
                        >
                          ارسال کار
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <aside className="rounded-3xl border border-purple-900/50 bg-purple-950/25 p-6">
              <h3 className="text-lg font-bold">گپ اعضای تیم</h3>
              <p className="mt-2 text-sm leading-7 text-zinc-300">
                چون عضویتت فعاله، گپ اختصاصی تیم باید برات فعال باشه.
              </p>
              <a
                href="/chat?room=team"
                className="mt-5 block rounded-2xl bg-purple-700 px-5 py-3 text-center font-bold hover:bg-purple-600"
              >
                ورود به گپ تیم
              </a>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

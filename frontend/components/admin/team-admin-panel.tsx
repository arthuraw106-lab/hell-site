'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { apiRequest, mediaUrl } from '../../lib/team-api';

type TeamRole = 'TRANSLATOR' | 'TYPESETTER' | 'CLEANER';

type RequestItem = {
  id: string;
  requestedRole: TeamRole;
  status: string;
  description?: string | null;
  testFileUrl?: string | null;
  user?: { id: string; username?: string | null; email?: string | null };
  phone?: string | null;
  telegramId?: string | null;
  cardNumber?: string | null;
};

type MemberItem = {
  id: string;
  role: TeamRole;
  walletBalance: number;
  user?: { id: string; username?: string | null; email?: string | null };
  phone?: string | null;
  telegramId?: string | null;
  cardNumber?: string | null;
};

const roleLabel: Record<TeamRole, string> = {
  TRANSLATOR: 'مترجم',
  TYPESETTER: 'تایپیست',
  CLEANER: 'کلینر',
};

export default function TeamAdminPanel() {
  const [tab, setTab] = useState<'requests' | 'members' | 'tasks' | 'tests'>('requests');
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [message, setMessage] = useState('');

  const [testRole, setTestRole] = useState<TeamRole>('TRANSLATOR');
  const [testTitle, setTestTitle] = useState('');
  const [testFile, setTestFile] = useState<File | null>(null);

  const [taskMemberId, setTaskMemberId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskMangaName, setTaskMangaName] = useState('');
  const [taskChapter, setTaskChapter] = useState('');
  const [taskPrice, setTaskPrice] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [translationFile, setTranslationFile] = useState<File | null>(null);
  const [cleanedFile, setCleanedFile] = useState<File | null>(null);
  const [englishFile, setEnglishFile] = useState<File | null>(null);

  async function load() {
    try {
      const [reqData, memData] = await Promise.all([
        apiRequest<RequestItem[]>('/admin/team/requests').catch(() => []),
        apiRequest<MemberItem[]>('/admin/team/members').catch(() => []),
      ]);
      setRequests(reqData);
      setMembers(memData);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'خطا در دریافت اطلاعات');
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function action(path: string, success: string, body?: Record<string, unknown>) {
    try {
      setMessage('');
      await apiRequest(path, { method: 'POST', body: body || {} });
      setMessage(success);
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'عملیات ناموفق بود');
    }
  }

  async function uploadTest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!testFile) {
      setMessage('فایل تست را انتخاب کن.');
      return;
    }

    const form = new FormData();
    form.append('role', testRole);
    form.append('title', testTitle);
    form.append('file', testFile);

    try {
      setMessage('');
      await apiRequest('/admin/team/test-files', { method: 'POST', body: form });
      setMessage('فایل تست آپلود شد.');
      setTestTitle('');
      setTestFile(null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'آپلود فایل تست ناموفق بود');
    }
  }

  async function createTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!taskMemberId || !sourceFile) {
      setMessage('عضو تیم و فایل اصلی الزامی است.');
      return;
    }

    const form = new FormData();
    form.append('memberId', taskMemberId);
    form.append('title', taskTitle);
    form.append('mangaName', taskMangaName);
    form.append('chapterNumber', taskChapter);
    form.append('price', taskPrice);
    form.append('deadlineAt', taskDeadline);
    form.append('sourceFile', sourceFile);
    if (translationFile) form.append('translationFile', translationFile);
    if (cleanedFile) form.append('cleanedFile', cleanedFile);
    if (englishFile) form.append('englishFile', englishFile);

    try {
      setMessage('');
      await apiRequest('/admin/team/tasks', { method: 'POST', body: form });
      setMessage('کار برای عضو تیم ایجاد شد.');
      setTaskTitle('');
      setTaskMangaName('');
      setTaskChapter('');
      setTaskPrice('');
      setTaskDeadline('');
      setSourceFile(null);
      setTranslationFile(null);
      setCleanedFile(null);
      setEnglishFile(null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'ایجاد کار ناموفق بود');
    }
  }

  function fileSetter(setter: (file: File | null) => void) {
    return (e: ChangeEvent<HTMLInputElement>) => setter(e.target.files?.[0] || null);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#2e1065_0%,#050505_45%,#000_100%)] px-4 py-8 text-white">
      <section className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-purple-800/40 bg-black/60 p-6 shadow-2xl shadow-purple-950/30 backdrop-blur">
          <p className="text-sm text-purple-300">Admin Team Management</p>
          <h1 className="mt-2 text-3xl font-black">مدیریت تیم ترجمه</h1>
        </div>

        {message && (
          <div className="rounded-2xl border border-purple-700/50 bg-purple-950/40 px-4 py-3 text-sm text-purple-100">
            {message}
          </div>
        )}

        <div className="flex flex-wrap gap-2 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-3">
          {[
            ['requests', 'درخواست‌ها'],
            ['members', 'اعضا و کیف پول'],
            ['tasks', 'ارسال کار'],
            ['tests', 'نمونه تست'],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key as typeof tab)}
              className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                tab === key ? 'bg-purple-700 text-white' : 'bg-black text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'requests' && (
          <div className="grid gap-4">
            {requests.length === 0 ? (
              <p className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 text-zinc-400">درخواستی وجود ندارد.</p>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="rounded-3xl border border-zinc-800 bg-zinc-950/85 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-lg font-bold">
                        {req.user?.username || req.user?.email || 'کاربر'} - {roleLabel[req.requestedRole]}
                      </h3>
                      <p className="mt-1 text-sm text-purple-300">{req.status}</p>
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300">{req.description || 'بدون توضیح'}</p>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {req.testFileUrl && (
                          <a href={mediaUrl(req.testFileUrl)} target="_blank" className="rounded-xl bg-zinc-900 px-3 py-2 hover:bg-zinc-800">
                            دانلود فایل تست کاربر
                          </a>
                        )}
                        {req.phone && <span className="rounded-xl bg-zinc-900 px-3 py-2">تلفن: {req.phone}</span>}
                        {req.telegramId && <span className="rounded-xl bg-zinc-900 px-3 py-2">تلگرام: {req.telegramId}</span>}
                        {req.cardNumber && <span className="rounded-xl bg-zinc-900 px-3 py-2">کارت: {req.cardNumber}</span>}
                      </div>
                    </div>

                    <div className="flex min-w-56 flex-col gap-2">
                      <button
                        onClick={() => action(`/admin/team/requests/${req.id}/approve-test`, 'تست کاربر تایید شد.')}
                        className="rounded-2xl bg-purple-700 px-4 py-2 text-sm font-bold hover:bg-purple-600"
                      >
                        تایید مرحله اول
                      </button>
                      <button
                        onClick={() => action(`/admin/team/requests/${req.id}/approve-final`, 'عضویت کاربر نهایی شد.')}
                        className="rounded-2xl bg-emerald-700 px-4 py-2 text-sm font-bold hover:bg-emerald-600"
                      >
                        تایید نهایی عضویت
                      </button>
                      <button
                        onClick={() => {
                          const reason = window.prompt('دلیل رد درخواست؟') || 'رد شده توسط ادمین';
                          void action(`/admin/team/requests/${req.id}/reject`, 'درخواست رد شد.', { reason });
                        }}
                        className="rounded-2xl bg-red-700 px-4 py-2 text-sm font-bold hover:bg-red-600"
                      >
                        رد درخواست
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'members' && (
          <div className="grid gap-4">
            {members.map((member) => (
              <div key={member.id} className="rounded-3xl border border-zinc-800 bg-zinc-950/85 p-5">
                <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
                  <div>
                    <h3 className="text-lg font-bold">{member.user?.username || member.user?.email || 'عضو تیم'}</h3>
                    <p className="mt-1 text-sm text-purple-300">{roleLabel[member.role]}</p>
                    <p className="mt-2 text-2xl font-black text-purple-100">
                      {Number(member.walletBalance || 0).toLocaleString('fa-IR')} تومان
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-300">
                      {member.phone && <span className="rounded-xl bg-zinc-900 px-3 py-2">تلفن: {member.phone}</span>}
                      {member.telegramId && <span className="rounded-xl bg-zinc-900 px-3 py-2">تلگرام: {member.telegramId}</span>}
                      {member.cardNumber && <span className="rounded-xl bg-zinc-900 px-3 py-2">کارت: {member.cardNumber}</span>}
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <button
                      onClick={() => {
                        const amount = Number(window.prompt('مبلغ افزایش موجودی؟') || 0);
                        if (amount) void action(`/admin/team/members/${member.id}/wallet`, 'موجودی افزایش یافت.', { amount, type: 'INCREASE' });
                      }}
                      className="rounded-2xl bg-emerald-700 px-4 py-2 text-sm font-bold hover:bg-emerald-600"
                    >
                      افزایش موجودی
                    </button>
                    <button
                      onClick={() => {
                        const amount = Number(window.prompt('مبلغ کاهش موجودی؟') || 0);
                        if (amount) void action(`/admin/team/members/${member.id}/wallet`, 'موجودی کاهش یافت.', { amount, type: 'DECREASE' });
                      }}
                      className="rounded-2xl bg-orange-700 px-4 py-2 text-sm font-bold hover:bg-orange-600"
                    >
                      کاهش موجودی
                    </button>
                    <button
                      onClick={() => {
                        const amount = Number(window.prompt('مبلغ جریمه؟') || 0);
                        const reason = window.prompt('دلیل جریمه؟') || 'تاخیر یا مشکل در انجام کار';
                        if (amount) void action(`/admin/team/members/${member.id}/penalty`, 'جریمه ثبت شد.', { amount, reason });
                      }}
                      className="rounded-2xl bg-red-700 px-4 py-2 text-sm font-bold hover:bg-red-600"
                    >
                      ثبت جریمه
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'tasks' && (
          <form onSubmit={createTask} className="rounded-3xl border border-zinc-800 bg-zinc-950/85 p-6">
            <h2 className="text-xl font-bold">ایجاد کار برای عضو تیم</h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <select
                value={taskMemberId}
                onChange={(e) => setTaskMemberId(e.target.value)}
                className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 outline-none focus:border-purple-600"
                required
              >
                <option value="">انتخاب عضو</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {(m.user?.username || m.user?.email || 'عضو') + ' - ' + roleLabel[m.role]}
                  </option>
                ))}
              </select>

              <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="عنوان کار" className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 outline-none focus:border-purple-600" required />
              <input value={taskMangaName} onChange={(e) => setTaskMangaName(e.target.value)} placeholder="نام مانهوا" className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 outline-none focus:border-purple-600" required />
              <input value={taskChapter} onChange={(e) => setTaskChapter(e.target.value)} placeholder="شماره چپتر" className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 outline-none focus:border-purple-600" required />
              <input value={taskPrice} onChange={(e) => setTaskPrice(e.target.value)} placeholder="مبلغ مثلا 15000" type="number" className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 outline-none focus:border-purple-600" required />
              <input value={taskDeadline} onChange={(e) => setTaskDeadline(e.target.value)} type="datetime-local" className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 outline-none focus:border-purple-600" />
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                فایل اصلی / انگلیسی
                <input type="file" onChange={fileSetter(setSourceFile)} className="rounded-2xl border border-dashed border-zinc-700 bg-black px-4 py-4" required />
              </label>
              <label className="grid gap-2 text-sm">
                فایل ترجمه برای تایپیست
                <input type="file" onChange={fileSetter(setTranslationFile)} className="rounded-2xl border border-dashed border-zinc-700 bg-black px-4 py-4" />
              </label>
              <label className="grid gap-2 text-sm">
                فایل کلین‌شده برای تایپیست
                <input type="file" onChange={fileSetter(setCleanedFile)} className="rounded-2xl border border-dashed border-zinc-700 bg-black px-4 py-4" />
              </label>
              <label className="grid gap-2 text-sm">
                فایل انگلیسی اضافه
                <input type="file" onChange={fileSetter(setEnglishFile)} className="rounded-2xl border border-dashed border-zinc-700 bg-black px-4 py-4" />
              </label>
            </div>

            <button className="mt-5 rounded-2xl bg-purple-700 px-5 py-3 font-bold hover:bg-purple-600">
              ایجاد کار
            </button>
          </form>
        )}

        {tab === 'tests' && (
          <form onSubmit={uploadTest} className="rounded-3xl border border-zinc-800 bg-zinc-950/85 p-6">
            <h2 className="text-xl font-bold">آپلود نمونه تست برای نقش‌ها</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <select value={testRole} onChange={(e) => setTestRole(e.target.value as TeamRole)} className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 outline-none focus:border-purple-600">
                <option value="TRANSLATOR">مترجم</option>
                <option value="TYPESETTER">تایپیست</option>
                <option value="CLEANER">کلینر</option>
              </select>
              <input value={testTitle} onChange={(e) => setTestTitle(e.target.value)} placeholder="عنوان تست" className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 outline-none focus:border-purple-600" required />
              <input type="file" onChange={fileSetter(setTestFile)} className="rounded-2xl border border-dashed border-zinc-700 bg-black px-4 py-3" required />
            </div>
            <button className="mt-5 rounded-2xl bg-purple-700 px-5 py-3 font-bold hover:bg-purple-600">
              آپلود تست
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

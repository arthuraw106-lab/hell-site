'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type PollProject = {
 id: string;
 title: string;
 description?: string | null;
 cover?: string | null;
 active: boolean;
 voteCount?: number;
 createdAt?: string;
};

type ProjectForm = {
 title: string;
 description: string;
 cover: string;
 active: boolean;
};

const initialForm: ProjectForm = {
 title: '',
 description: '',
 cover: '',
 active: true,
};

function getApiBaseUrl() {
 return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
}

function getAccessToken() {
 if (typeof window === 'undefined') return '';
 return (
 localStorage.getItem('accessToken') ||
 localStorage.getItem('hell_access_token') ||
 localStorage.getItem('token') ||
 ''
 );
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
 const token = getAccessToken();

 const response = await fetch(`${getApiBaseUrl()}${path}`, {
 ...options,
 headers: {
 'Content-Type': 'application/json',
 ...(token ? { Authorization: `Bearer ${token}` } : {}),
 ...(options.headers || {}),
 },
 cache: 'no-store',
 });

 const data = await response.json().catch(() => null);

 if (!response.ok) {
 throw new Error(data?.message || data?.error || 'درخواست ناموفق بود.');
 }

 return data;
}

export default function PollProjectsAdminCard() {
 const [projects, setProjects] = useState<PollProject[]>([]);
 const [form, setForm] = useState<ProjectForm>(initialForm);
 const [editingId, setEditingId] = useState<string | null>(null);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);

 const sortedProjects = useMemo(() => {
 return [...projects].sort((a, b) => {
 if (a.active !== b.active) return a.active ? -1 : 1;
 return (b.voteCount || 0) - (a.voteCount || 0);
 });
 }, [projects]);

 async function loadProjects() {
 setLoading(true);
 try {
 const data = await apiRequest<PollProject[]>('/api/admin/poll-projects');
 setProjects(Array.isArray(data) ? data : []);
 } finally {
 setLoading(false);
 }
 }

 useEffect(() => {
 loadProjects().catch((error) => {
 console.error(error);
 setLoading(false);
 });
 }, []);

 function startEdit(project: PollProject) {
 setEditingId(project.id);
 setForm({
 title: project.title || '',
 description: project.description || '',
 cover: project.cover || '',
 active: project.active,
 });
 }

 function resetForm() {
 setEditingId(null);
 setForm(initialForm);
 }

 async function submitForm(event: FormEvent<HTMLFormElement>) {
 event.preventDefault();

 if (!form.title.trim()) {
 alert('عنوان پروژه را وارد کن.');
 return;
 }

 setSaving(true);
 try {
 const payload = {
 title: form.title.trim(),
 description: form.description.trim() || undefined,
 cover: form.cover.trim() || undefined,
 active: form.active,
 };

 if (editingId) {
 await apiRequest(`/api/admin/poll-projects/${editingId}`, {
 method: 'PATCH',
 body: JSON.stringify(payload),
 });
 } else {
 await apiRequest('/api/admin/poll-projects', {
 method: 'POST',
 body: JSON.stringify(payload),
 });
 }

 resetForm();
 await loadProjects();
 } catch (error) {
 alert(error instanceof Error ? error.message : 'خطا در ذخیره پروژه');
 } finally {
 setSaving(false);
 }
 }

 async function toggleActive(project: PollProject) {
 try {
 await apiRequest(`/api/admin/poll-projects/${project.id}`, {
 method: 'PATCH',
 body: JSON.stringify({ active: !project.active }),
 });
 await loadProjects();
 } catch (error) {
 alert(error instanceof Error ? error.message : 'خطا در تغییر وضعیت');
 }
 }

 async function removeProject(project: PollProject) {
 const ok = confirm(`پروژه «${project.title}» حذف شود؟`);
 if (!ok) return;

 try {
 await apiRequest(`/api/admin/poll-projects/${project.id}`, {
 method: 'DELETE',
 });
 await loadProjects();
 } catch (error) {
 alert(error instanceof Error ? error.message : 'خطا در حذف پروژه');
 }
 }

 return (
 <section className="rounded-3xl border border-purple-500/15 bg-black/40 p-5 shadow-2xl shadow-purple-950/20 ">
 <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h2 className="text-xl font-black text-white">پروژه‌های پیشنهادی ترجمه</h2>
 <p className="mt-1 text-sm text-zinc-400">
 پروژه‌هایی که کاربران می‌توانند بهشان رأی بدهند را اینجا مدیریت کن.
 </p>
 </div>

 <button
 type="button"
 onClick={loadProjects}
 className="rounded-2xl border border-purple-500/30 bg-purple-950/40 px-4 py-2 text-sm font-bold text-purple-100 transition hover:bg-purple-900/50"
 >
 بروزرسانی
 </button>
 </div>

 <form onSubmit={submitForm} className="mb-6 grid gap-3 rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
 <div className="grid gap-3 md:grid-cols-2">
 <input
 value={form.title}
 onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
 placeholder="عنوان مانهوا / پروژه"
 className="rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-purple-500"
 />

 <input
 value={form.cover}
 onChange={(event) => setForm((prev) => ({ ...prev, cover: event.target.value }))}
 placeholder="لینک کاور اختیاری"
 className="rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-purple-500"
 />
 </div>

 <textarea
 value={form.description}
 onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
 placeholder="توضیح کوتاه درباره پروژه..."
 rows={3}
 className="resize-none rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-purple-500"
 />

 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
 <label className="flex items-center gap-2 text-sm text-zinc-300">
 <input
 type="checkbox"
 checked={form.active}
 onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.checked }))}
 className="h-4 w-4 accent-purple-600"
 />
 فعال باشد و برای کاربران نمایش داده شود
 </label>

 <div className="flex gap-2">
 {editingId ? (
 <button
 type="button"
 onClick={resetForm}
 className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:bg-white/10"
 >
 انصراف
 </button>
 ) : null}

 <button
 type="submit"
 disabled={saving}
 className="rounded-2xl bg-purple-700 px-5 py-2 text-sm font-black text-white transition hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-60"
 >
 {saving ? 'در حال ذخیره...' : editingId ? 'ذخیره تغییرات' : 'افزودن پروژه'}
 </button>
 </div>
 </div>
 </form>

 {loading ? (
 <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 text-center text-sm text-zinc-400">
 در حال دریافت پروژه‌ها...
 </div>
 ) : sortedProjects.length === 0 ? (
 <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-5 text-center text-sm text-zinc-400">
 هنوز پروژه پیشنهادی ثبت نشده.
 </div>
 ) : (
 <div className="grid gap-3">
 {sortedProjects.map((project) => (
 <article
 key={project.id}
 className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-950/70 p-4 sm:flex-row sm:items-center"
 >
 <div className="h-24 w-full overflow-hidden rounded-2xl bg-purple-950/40 sm:w-20">
 {project.cover ? (
 <img
 src={project.cover}
 alt={project.title}
 className="h-full w-full object-cover"
 />
 ) : (
 <div className="flex h-full w-full items-center justify-center text-2xl">💜</div>
 )}
 </div>

 <div className="min-w-0 flex-1">
 <div className="flex flex-wrap items-center gap-2">
 <h3 className="truncate font-black text-white">{project.title}</h3>
 <span className={`rounded-full px-2 py-1 text-xs font-bold ${
 project.active
 ? 'bg-emerald-500/15 text-emerald-300'
 : 'bg-zinc-700/40 text-zinc-400'
 }`}>
 {project.active ? 'فعال' : 'غیرفعال'}
 </span>
 </div>

 {project.description ? (
 <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{project.description}</p>
 ) : null}

 <p className="mt-2 text-xs font-bold text-purple-300">
 رأی کاربران: {project.voteCount || 0}
 </p>
 </div>

 <div className="flex flex-wrap gap-2">
 <button
 type="button"
 onClick={() => startEdit(project)}
 className="rounded-xl border border-sky-500/30 bg-sky-950/30 px-3 py-2 text-xs font-bold text-sky-200 transition hover:bg-sky-900/40"
 >
 ویرایش
 </button>

 <button
 type="button"
 onClick={() => toggleActive(project)}
 className="rounded-xl border border-purple-500/30 bg-purple-950/30 px-3 py-2 text-xs font-bold text-purple-200 transition hover:bg-purple-900/40"
 >
 {project.active ? 'غیرفعال' : 'فعال'}
 </button>

 <button
 type="button"
 onClick={() => removeProject(project)}
 className="rounded-xl border border-red-500/30 bg-red-950/30 px-3 py-2 text-xs font-bold text-red-200 transition hover:bg-red-900/40"
 >
 حذف
 </button>
 </div>
 </article>
 ))}
 </div>
 )}
 </section>
 );
}

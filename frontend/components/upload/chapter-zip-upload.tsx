'use client';

import { Archive, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useToastStore } from '@/store/toast-store';

type ChapterZipResult = {
 zipUrl: string;
 pages: string[];
 totalPages: number;
 files: {
 fileName: string;
 url: string;
 key: string;
 index: number;
 }[];
};

export function ChapterZipUpload({
 onExtracted,
}: {
 onExtracted: (result: ChapterZipResult) => void;
}) {
 const [loading, setLoading] = useState(false);
 const [lastCount, setLastCount] = useState<number | null>(null);
 const showToast = useToastStore((state) => state.showToast);

 async function upload(file?: File) {
 if (!file) return;

 if (!file.name.toLowerCase().endsWith('.zip')) {
 showToast({
 type: 'warning',
 title: 'فایل نامعتبر',
 message: 'فقط فایل ZIP انتخاب کن.',
 });
 return;
 }

 setLoading(true);
 setLastCount(null);

 try {
 const formData = new FormData();
 formData.append('file', file);

 const response = await api.post('/upload/chapter-zip', formData, {
 headers: {
 'Content-Type': 'multipart/form-data',
 },
 timeout: 240000,
 });

 const result = response.data.data as ChapterZipResult;

 setLastCount(result.totalPages);

 showToast({
 type: 'success',
 title: 'ZIP استخراج شد',
 message: `${result.totalPages} صفحه با موفقیت آماده شد.`,
 });

 onExtracted(result);
 } catch (error) {
 showToast({
 type: 'error',
 title: 'خطا در استخراج ZIP',
 message: error instanceof Error ? error.message : 'آپلود ZIP ناموفق بود.',
 });
 } finally {
 setLoading(false);
 }
 }

 return (
 <div className="rounded-2xl border border-dashed border-hell-light/30 bg-hell-light/10 p-4 transition hover:bg-hell-light/15">
 <label className="flex cursor-pointer flex-col items-center justify-center gap-3 text-center">
 {loading ? <Loader2 className="animate-spin text-hell-light" /> : <Archive className="text-hell-light" />}
 <span className="font-bold">
 {loading ? 'در حال آپلود و استخراج...' : 'آپلود ZIP چپتر'}
 </span>
 <span className="text-xs leading-6 text-white/45">
 تصاویر داخل ZIP با ترتیب اسم فایل مرتب می‌شوند؛ مثل 001.jpg، 002.jpg
 </span>
 <input
 type="file"
 accept=".zip,application/zip,application/x-zip-compressed"
 className="hidden"
 disabled={loading}
 onChange={(event) => upload(event.target.files?.[0])}
 />
 </label>

 {lastCount !== null ? (
 <p className="mt-3 text-center text-sm font-bold text-hell-light">
 {lastCount} صفحه آماده شد
 </p>
 ) : null}
 </div>
 );
}

'use client';

import { UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useToastStore } from '@/store/toast-store';

type UploadResult = {
 id: string;
 url: string;
 key: string;
 mimeType: string;
 size: number;
};

export function UploadBox({
 onUploaded,
 label = 'آپلود فایل',
}: {
 onUploaded?: (upload: UploadResult) => void;
 label?: string;
}) {
 const [loading, setLoading] = useState(false);
 const showToast = useToastStore((state) => state.showToast);

 async function upload(file?: File) {
 if (!file) return;

 setLoading(true);

 try {
 const formData = new FormData();
 formData.append('file', file);

 const response = await api.post('/upload', formData, {
 headers: {
 'Content-Type': 'multipart/form-data',
 },
 timeout: 120000,
 });

 const uploadResult = response.data.data as UploadResult;

 showToast({
 type: 'success',
 title: 'آپلود موفق',
 message: file.name,
 });

 onUploaded?.(uploadResult);
 } catch (error) {
 showToast({
 type: 'error',
 title: 'خطا در آپلود',
 message: error instanceof Error ? error.message : 'فایل آپلود نشد.',
 });
 } finally {
 setLoading(false);
 }
 }

 return (
 <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.04] p-4 transition hover:border-hell-light/35 hover:bg-white/[0.06]">
 <label className="flex cursor-pointer flex-col items-center justify-center gap-3 text-center">
 <UploadCloud className={loading ? 'animate-bounce text-hell-light' : 'text-hell-light'} />
 <span className="font-bold">{loading ? 'در حال آپلود...' : label}</span>
 <span className="text-xs text-white/45">عکس، ویس، PDF یا ZIP</span>
 <input
 type="file"
 className="hidden"
 disabled={loading}
 onChange={(event) => upload(event.target.files?.[0])}
 />
 </label>
 </div>
 );
}

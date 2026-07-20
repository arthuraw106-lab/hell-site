'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Film, Send, X } from 'lucide-react';
import { useState } from 'react';
import { apiPost } from '@/lib/api';
import { useToastStore } from '@/store/toast-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UploadBox } from '@/components/upload/upload-box';

export function CreateStoryCard() {
 const queryClient = useQueryClient();
 const showToast = useToastStore((state) => state.showToast);

 const [open, setOpen] = useState(false);
 const [text, setText] = useState('');
 const [mediaUrl, setMediaUrl] = useState('');

 const mutation = useMutation({
 mutationFn: () =>
 apiPost('/stories', {
 text: text || undefined,
 mediaUrl: mediaUrl || undefined,
 }),
 onSuccess: async () => {
 setText('');
 setMediaUrl('');
 setOpen(false);

 showToast({
 type: 'success',
 title: 'استوری منتشر شد',
 message: 'استوری تا ۲۴ ساعت برای کاربران نمایش داده می‌شود.',
 });

 await queryClient.invalidateQueries({ queryKey: ['stories'] });
 },
 onError: (error) => {
 showToast({
 type: 'error',
 title: 'خطا در ساخت استوری',
 message: error instanceof Error ? error.message : 'استوری ثبت نشد.',
 });
 },
 });

 if (!open) {
 return (
 <button
 type="button"
 onClick={() => setOpen(true)}
 className="group relative grid min-h-36 min-w-28 place-items-center overflow-hidden rounded-[2rem] border border-dashed border-hell-violet/45 bg-hell-violet/10 p-3 text-center transition hover:bg-hell-violet/18"
 >
 <div className="absolute inset-0 bg-gradient-to-br from-hell-violet/20 to-transparent opacity-0 transition group-hover:opacity-100" />
 <div className="relative z-10">
 <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-hell-violet to-hell-violet transition group-hover:scale-110">
 <Film />
 </div>
 <span className="mt-3 block text-xs font-black text-white/70">استوری ویدئویی</span>
 </div>
 </button>
 );
 }

 return (
 <div className="min-w-[320px] rounded-[2rem] border border-white/10 bg-white/[0.055] p-4">
 <div className="mb-3 flex items-center justify-between gap-3">
 <strong>استوری جدید</strong>
 <button
 type="button"
 onClick={() => setOpen(false)}
 className="rounded-xl bg-white/10 p-2 text-white/50 hover:text-white"
 >
 <X size={16} />
 </button>
 </div>

 <div className="grid gap-3">
 <UploadBox
 label="آپلود ویدیو / عکس استوری"
 onUploaded={(upload) => setMediaUrl(upload.url)}
 />

 {mediaUrl ? (
 <div className="overflow-hidden rounded-2xl bg-black">
 {mediaUrl.match(/\.(mp4|webm|mov|mkv|avi)(\?.*)?$/i) ? (
 <video src={mediaUrl} className="h-40 w-full object-cover" controls />
 ) : (
 <img src={mediaUrl} alt="story preview" className="h-40 w-full object-cover" />
 )}
 </div>
 ) : null}

 <Textarea
 value={text}
 onChange={(event) => setText(event.target.value)}
 placeholder="متن کوتاه، اختیاری"
 className="min-h-24"
 />

 <Button
 disabled={mutation.isPending || (!mediaUrl && !text.trim())}
 onClick={() => mutation.mutate()}
 >
 <Send size={16} />
 <span className="mr-2">انتشار ۲۴ ساعته</span>
 </Button>
 </div>
 </div>
 );
}

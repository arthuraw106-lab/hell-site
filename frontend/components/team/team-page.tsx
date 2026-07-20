'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Send, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UploadBox } from '@/components/upload/upload-box';
import { apiGet, apiPost } from '@/lib/api';

type TeamInfo = {
 title: string;
 description: string;
 roles: string[];
};

export function TeamPage() {
 const [skills, setSkills] = useState('');
 const [experience, setExperience] = useState('');
 const [sampleUrl, setSampleUrl] = useState('');
 const [message, setMessage] = useState('');

 const { data } = useQuery({
 queryKey: ['team-info'],
 queryFn: () => apiGet<TeamInfo>('/team'),
 });

 const mutation = useMutation({
 mutationFn: () =>
 apiPost('/team/request', {
 skills,
 experience,
 sampleUrl: sampleUrl || undefined,
 }),
 onSuccess: () => {
 setSkills('');
 setExperience('');
 setSampleUrl('');
 setMessage('درخواستت ثبت شد. ادمین بررسی می‌کنه.');
 },
 onError: (error) => {
 setMessage(error instanceof Error ? error.message : 'خطا در ثبت درخواست');
 },
 });

 return (
 <AppShell>
 <main className="mx-auto max-w-7xl px-5 py-10">
 <section className="grid gap-6 lg:grid-cols-[1fr_420px]">
 <Card className="p-7">
 <div className="mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-hell-violet ">
 <UsersRound />
 </div>
 <h1 className="text-4xl font-black">{data?.title || 'تیم ترجمه هل مانهوا'}</h1>
 <p className="mt-5 max-w-3xl leading-8 text-white/60">
 {data?.description ||
 'اگر مترجم، ادیتور، تایپیست یا کلینر هستی، می‌تونی درخواست عضویت بدی.'}
 </p>

 <div className="mt-8 flex flex-wrap gap-3">
 {(data?.roles || ['translator', 'editor', 'cleaner', 'typesetter']).map((role) => (
 <span key={role} className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/70">
 {role}
 </span>
 ))}
 </div>
 </Card>

 <Card className="p-6">
 <h2 className="mb-4 text-2xl font-black">فرم درخواست عضویت</h2>

 <div className="grid gap-4">
 <Textarea
 value={skills}
 onChange={(event) => setSkills(event.target.value)}
 placeholder="مهارت‌ها: ترجمه، ادیت، کلین، تایپ‌ست..."
 />
 <Textarea
 value={experience}
 onChange={(event) => setExperience(event.target.value)}
 placeholder="تجربه قبلی و توضیحات"
 />
 <Input
 value={sampleUrl}
 onChange={(event) => setSampleUrl(event.target.value)}
 placeholder="لینک نمونه کار"
 />

 <UploadBox
 label="آپلود نمونه کار"
 onUploaded={(upload) => setSampleUrl(upload.url)}
 />

 {message ? <div className="rounded-2xl bg-white/10 p-3 text-sm text-white/65">{message}</div> : null}

 <Button
 disabled={mutation.isPending || !skills.trim() || !experience.trim()}
 onClick={() => mutation.mutate()}
 >
 <Send size={16} />
 <span className="mr-2">ارسال درخواست</span>
 </Button>
 </div>
 </Card>
 </section>
 </main>
 </AppShell>
 );
}

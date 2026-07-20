'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LifeBuoy, Send } from 'lucide-react';
import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiGet, apiPost } from '@/lib/api';

type Ticket = {
 id: string;
 category: string;
 subject: string;
 status: 'OPEN' | 'ANSWERED' | 'CLOSED';
 createdAt: string;
 messages: {
 id: string;
 body: string;
 isAdmin: boolean;
 createdAt: string;
 }[];
};

export function TicketsPage() {
 const queryClient = useQueryClient();
 const [category, setCategory] = useState('عمومی');
 const [subject, setSubject] = useState('');
 const [body, setBody] = useState('');

 const { data = [], isLoading } = useQuery({
 queryKey: ['tickets'],
 queryFn: () => apiGet<Ticket[]>('/tickets'),
 });

 const createMutation = useMutation({
 mutationFn: () =>
 apiPost('/tickets', {
 category,
 subject,
 body,
 }),
 onSuccess: () => {
 setSubject('');
 setBody('');
 queryClient.invalidateQueries({ queryKey: ['tickets'] });
 },
 });

 return (
 <AppShell>
 <main className="mx-auto max-w-7xl px-5 py-10">
 <div className="mb-8 flex items-center gap-3">
 <div className="grid h-14 w-14 place-items-center rounded-3xl bg-hell-violet ">
 <LifeBuoy />
 </div>
 <div>
 <h1 className="text-4xl font-black">پشتیبانی و تیکت</h1>
 <p className="mt-2 text-white/50">مشکلت رو بفرست، ادمین جواب می‌ده.</p>
 </div>
 </div>

 <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
 <Card className="p-6">
 <h2 className="mb-4 text-2xl font-black">تیکت جدید</h2>

 <div className="grid gap-4">
 <Input
 value={category}
 onChange={(event) => setCategory(event.target.value)}
 placeholder="دسته‌بندی"
 />
 <Input
 value={subject}
 onChange={(event) => setSubject(event.target.value)}
 placeholder="موضوع"
 />
 <Textarea
 value={body}
 onChange={(event) => setBody(event.target.value)}
 placeholder="متن پیام"
 />
 <Button
 disabled={createMutation.isPending || !subject.trim() || !body.trim()}
 onClick={() => createMutation.mutate()}
 >
 <Send size={16} />
 <span className="mr-2">ارسال تیکت</span>
 </Button>
 </div>
 </Card>

 <div className="grid gap-4">
 {isLoading ? (
 <Card className="h-60 animate-pulse" />
 ) : data.length ? (
 data.map((ticket) => (
 <Card key={ticket.id} className="p-5">
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div>
 <h3 className="text-xl font-black">{ticket.subject}</h3>
 <p className="mt-1 text-sm text-white/45">{ticket.category}</p>
 </div>
 <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
 {ticket.status}
 </span>
 </div>

 <div className="mt-4 grid gap-3">
 {ticket.messages.map((message) => (
 <div
 key={message.id}
 className={message.isAdmin ? 'rounded-2xl bg-hell-violet/15 p-3' : 'rounded-2xl bg-white/[0.05] p-3'}
 >
 <strong className="text-sm">{message.isAdmin ? 'ادمین' : 'شما'}</strong>
 <p className="mt-2 text-sm leading-6 text-white/65">{message.body}</p>
 </div>
 ))}
 </div>
 </Card>
 ))
 ) : (
 <Card className="p-6 text-white/50">هنوز تیکتی نداری.</Card>
 )}
 </div>
 </div>
 </main>
 </AppShell>
 );
}

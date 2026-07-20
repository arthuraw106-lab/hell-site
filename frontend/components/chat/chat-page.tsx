'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
 Archive,
 Bot,
 Camera,
 Edit3,
 File,
 ImageIcon,
 Loader2,
 MessageCircle,
 Mic,
 MicOff,
 Paperclip,
 Plus,
 Send,
 Settings,
 Trash2,
 UserRound,
 Video,
 X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UploadBox } from '@/components/upload/upload-box';
import { api, apiGet, apiPatch, apiPost } from '@/lib/api';
import { cn, toPersianDate } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { useToastStore } from '@/store/toast-store';

type Role = 'USER' | 'TRANSLATOR' | 'ADMIN' | 'SUPER_ADMIN';
type MessageType = 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'FILE' | 'SYSTEM';

type ChatUser = {
 id: string;
 username: string;
 displayName?: string | null;
 avatar?: string | null;
 bio?: string | null;
 role?: Role;
 createdAt?: string;
 _count?: { comments: number; bookmarks: number; stories: number };
};

type ChatMessage = {
 id: string;
 roomId: string;
 body?: string | null;
 mediaUrl?: string | null;
 type: MessageType;
 createdAt: string;
 user: ChatUser;
};

type ChatRoom = {
 id: string;
 name?: string | null;
 avatar?: string | null;
 type: 'PRIVATE' | 'GROUP';
 messages?: ChatMessage[];
 members?: { id: string; user: ChatUser }[];
};

type UploadResult = {
 url: string;
 mimeType: string;
 kind: string;
};

function canManageRooms(role?: Role) {
 return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

function detectType(file: File): MessageType {
 if (file.type.startsWith('image/')) return 'IMAGE';
 if (file.type.startsWith('audio/')) return 'AUDIO';
 if (file.type.startsWith('video/')) return 'VIDEO';
 return 'FILE';
}

function mediaIcon(type: MessageType) {
 if (type === 'IMAGE') return ImageIcon;
 if (type === 'AUDIO') return Mic;
 if (type === 'VIDEO') return Video;
 if (type === 'FILE') return File;
 return MessageCircle;
}

function formatSeconds(total: number) {
 const minutes = Math.floor(total / 60);
 const seconds = total % 60;
 return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function ChatPage() {
 const queryClient = useQueryClient();
 const showToast = useToastStore((state) => state.showToast);
 const accessToken = useAuthStore((state) => state.accessToken);
 const user = useAuthStore((state) => state.user);

 const [activeRoomId, setActiveRoomId] = useState('');
 const [body, setBody] = useState('');
 const [socket, setSocket] = useState<Socket | null>(null);
 const [pendingMedia, setPendingMedia] = useState<{ url: string; type: MessageType; name: string } | null>(null);
 const [uploading, setUploading] = useState(false);

 const [roomModalOpen, setRoomModalOpen] = useState(false);
 const [roomEditMode, setRoomEditMode] = useState(false);
 const [roomName, setRoomName] = useState('');
 const [roomAvatar, setRoomAvatar] = useState('');

 const [profileUserId, setProfileUserId] = useState<string | null>(null);

 const [recording, setRecording] = useState(false);
 const [recordSeconds, setRecordSeconds] = useState(0);
 const [recordPreviewUrl, setRecordPreviewUrl] = useState('');

 const fileInputRef = useRef<HTMLInputElement | null>(null);
 const messagesEndRef = useRef<HTMLDivElement | null>(null);
 const mediaRecorderRef = useRef<MediaRecorder | null>(null);
 const mediaStreamRef = useRef<MediaStream | null>(null);
 const chunksRef = useRef<Blob[]>([]);
 const recordTimerRef = useRef<number | null>(null);

 const { data: rooms = [], isLoading: roomsLoading } = useQuery({
 queryKey: ['chat-rooms-pro'],
 queryFn: () => apiGet<ChatRoom[]>('/chat/rooms'),
 });

 useEffect(() => {
 if (!activeRoomId && rooms[0]?.id) setActiveRoomId(rooms[0].id);
 }, [rooms, activeRoomId]);

 const activeRoom = useMemo(() => rooms.find((room) => room.id === activeRoomId), [rooms, activeRoomId]);

 const { data: messages = [], isLoading: messagesLoading } = useQuery({
 enabled: Boolean(activeRoomId),
 queryKey: ['chat-messages-pro', activeRoomId],
 queryFn: () => apiGet<ChatMessage[]>(`/chat/rooms/${activeRoomId}/messages`),
 });

 const { data: profileUser } = useQuery({
 enabled: Boolean(profileUserId),
 queryKey: ['chat-user-profile', profileUserId],
 queryFn: () => apiGet<ChatUser>(`/chat/users/${profileUserId}`),
 });

 useEffect(() => {
 if (!accessToken) return;

 const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';
 const client = io(wsUrl, { auth: { token: accessToken }, transports: ['websocket'] });

 client.on('connect', () => {
 if (activeRoomId) client.emit('room:join', activeRoomId);
 });

 client.on('message:new', () => {
 queryClient.invalidateQueries({ queryKey: ['chat-messages-pro', activeRoomId] });
 queryClient.invalidateQueries({ queryKey: ['chat-rooms-pro'] });
 });

 setSocket(client);

 return () => {
 client.disconnect();
 };
 }, [accessToken, activeRoomId, queryClient]);

 useEffect(() => {
 if (socket && activeRoomId) socket.emit('room:join', activeRoomId);
 }, [socket, activeRoomId]);

 useEffect(() => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 }, [messages.length, activeRoomId]);

 useEffect(() => {
 return () => {
 stopRecordingTimer();
 stopMediaStream();
 if (recordPreviewUrl) URL.revokeObjectURL(recordPreviewUrl);
 };
 }, [recordPreviewUrl]);

 const createRoomMutation = useMutation({
 mutationFn: () =>
 apiPost<ChatRoom>('/chat/rooms', {
 type: 'GROUP',
 name: roomName || 'گپ جدید هل مانهوا',
 avatar: roomAvatar || undefined,
 memberIds: [],
 }),
 onSuccess: async (room) => {
 setRoomModalOpen(false);
 setRoomName('');
 setRoomAvatar('');
 await queryClient.invalidateQueries({ queryKey: ['chat-rooms-pro'] });
 setActiveRoomId(room.id);
 showToast({ type: 'success', title: 'گپ ساخته شد' });
 },
 onError: (error) => showToast({ type: 'error', title: 'ساخت گپ ناموفق بود', message: error instanceof Error ? error.message : '' }),
 });

 const updateRoomMutation = useMutation({
 mutationFn: () =>
 apiPatch(`/chat/rooms/${activeRoomId}`, {
 name: roomName || undefined,
 avatar: roomAvatar || undefined,
 }),
 onSuccess: async () => {
 setRoomModalOpen(false);
 setRoomEditMode(false);
 await queryClient.invalidateQueries({ queryKey: ['chat-rooms-pro'] });
 showToast({ type: 'success', title: 'گپ ویرایش شد' });
 },
 onError: (error) => showToast({ type: 'error', title: 'ویرایش گپ ناموفق بود', message: error instanceof Error ? error.message : '' }),
 });

 const sendMutation = useMutation({
 mutationFn: async () => {
 const payload = {
 roomId: activeRoomId,
 type: pendingMedia?.type || 'TEXT',
 body: body.trim() || undefined,
 mediaUrl: pendingMedia?.url,
 };

 if (socket?.connected) {
 socket.emit('message:send', payload);
 return null;
 }

 return apiPost('/chat/messages', payload);
 },
 onSuccess: () => {
 setBody('');
 setPendingMedia(null);
 clearVoicePreview();
 queryClient.invalidateQueries({ queryKey: ['chat-messages-pro', activeRoomId] });
 queryClient.invalidateQueries({ queryKey: ['chat-rooms-pro'] });
 },
 onError: (error) => showToast({ type: 'error', title: 'پیام ارسال نشد', message: error instanceof Error ? error.message : '' }),
 });

 async function uploadBlob(blob: Blob, fileName: string, type: MessageType) {
 setUploading(true);

 try {
 const formData = new FormData();
 formData.append('file', blob, fileName);

 const response = await api.post('/upload', formData, {
 headers: { 'Content-Type': 'multipart/form-data' },
 timeout: 240000,
 });

 const result = response.data.data as UploadResult;

 setPendingMedia({ url: result.url, type, name: fileName });
 showToast({ type: 'success', title: type === 'AUDIO' ? 'ویس آماده ارسال است' : 'فایل آماده ارسال است', message: fileName });
 } catch (error) {
 showToast({ type: 'error', title: 'آپلود ناموفق بود', message: error instanceof Error ? error.message : '' });
 } finally {
 setUploading(false);
 }
 }

 async function uploadFile(file?: File) {
 if (!file) return;
 await uploadBlob(file, file.name, detectType(file));
 if (fileInputRef.current) fileInputRef.current.value = '';
 }

 async function startRecording() {
 if (recording) return;

 if (!navigator.mediaDevices?.getUserMedia) {
 showToast({ type: 'error', title: 'مرورگر از ضبط صدا پشتیبانی نمی‌کند' });
 return;
 }

 try {
 clearVoicePreview();

 const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
 mediaStreamRef.current = stream;

 const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
 const recorder = new MediaRecorder(stream, { mimeType });

 chunksRef.current = [];

 recorder.ondataavailable = (event) => {
 if (event.data.size > 0) chunksRef.current.push(event.data);
 };

 recorder.onstop = async () => {
 const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
 chunksRef.current = [];

 if (!blob.size) return;

 const preview = URL.createObjectURL(blob);
 setRecordPreviewUrl(preview);

 await uploadBlob(blob, `voice-${Date.now()}.webm`, 'AUDIO');
 };

 mediaRecorderRef.current = recorder;
 recorder.start();

 setRecording(true);
 setRecordSeconds(0);
 startRecordingTimer();
 } catch (error) {
 showToast({ type: 'error', title: 'اجازه میکروفون داده نشد', message: error instanceof Error ? error.message : '' });
 stopMediaStream();
 }
 }

 function stopRecording() {
 if (!recording) return;

 setRecording(false);
 stopRecordingTimer();
 stopMediaStream();

 const recorder = mediaRecorderRef.current;
 if (recorder && recorder.state !== 'inactive') recorder.stop();
 }

 function cancelRecording() {
 setRecording(false);
 stopRecordingTimer();
 stopMediaStream();

 const recorder = mediaRecorderRef.current;
 if (recorder && recorder.state !== 'inactive') {
 recorder.onstop = null;
 recorder.stop();
 }

 chunksRef.current = [];
 clearVoicePreview();
 }

 function startRecordingTimer() {
 stopRecordingTimer();
 recordTimerRef.current = window.setInterval(() => setRecordSeconds((value) => value + 1), 1000);
 }

 function stopRecordingTimer() {
 if (recordTimerRef.current) {
 window.clearInterval(recordTimerRef.current);
 recordTimerRef.current = null;
 }
 }

 function stopMediaStream() {
 mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
 mediaStreamRef.current = null;
 }

 function clearVoicePreview() {
 if (recordPreviewUrl) URL.revokeObjectURL(recordPreviewUrl);
 setRecordPreviewUrl('');
 }

 function sendNow() {
 if (!activeRoomId) return;
 if (!body.trim() && !pendingMedia) return;
 sendMutation.mutate();
 }

 function openCreateRoom() {
 setRoomEditMode(false);
 setRoomName('');
 setRoomAvatar('');
 setRoomModalOpen(true);
 }

 function openEditRoom() {
 if (!activeRoom) return;
 setRoomEditMode(true);
 setRoomName(activeRoom.name || '');
 setRoomAvatar(activeRoom.avatar || '');
 setRoomModalOpen(true);
 }

 return (
 <AppShell>
 <main className="relative z-10 mx-auto grid max-w-7xl gap-5 px-5 py-8 lg:grid-cols-[360px_1fr]">
 <Card className="card flex h-[calc(100vh-8rem)] min-h-[650px] flex-col overflow-hidden rounded-[2.5rem]">
 <div className="border-b border-white/10 p-5">
 <div className="mb-4 flex items-center justify-between gap-3">
 <div>
 <div className="mb-1 flex items-center gap-2 text-hell-light">
 <MessageCircle size={18} />
 <span className="text-sm font-black">گپ‌ها</span>
 </div>
 <h1 className="text-2xl font-black">چت هل مانهوا</h1>
 </div>

 {canManageRooms(user?.role as Role | undefined) ? (
 <Button size="sm" variant="secondary" onClick={openCreateRoom}>
 <Plus size={16} />
 </Button>
 ) : null}
 </div>

 <div className="relative">
 <MessageCircle className="absolute right-4 top-3.5 text-white/35" size={17} />
 <Input placeholder="جستجوی گپ..." className="pr-11" />
 </div>
 </div>

 <div className="custom-scrollbar flex-1 overflow-y-auto p-3">
 {roomsLoading ? (
 <div className="grid gap-3">
 {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-20 rounded-3xl skeleton" />)}
 </div>
 ) : (
 <div className="grid gap-2">
 {rooms.map((room) => {
 const last = room.messages?.[0];
 const active = activeRoomId === room.id;

 return (
 <button
 key={room.id}
 onClick={() => setActiveRoomId(room.id)}
 className={cn('rounded-3xl p-4 text-right transition', active ? 'bg-hell-violet/18 ' : 'bg-white/[0.04] hover:bg-white/[0.07]')}
 >
 <div className="flex items-center gap-3">
 <RoomAvatar room={room} />
 <div className="min-w-0 flex-1">
 <div className="truncate font-black">{room.name || 'گپ بدون نام'}</div>
 <p className="mt-1 truncate text-xs text-white/42">{last?.body || (last?.mediaUrl ? mediaLabel(last.type) : 'شروع گفتگو')}</p>
 </div>
 </div>
 </button>
 );
 })}
 </div>
 )}
 </div>
 </Card>

 <Card className="card flex h-[calc(100vh-8rem)] min-h-[650px] flex-col overflow-hidden rounded-[2.5rem]">
 <div className="border-b border-white/10 p-5">
 <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
 <div className="flex items-center gap-3">
 {activeRoom ? <RoomAvatar room={activeRoom} size="lg" /> : null}
 <div>
 <h2 className="text-2xl font-black">{activeRoom?.name || 'اتاق چت'}</h2>
 <p className="mt-1 text-sm text-white/45">برای صحبت با رجیس بنویس: «رجیس» یا @ai</p>
 </div>
 </div>

 <div className="flex gap-2">
 {canManageRooms(user?.role as Role | undefined) && activeRoom ? (
 <Button variant="secondary" size="sm" onClick={openEditRoom}>
 <Settings size={16} />
 <span className="mr-2">تنظیم گپ</span>
 </Button>
 ) : null}

 <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-2 text-sm text-white/55 md:flex">
 <Bot size={16} className="text-hell-light" />
 RegisBot آماده‌ست
 </div>
 </div>
 </div>
 </div>

 <div className="custom-scrollbar flex-1 overflow-y-auto p-4">
 {messagesLoading ? (
 <div className="grid gap-3">
 {Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-20 rounded-3xl skeleton" />)}
 </div>
 ) : (
 <div className="grid gap-3">
 {messages.map((message) => (
 <MessageBubble key={message.id} message={message} mine={Boolean(user?.id && message.user.id === user.id)} onProfileClick={() => setProfileUserId(message.user.id)} />
 ))}
 <div ref={messagesEndRef} />
 </div>
 )}
 </div>

 {recording ? (
 <div className="border-t border-white/10 bg-red-500/10 p-4">
 <div className="flex items-center justify-between gap-3 rounded-3xl border border-red-400/25 bg-red-400/10 p-3">
 <div className="flex items-center gap-3">
 <div className="grid h-10 w-10 place-items-center rounded-2xl bg-red-500/20 text-red-100"><Mic className="animate-pulse" /></div>
 <div><div className="font-black text-red-100">در حال ضبط ویس...</div><div className="text-xs text-white/55">{formatSeconds(recordSeconds)}</div></div>
 </div>
 <div className="flex gap-2">
 <button type="button" onClick={cancelRecording} className="rounded-2xl bg-white/10 px-3 py-2 text-sm font-bold">لغو</button>
 <button type="button" onClick={stopRecording} className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-black text-white">پایان</button>
 </div>
 </div>
 </div>
 ) : null}

 {pendingMedia ? (
 <div className="border-t border-white/10 bg-black/20 p-4">
 <div className="flex items-center justify-between gap-3 rounded-3xl border border-hell-light/25 bg-hell-light/10 p-3">
 <div className="flex min-w-0 items-center gap-3">
 {renderPendingMediaIcon(pendingMedia.type)}
 <div className="min-w-0"><div className="truncate text-sm font-black">{mediaLabel(pendingMedia.type)} آماده ارسال است</div><div className="truncate text-xs text-white/45">{pendingMedia.name}</div></div>
 </div>
 <button type="button" onClick={() => setPendingMedia(null)} className="rounded-xl bg-white/10 p-2 text-white/50 hover:text-white"><X size={16} /></button>
 </div>
 {recordPreviewUrl && pendingMedia.type === 'AUDIO' ? <audio src={recordPreviewUrl} controls className="mt-3 w-full" /> : null}
 </div>
 ) : null}

 <div className="border-t border-white/10 p-4">
 <div className="flex items-end gap-2">
 <input ref={fileInputRef} type="file" className="hidden" accept="image/*,audio/*,video/*,.pdf,.zip,.rar,.txt,.doc,.docx" onChange={(event) => uploadFile(event.target.files?.[0])} />

 <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading || recording} className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.055] text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-50">
 {uploading ? <Loader2 className="animate-spin" /> : <Paperclip />}
 </button>

 <button type="button" onClick={recording ? stopRecording : startRecording} disabled={uploading} className={recording ? 'grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-red-500 text-white ' : 'grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.055] text-white/60 transition hover:bg-white/10 hover:text-white'}>
 {recording ? <MicOff /> : <Mic />}
 </button>

 {pendingMedia ? (
 <button type="button" onClick={() => { setPendingMedia(null); clearVoicePreview(); }} className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-red-400/20 bg-red-400/10 text-red-100 transition hover:bg-red-400/20">
 <Trash2 />
 </button>
 ) : null}

 <div className="flex min-h-12 flex-1 items-center rounded-2xl border border-white/10 bg-white/[0.055] px-4">
 <input value={body} onChange={(event) => setBody(event.target.value)} placeholder={pendingMedia?.type === 'AUDIO' ? 'کپشن ویس، اختیاری...' : 'پیام بنویس...'} className="w-full bg-transparent py-3 text-white outline-none placeholder:text-white/35" onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendNow(); } }} />
 </div>

 <button type="button" onClick={sendNow} disabled={sendMutation.isPending || uploading || recording || (!body.trim() && !pendingMedia)} className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-hell-purple to-hell-violet text-white transition hover:scale-[1.03] disabled:opacity-50">
 <Send />
 </button>
 </div>
 </div>
 </Card>

 {roomModalOpen ? (
 <RoomModal
 editMode={roomEditMode}
 roomName={roomName}
 roomAvatar={roomAvatar}
 setRoomName={setRoomName}
 setRoomAvatar={setRoomAvatar}
 onClose={() => setRoomModalOpen(false)}
 onSubmit={() => roomEditMode ? updateRoomMutation.mutate() : createRoomMutation.mutate()}
 loading={roomEditMode ? updateRoomMutation.isPending : createRoomMutation.isPending}
 />
 ) : null}

 {profileUserId && profileUser ? (
 <UserProfileModal user={profileUser} onClose={() => setProfileUserId(null)} />
 ) : null}
 </main>
 </AppShell>
 );
}

function RoomAvatar({ room, size = 'md' }: { room: ChatRoom; size?: 'md' | 'lg' }) {
 const className = size === 'lg' ? 'h-14 w-14 rounded-2xl' : 'h-12 w-12 rounded-2xl';
 return (
 <div className={cn('grid shrink-0 place-items-center overflow-hidden bg-gradient-to-br from-hell-purple to-hell-violet', className)}>
 {room.avatar ? <img src={room.avatar} alt={room.name || 'room'} className="h-full w-full object-cover" /> : <MessageCircle />}
 </div>
 );
}

function RoomModal({ editMode, roomName, roomAvatar, setRoomName, setRoomAvatar, onClose, onSubmit, loading }: any) {
 return (
 <div className="fixed inset-0 z-[120] grid place-items-center bg-black/70 p-5 ">
 <div className="card w-full max-w-lg rounded-[2.5rem] p-6">
 <div className="mb-5 flex items-center justify-between">
 <h2 className="text-2xl font-black">{editMode ? 'ویرایش گپ' : 'ساخت گپ جدید'}</h2>
 <button onClick={onClose} className="rounded-xl bg-white/10 p-2"><X size={18} /></button>
 </div>
 <div className="grid gap-4">
 <Input value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="اسم گپ" />
 <Input value={roomAvatar} onChange={(e) => setRoomAvatar(e.target.value)} placeholder="لینک پروفایل گپ" />
 <UploadBox label="آپلود پروفایل گپ" onUploaded={(upload) => setRoomAvatar(upload.url)} />
 {roomAvatar ? <img src={roomAvatar} alt="room avatar" className="h-32 w-32 rounded-3xl object-cover" /> : null}
 <Button disabled={loading || !roomName.trim()} onClick={onSubmit}>
 {editMode ? <Edit3 size={16} /> : <Plus size={16} />}
 <span className="mr-2">{editMode ? 'ذخیره تغییرات' : 'ساخت گپ'}</span>
 </Button>
 </div>
 </div>
 </div>
 );
}

function UserProfileModal({ user, onClose }: { user: ChatUser; onClose: () => void }) {
 return (
 <div className="fixed inset-0 z-[120] grid place-items-center bg-black/70 p-5 ">
 <div className="card w-full max-w-md rounded-[2.5rem] p-6 text-center">
 <button onClick={onClose} className="absolute left-5 top-5 rounded-xl bg-white/10 p-2"><X size={18} /></button>
 <div className="mx-auto grid h-24 w-24 place-items-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-hell-purple to-hell-violet">
 {user.avatar ? <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" /> : <UserRound size={40} />}
 </div>
 <h2 className="mt-5 text-2xl font-black">{user.displayName || user.username}</h2>
 <p className="mt-1 text-white/45">@{user.username}</p>
 <span className="mt-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs text-white/55">{user.role}</span>
 {user.bio ? <p className="mt-5 leading-7 text-white/60">{user.bio}</p> : <p className="mt-5 text-white/35">بیویی ثبت نشده.</p>}
 {user.createdAt ? <p className="mt-4 text-xs text-white/35">عضویت: {toPersianDate(user.createdAt)}</p> : null}
 {user._count ? (
 <div className="mt-5 grid grid-cols-3 gap-2">
 <div className="rounded-2xl bg-white/10 p-3"><div className="font-black">{user._count.comments}</div><div className="text-xs text-white/40">کامنت</div></div>
 <div className="rounded-2xl bg-white/10 p-3"><div className="font-black">{user._count.bookmarks}</div><div className="text-xs text-white/40">بوکمارک</div></div>
 <div className="rounded-2xl bg-white/10 p-3"><div className="font-black">{user._count.stories}</div><div className="text-xs text-white/40">استوری</div></div>
 </div>
 ) : null}
 </div>
 </div>
 );
}

function renderPendingMediaIcon(type: MessageType) {
 const Icon = mediaIcon(type);
 return <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/10 text-hell-light"><Icon size={18} /></div>;
}

function mediaLabel(type: MessageType) {
 if (type === 'IMAGE') return 'عکس';
 if (type === 'AUDIO') return 'ویس';
 if (type === 'VIDEO') return 'ویدیو';
 if (type === 'FILE') return 'فایل';
 return 'پیام';
}

function MessageBubble({ message, mine, onProfileClick }: { message: ChatMessage; mine: boolean; onProfileClick: () => void }) {
 const Icon = mediaIcon(message.type);
 const isBot = message.user.username === 'RegisBot';

 return (
 <div className={mine ? 'flex justify-end' : 'flex justify-start'}>
 <div className={cn('max-w-[88%] rounded-[2rem] p-3 md:max-w-[72%]', mine ? 'bg-gradient-to-br from-hell-purple to-hell-violet text-white' : isBot ? 'border border-hell-light/25 bg-hell-light/10' : 'border border-white/10 bg-white/[0.055]')}>
 <button type="button" onClick={onProfileClick} className="mb-2 flex items-center gap-2 text-right">
 <div className={cn('grid h-9 w-9 place-items-center overflow-hidden rounded-xl', isBot ? 'bg-hell-light/20 text-hell-light' : 'bg-white/10')}>
 {message.user.avatar ? <img src={message.user.avatar} alt={message.user.username} className="h-full w-full object-cover" /> : isBot ? <Bot size={16} /> : <span className="text-xs font-black">{message.user.username.slice(0, 1).toUpperCase()}</span>}
 </div>
 <div>
 <div className="text-sm font-black">{message.user.displayName || message.user.username}</div>
 <div className="text-[10px] opacity-55">{new Date(message.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</div>
 </div>
 </button>
 {message.mediaUrl ? (
 <div className="mb-2 overflow-hidden rounded-2xl border border-white/10 bg-black/25">
 {message.type === 'IMAGE' ? <a href={message.mediaUrl} target="_blank" rel="noreferrer"><img src={message.mediaUrl} alt="chat media" className="max-h-80 w-full object-cover" /></a> :
 message.type === 'AUDIO' ? <div className="p-4"><div className="mb-2 flex items-center gap-2 text-sm font-bold text-hell-light"><Mic size={16} /> ویس</div><audio src={message.mediaUrl} controls className="w-full" /></div> :
 message.type === 'VIDEO' ? <video src={message.mediaUrl} controls className="max-h-96 w-full object-contain" /> :
 <a href={message.mediaUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 text-sm font-bold hover:bg-white/10"><Icon size={18} className="text-hell-light" />دانلود فایل</a>}
 </div>
 ) : null}
 {message.body ? <p className="whitespace-pre-wrap break-words leading-7">{message.body}</p> : null}
 </div>
 </div>
 );
}

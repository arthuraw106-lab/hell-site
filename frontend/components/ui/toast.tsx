'use client';

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useToastStore, ToastType } from '@/store/toast-store';
import { cn } from '@/lib/utils';

function iconByType(type: ToastType) {
 if (type === 'success') return CheckCircle2;
 if (type === 'error') return XCircle;
 if (type === 'warning') return AlertTriangle;
 return Info;
}

function colorByType(type: ToastType) {
 if (type === 'success') return 'border-green-400/25 bg-green-400/10 text-green-100';
 if (type === 'error') return 'border-red-400/25 bg-red-400/10 text-red-100';
 if (type === 'warning') return 'border-yellow-400/25 bg-yellow-400/10 text-yellow-100';
 return 'border-cyan-400/25 bg-cyan-400/10 text-cyan-100';
}

export function ToastViewport() {
 const toasts = useToastStore((state) => state.toasts);
 const removeToast = useToastStore((state) => state.removeToast);

 return (
 <div className="fixed bottom-5 left-5 z-[120] grid w-[calc(100vw-2.5rem)] max-w-md gap-3">
 {toasts.map((toast) => {
 const Icon = iconByType(toast.type);

 return (
 <div
 key={toast.id}
 className={cn(
 'glass animate-in slide-in-from-left-4 fade-in-0 rounded-3xl border p-4 ',
 colorByType(toast.type),
 )}
 >
 <div className="flex items-start gap-3">
 <Icon className="mt-0.5 shrink-0" size={20} />
 <div className="min-w-0 flex-1">
 <h3 className="font-black">{toast.title}</h3>
 {toast.message ? <p className="mt-1 text-sm leading-6 opacity-75">{toast.message}</p> : null}
 </div>
 <button
 type="button"
 className="rounded-xl bg-white/10 p-1 opacity-70 transition hover:opacity-100"
 onClick={() => removeToast(toast.id)}
 aria-label="بستن پیام"
 >
 <X size={16} />
 </button>
 </div>
 </div>
 );
 })}
 </div>
 );
}

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toPersianDate(value: string | Date) {
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

export function getImageFallback(title: string) {
  // Local fallback - no external requests
  // Returns a data URI placeholder to avoid slow external image loading
  return `/api/placeholder-cover?title=${encodeURIComponent(title)}`;
}

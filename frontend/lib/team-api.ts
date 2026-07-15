const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');

function getAccessToken(): string {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('access_token') ||
    ''
  );
}

type RequestOptions = {
  method?: string;
  body?: BodyInit | Record<string, unknown> | null;
  auth?: boolean;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: HeadersInit = {};
  const token = getAccessToken();

  if (options.auth !== false && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let body: BodyInit | undefined;

  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers,
    body,
    credentials: 'include',
    cache: 'no-store',
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(data?.message || data?.error || 'خطای ارتباط با سرور');
  }

  return data as T;
}

export function mediaUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE.replace(/\/api$/, '')}${url.startsWith('/') ? url : `/${url}`}`;
}

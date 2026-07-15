import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

type AuthRefreshResponse = {
  user: unknown;
  accessToken: string;
  refreshToken: string;
};

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true,
});

function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

function getRefreshToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
}

function setTokens(accessToken: string, refreshToken: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function resolveRefreshQueue(token: string | null) {
  refreshQueue.forEach((callback) => callback(token));
  refreshQueue = [];
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;
    const url = originalRequest?.url || '';

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/logout');

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearTokens();

        if (typeof window !== 'undefined') {
          window.location.href = '/auth';
        }

        return Promise.reject(new Error('نشست شما منقضی شده است. لطفاً دوباره وارد شوید.'));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((newAccessToken) => {
            if (!newAccessToken) {
              reject(new Error('تمدید نشست ناموفق بود.'));
              return;
            }

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const response = await axios.post<ApiResponse<AuthRefreshResponse>>(
          `${API_URL}/auth/refresh`,
          { refreshToken },
          {
            withCredentials: true,
            timeout: 20000,
          },
        );

        const nextAccessToken = response.data.data.accessToken;
        const nextRefreshToken = response.data.data.refreshToken;

        setTokens(nextAccessToken, nextRefreshToken);
        resolveRefreshQueue(nextAccessToken);

        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;

        return api(originalRequest);
      } catch {
        resolveRefreshQueue(null);
        clearTokens();

        if (typeof window !== 'undefined') {
          window.location.href = '/auth';
        }

        return Promise.reject(new Error('نشست شما منقضی شده است. لطفاً دوباره وارد شوید.'));
      } finally {
        isRefreshing = false;
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'خطای ارتباط با سرور';

    return Promise.reject(new Error(Array.isArray(message) ? message.join('، ') : String(message)));
  },
);

export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response = await api.get<ApiResponse<T>>(url, { params });
  return response.data.data;
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const response = await api.post<ApiResponse<T>>(url, body);
  return response.data.data;
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const response = await api.patch<ApiResponse<T>>(url, body);
  return response.data.data;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const response = await api.delete<ApiResponse<T>>(url);
  return response.data.data;
}

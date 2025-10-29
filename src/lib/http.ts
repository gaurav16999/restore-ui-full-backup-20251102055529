import axios, { AxiosError, AxiosHeaders, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import type { RawAxiosRequestHeaders } from 'axios';
import { API_BASE } from './config';

// A singleton axios client with JWT attach + auto-refresh on 401
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
const requestQueue: Array<(token: string | null) => void> = [];

// Helper to get tokens from storage
function getAccessToken(): string | null {
  return window.localStorage.getItem('accessToken');
}
function getRefreshToken(): string | null {
  return window.localStorage.getItem('refreshToken');
}
function setAccessToken(token: string) {
  window.localStorage.setItem('accessToken', token);
}
function clearTokens() {
  window.localStorage.removeItem('accessToken');
  window.localStorage.removeItem('refreshToken');
}

// A bare client without interceptors to call refresh endpoint safely
const bare = axios.create({ baseURL: API_BASE });

async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise; // reuse in-flight
  }
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const rtoken = getRefreshToken();
      if (!rtoken) return null;
      const res = await bare.post('/api/auth/token/refresh/', { refresh: rtoken });
      const newAccess = res.data?.access as string | undefined;
      if (newAccess) {
        setAccessToken(newAccess);
        return newAccess;
      }
      return null;
    } catch (e) {
      return null;
    } finally {
      isRefreshing = false;
    }
  })();
  const token = await refreshPromise;
  // Resolve queued requests
  while (requestQueue.length) {
    const resume = requestQueue.shift();
    if (resume) resume(token);
  }
  return token;
}

export const authClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Attach Authorization header
authClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    if (config.headers instanceof AxiosHeaders) {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else if (config.headers) {
      (config.headers as RawAxiosRequestHeaders).Authorization = `Bearer ${token}`;
    } else {
      config.headers = new AxiosHeaders({ Authorization: `Bearer ${token}` });
    }
  }
  return config;
});

// Handle 401: try refresh once and retry original request
authClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Network errors
    if (!error.response) {
      return Promise.reject(error);
    }

    if (error.response.status === 401 && !original._retry) {
      original._retry = true;

      // Wait for a single refresh result when multiple 401s occur
      const newToken = await new Promise<string | null>((resolve) => {
        requestQueue.push(resolve);
        if (!isRefreshing) {
          refreshAccessToken();
        }
      });

      if (newToken) {
        if (original.headers instanceof AxiosHeaders) {
          original.headers.set('Authorization', `Bearer ${newToken}`);
        } else if (original.headers) {
          (original.headers as RawAxiosRequestHeaders).Authorization = `Bearer ${newToken}`;
        } else {
          original.headers = new AxiosHeaders({ Authorization: `Bearer ${newToken}` });
        }
        return authClient.request(original);
      }

      // Refresh failed → clear tokens and reject
      clearTokens();
    }

    return Promise.reject(error);
  }
);

export default authClient;

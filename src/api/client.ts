import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getSasViyaUrl } from '../config';

const isElectron = !!window.electronAPI;

interface ViyaApiError {
  message?: string;
  details?: string[];
}

let csrfToken: string | null = null;

export const clearCsrfToken = (): void => {
  csrfToken = null;
};

const addAuthInterceptor = (client: AxiosInstance): void => {
  client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    if (isElectron && window.electronAPI) {
      const viyaUrl = await window.electronAPI.getViyaUrl();
      if (viyaUrl) {
        config.baseURL = viyaUrl;
      }

      const token = await window.electronAPI.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    const method = config.method?.toUpperCase();
    if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && csrfToken) {
      config.headers['X-CSRF-TOKEN'] = csrfToken;
    }

    return config;
  });
};

const addErrorInterceptor = (client: AxiosInstance): void => {
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ViyaApiError>) => {
      const originalRequest = error.config as (InternalAxiosRequestConfig & { _csrfRetry?: boolean }) | undefined;

      if (error.response?.status === 403 && originalRequest && !originalRequest._csrfRetry) {
        const newToken = error.response.headers['x-csrf-token'];
        if (typeof newToken === 'string') {
          csrfToken = newToken;
          originalRequest._csrfRetry = true;
          originalRequest.headers['X-CSRF-TOKEN'] = newToken;
          return client(originalRequest);
        }
      }

      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in.');
      }

      const message = error.response?.data?.message ?? error.response?.data?.details?.join(', ') ?? error.message;
      throw new Error(message);
    }
  );
};

export const createViyaClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: isElectron ? '' : getSasViyaUrl(),
    withCredentials: !isElectron,
    timeout: 30000,
  });

  addAuthInterceptor(client);
  addErrorInterceptor(client);

  return client;
};

export const viyaClient = createViyaClient();

export { getSasViyaUrl } from '../config';

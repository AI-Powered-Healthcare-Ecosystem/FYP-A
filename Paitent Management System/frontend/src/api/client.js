import axios from 'axios';

const laravelBaseURL = import.meta.env.VITE_LARAVEL_URL || 'http://127.0.0.1:8000';
const fastApiBaseURL = import.meta.env.VITE_FASTAPI_URL || 'http://127.0.0.1:5000';

export const laravelClient = axios.create({
  baseURL: `${laravelBaseURL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  // Include session cookies for auth-protected admin routes
  withCredentials: true,
  // Axios will automatically read XSRF-TOKEN cookie and send X-XSRF-TOKEN header
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

export const fastApiClient = axios.create({
  baseURL: fastApiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional response interceptor for centralized error logging
[laravelClient, fastApiClient].forEach((client) => {
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // eslint-disable-next-line no-console
      console.error('[API Error]', error?.response?.status, error?.response?.data || error.message);
      return Promise.reject(error);
    }
  );
});

// Auto-refresh CSRF cookie and retry once on 419/401 for Laravel client
laravelClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const config = error?.config || {};
    if ((status === 419 || status === 401) && !config.__retried) {
      try {
        await axios.get(`${laravelBaseURL}/sanctum/csrf-cookie`, { withCredentials: true });
        config.__retried = true;
        return laravelClient.request(config);
      } catch (e) {
        // fall through
      }
    }
    return Promise.reject(error);
  }
);

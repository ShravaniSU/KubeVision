import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: log in development
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: normalize errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.error || error.message || 'Something went wrong';
    if (import.meta.env.DEV) {
      console.error(`[API Error]`, message);
    }
    return Promise.reject(new Error(message));
  }
);

export default api;

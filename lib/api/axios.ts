import axios from 'axios';
import { getToken, removeToken } from '../utils/token';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to home on 401 if it's NOT a login attempt
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/login');
      
      if (!isLoginRequest) {
        removeToken();
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
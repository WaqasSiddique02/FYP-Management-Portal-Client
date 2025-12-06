const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const ENDPOINTS = {
  STUDENT: {
    LOGIN: `${API_BASE_URL}/auth/student/login`,
    REGISTER: `${API_BASE_URL}/auth/student/register`,
    PROFILE: `${API_BASE_URL}/auth/student/profile`,
  },
  SUPERVISOR: {
    LOGIN: `${API_BASE_URL}/auth/supervisor/login`,
    PROFILE: `${API_BASE_URL}/auth/supervisor/profile`,
    SET_PASSWORD: `${API_BASE_URL}/auth/supervisor/set-password`,
    UPDATE_PROFILE: `${API_BASE_URL}/auth/supervisor/profile`,
  },
  COORDINATOR: {
    LOGIN: `${API_BASE_URL}/auth/coordinator/login`,
    PROFILE: `${API_BASE_URL}/auth/coordinator/profile`,
  },
} as const;
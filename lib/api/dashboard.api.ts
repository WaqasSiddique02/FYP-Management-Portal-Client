import apiClient from './axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

export const dashboardAPI = {
  student: {
    getDashboard: async () => {
      const { data } = await apiClient.get(`${API_BASE_URL}/dashboard/student`);
      return data.data.dashboard;
    },
  },
  
  supervisor: {
    getDashboard: async () => {
      const { data } = await apiClient.get(`${API_BASE_URL}/dashboard/supervisor`);
      return data.data.dashboard;
    },
  },
  
  coordinator: {
    getDashboard: async () => {
      const { data } = await apiClient.get(`${API_BASE_URL}/dashboard/coordinator`);
      return data.data.dashboard;
    },
  },
};
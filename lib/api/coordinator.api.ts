import apiClient from './axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

export const coordinatorApi = {
  getDashboard: async () => {
    const response = await apiClient.get(`${API_BASE_URL}/dashboard/coordinator`);
    return response.data?.data || response.data;
  },
};

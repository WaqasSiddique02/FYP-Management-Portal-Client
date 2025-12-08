import apiClient from './axios';
import { SupervisorDashboardResponse } from '../types/supervisor.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

export const supervisorApi = {
  getDashboard: async (): Promise<SupervisorDashboardResponse> => {
    const response = await apiClient.get<SupervisorDashboardResponse>(
      `${API_BASE_URL}/dashboard/supervisor`
    );
    return response.data;
  },
};

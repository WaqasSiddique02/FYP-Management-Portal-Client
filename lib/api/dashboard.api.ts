import apiClient from './axios';
import { ENDPOINTS } from './endpoints';

export const dashboardAPI = {
  student: {
    getDashboard: async () => {
      const { data } = await apiClient.get(ENDPOINTS.DASHBOARD.STUDENT);
      return data.data.dashboard;
    },
  },
  
  supervisor: {
    getDashboard: async () => {
      const { data } = await apiClient.get(ENDPOINTS.DASHBOARD.SUPERVISOR);
      return data.data.dashboard;
    },
  },
  
  coordinator: {
    getDashboard: async () => {
      const { data } = await apiClient.get(ENDPOINTS.DASHBOARD.COORDINATOR);
      return data.data.dashboard;
    },
  },
};
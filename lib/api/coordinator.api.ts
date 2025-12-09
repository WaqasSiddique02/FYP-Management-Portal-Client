import apiClient from './axios';
import { ProjectMonitoringData, ProjectDetailData } from '../types/coordinator.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

export const coordinatorApi = {
  getDashboard: async () => {
    const response = await apiClient.get(`${API_BASE_URL}/dashboard/coordinator`);
    return response.data?.data || response.data;
  },

  // Teacher Management APIs
  getTeachers: async () => {
    const response = await apiClient.get(`${API_BASE_URL}/coordinator/teachers`);
    return response.data?.data || response.data;
  },

  getTeacherById: async (teacherId: string) => {
    const response = await apiClient.get(`${API_BASE_URL}/coordinator/teachers/${teacherId}`);
    return response.data?.data || response.data;
  },

  addTeacher: async (teacherData: {
    name: string;
    email: string;
    phone: string;
    department: string;
    specialization: string;
    maxCapacity: number;
  }) => {
    const response = await apiClient.post(`${API_BASE_URL}/coordinator/teachers`, teacherData);
    return response.data?.data || response.data;
  },

  updateTeacher: async (teacherId: string, teacherData: Partial<{
    name: string;
    email: string;
    phone: string;
    department: string;
    specialization: string;
    maxCapacity: number;
    status: string;
  }>) => {
    const response = await apiClient.put(`${API_BASE_URL}/coordinator/teachers/${teacherId}`, teacherData);
    return response.data?.data || response.data;
  },

  transferTeacher: async (teacherId: string, toDepartment: string) => {
    const response = await apiClient.patch(`${API_BASE_URL}/coordinator/teachers/${teacherId}/transfer`, {
      department: toDepartment
    });
    return response.data?.data || response.data;
  },

  deleteTeacher: async (teacherId: string) => {
    const response = await apiClient.delete(`${API_BASE_URL}/coordinator/teachers/${teacherId}`);
    return response.data?.data || response.data;
  },

  updateTeacherAvailability: async (teacherId: string, isAvailable: boolean) => {
    const response = await apiClient.patch(`${API_BASE_URL}/coordinator/teachers/${teacherId}/availability`, {
      isAvailable
    });
    return response.data?.data || response.data;
  },

  // Project Monitoring APIs
  getAllProjects: async (): Promise<ProjectMonitoringData> => {
    const response = await apiClient.get(`${API_BASE_URL}/projects`);
    return response.data;
  },

  getProjectById: async (projectId: string): Promise<ProjectDetailData> => {
    const response = await apiClient.get(`${API_BASE_URL}/projects/${projectId}`);
    return response.data;
  },
};

import apiClient from './axios';
import { 
  ProjectMonitoringData, 
  ProjectDetailData,
  Announcement,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  AnnouncementResponse,
  DeleteAnnouncementResponse,
  EvaluationPanel,
  CreatePanelDto,
  UpdatePanelDto,
  PanelResponse,
  DeletePanelResponse,
  PresentationSchedule,
  CreateScheduleDto,
  UpdateScheduleDto,
  AutoScheduleDto,
  SwapScheduleDto,
  ScheduleResponse,
  AutoScheduleResponse,
  SwapScheduleResponse,
  DeleteScheduleResponse,
  CoordinatorProfileResponse
} from '../types/coordinator.types';

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

  // Announcement APIs
  createAnnouncement: async (data: CreateAnnouncementDto): Promise<AnnouncementResponse> => {
    const response = await apiClient.post(`${API_BASE_URL}/coordinator/announcements`, data);
    return response.data;
  },

  getAllAnnouncements: async (): Promise<Announcement[]> => {
    const response = await apiClient.get(`${API_BASE_URL}/coordinator/announcements`);
    return response.data.data || [];
  },

  getAnnouncementById: async (id: string): Promise<Announcement> => {
    const response = await apiClient.get(`${API_BASE_URL}/coordinator/announcements/${id}`);
    return response.data;
  },

  updateAnnouncement: async (id: string, data: UpdateAnnouncementDto): Promise<AnnouncementResponse> => {
    const response = await apiClient.put(`${API_BASE_URL}/coordinator/announcements/${id}`, data);
    return response.data;
  },

  deleteAnnouncement: async (id: string): Promise<DeleteAnnouncementResponse> => {
    const response = await apiClient.delete(`${API_BASE_URL}/coordinator/announcements/${id}`);
    return response.data;
  },

  // Evaluation Panel APIs
  createPanel: async (data: CreatePanelDto): Promise<PanelResponse> => {
    const response = await apiClient.post(`${API_BASE_URL}/panels`, data);
    return response.data;
  },

  getAllPanels: async (): Promise<EvaluationPanel[]> => {
    const response = await apiClient.get(`${API_BASE_URL}/panels`);
    return response.data.data;
  },

  getPanelById: async (id: string): Promise<EvaluationPanel> => {
    const response = await apiClient.get(`${API_BASE_URL}/panels/${id}`);
    return response.data.data;
  },

  updatePanel: async (id: string, data: UpdatePanelDto): Promise<PanelResponse> => {
    const response = await apiClient.put(`${API_BASE_URL}/panels/${id}`, data);
    return response.data;
  },

  deletePanel: async (id: string): Promise<DeletePanelResponse> => {
    const response = await apiClient.delete(`${API_BASE_URL}/panels/${id}`);
    return response.data;
  },

  // Presentation Schedule APIs
  createSchedule: async (data: CreateScheduleDto): Promise<ScheduleResponse> => {
    const response = await apiClient.post(`${API_BASE_URL}/schedules`, data);
    return response.data;
  },

  getAllSchedules: async (date?: string): Promise<PresentationSchedule[]> => {
    const url = date 
      ? `${API_BASE_URL}/schedules?date=${date}`
      : `${API_BASE_URL}/schedules`;
    const response = await apiClient.get(url);
    return response.data.data;
  },

  getScheduleById: async (id: string): Promise<PresentationSchedule> => {
    const response = await apiClient.get(`${API_BASE_URL}/schedules/${id}`);
    return response.data.data;
  },

  updateSchedule: async (id: string, data: UpdateScheduleDto): Promise<ScheduleResponse> => {
    const response = await apiClient.put(`${API_BASE_URL}/schedules/${id}`, data);
    return response.data;
  },

  deleteSchedule: async (id: string): Promise<DeleteScheduleResponse> => {
    const response = await apiClient.delete(`${API_BASE_URL}/schedules/${id}`);
    return response.data;
  },

  autoSchedule: async (data: AutoScheduleDto): Promise<AutoScheduleResponse> => {
    const response = await apiClient.post(`${API_BASE_URL}/schedules/auto-schedule`, data);
    return response.data;
  },

  swapSchedules: async (data: SwapScheduleDto): Promise<SwapScheduleResponse> => {
    const response = await apiClient.post(`${API_BASE_URL}/schedules/swap`, data);
    return response.data;
  },

  // Coordinator Profile API
  getProfile: async (): Promise<CoordinatorProfileResponse> => {
    const response = await apiClient.get(`${API_BASE_URL}/auth/coordinator/profile`);
    return response.data;
  },
};

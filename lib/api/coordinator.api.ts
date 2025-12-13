import apiClient from './axios';
import { ENDPOINTS } from './endpoints';
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

export const coordinatorApi = {
  getDashboard: async () => {
    const response = await apiClient.get(ENDPOINTS.DASHBOARD.COORDINATOR);
    return response.data?.data || response.data;
  },

  // Teacher Management APIs
  getTeachers: async () => {
    const response = await apiClient.get(ENDPOINTS.COORDINATOR.TEACHERS);
    return response.data?.data || response.data;
  },

  getTeacherById: async (teacherId: string) => {
    const response = await apiClient.get(ENDPOINTS.COORDINATOR.TEACHER_BY_ID(teacherId));
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
    const response = await apiClient.post(ENDPOINTS.COORDINATOR.TEACHERS, teacherData);
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
    const response = await apiClient.put(ENDPOINTS.COORDINATOR.TEACHER_BY_ID(teacherId), teacherData);
    return response.data?.data || response.data;
  },

  transferTeacher: async (teacherId: string, toDepartment: string) => {
    const response = await apiClient.patch(ENDPOINTS.COORDINATOR.TEACHER_TRANSFER(teacherId), {
      department: toDepartment
    });
    return response.data?.data || response.data;
  },

  deleteTeacher: async (teacherId: string) => {
    const response = await apiClient.delete(ENDPOINTS.COORDINATOR.TEACHER_BY_ID(teacherId));
    return response.data?.data || response.data;
  },

  updateTeacherAvailability: async (teacherId: string, isAvailable: boolean) => {
    const response = await apiClient.patch(ENDPOINTS.COORDINATOR.TEACHER_AVAILABILITY(teacherId), {
      isAvailable
    });
    return response.data?.data || response.data;
  },

  // Project Monitoring APIs
  getAllProjects: async (): Promise<ProjectMonitoringData> => {
    const response = await apiClient.get(ENDPOINTS.PROJECT.ALL);
    return response.data;
  },

  getProjectById: async (projectId: string): Promise<ProjectDetailData> => {
    const response = await apiClient.get(ENDPOINTS.PROJECT.BY_ID(projectId));
    return response.data;
  },

  // Announcement APIs
  createAnnouncement: async (data: CreateAnnouncementDto): Promise<AnnouncementResponse> => {
    const response = await apiClient.post(ENDPOINTS.COORDINATOR.ANNOUNCEMENTS, data);
    return response.data;
  },

  getAllAnnouncements: async (): Promise<Announcement[]> => {
    const response = await apiClient.get(ENDPOINTS.COORDINATOR.ANNOUNCEMENTS);
    return response.data.data || [];
  },

  getAnnouncementById: async (id: string): Promise<Announcement> => {
    const response = await apiClient.get(ENDPOINTS.COORDINATOR.ANNOUNCEMENT_BY_ID(id));
    return response.data;
  },

  updateAnnouncement: async (id: string, data: UpdateAnnouncementDto): Promise<AnnouncementResponse> => {
    const response = await apiClient.put(ENDPOINTS.COORDINATOR.ANNOUNCEMENT_BY_ID(id), data);
    return response.data;
  },

  deleteAnnouncement: async (id: string): Promise<DeleteAnnouncementResponse> => {
    const response = await apiClient.delete(ENDPOINTS.COORDINATOR.ANNOUNCEMENT_BY_ID(id));
    return response.data;
  },

  // Evaluation Panel APIs
  createPanel: async (data: CreatePanelDto): Promise<PanelResponse> => {
    const response = await apiClient.post(ENDPOINTS.PANELS.ALL, data);
    return response.data;
  },

  getAllPanels: async (): Promise<EvaluationPanel[]> => {
    const response = await apiClient.get(ENDPOINTS.PANELS.ALL);
    return response.data.data;
  },

  getPanelById: async (id: string): Promise<EvaluationPanel> => {
    const response = await apiClient.get(ENDPOINTS.PANELS.BY_ID(id));
    return response.data.data;
  },

  updatePanel: async (id: string, data: UpdatePanelDto): Promise<PanelResponse> => {
    const response = await apiClient.put(ENDPOINTS.PANELS.BY_ID(id), data);
    return response.data;
  },

  deletePanel: async (id: string): Promise<DeletePanelResponse> => {
    const response = await apiClient.delete(ENDPOINTS.PANELS.BY_ID(id));
    return response.data;
  },

  // Presentation Schedule APIs
  createSchedule: async (data: CreateScheduleDto): Promise<ScheduleResponse> => {
    const response = await apiClient.post(ENDPOINTS.SCHEDULES.ALL, data);
    return response.data;
  },

  getAllSchedules: async (date?: string): Promise<PresentationSchedule[]> => {
    const url = date 
      ? `${ENDPOINTS.SCHEDULES.ALL}?date=${date}`
      : ENDPOINTS.SCHEDULES.ALL;
    const response = await apiClient.get(url);
    return response.data.data;
  },

  getScheduleById: async (id: string): Promise<PresentationSchedule> => {
    const response = await apiClient.get(ENDPOINTS.SCHEDULES.BY_ID(id));
    return response.data.data;
  },

  updateSchedule: async (id: string, data: UpdateScheduleDto): Promise<ScheduleResponse> => {
    const response = await apiClient.put(ENDPOINTS.SCHEDULES.BY_ID(id), data);
    return response.data;
  },

  deleteSchedule: async (id: string): Promise<DeleteScheduleResponse> => {
    const response = await apiClient.delete(ENDPOINTS.SCHEDULES.BY_ID(id));
    return response.data;
  },

  autoSchedule: async (data: AutoScheduleDto): Promise<AutoScheduleResponse> => {
    const response = await apiClient.post(ENDPOINTS.SCHEDULES.AUTO_SCHEDULE, data);
    return response.data;
  },

  swapSchedules: async (data: SwapScheduleDto): Promise<SwapScheduleResponse> => {
    const response = await apiClient.post(ENDPOINTS.SCHEDULES.SWAP, data);
    return response.data;
  },

  // Coordinator Profile API
  getProfile: async (): Promise<CoordinatorProfileResponse> => {
    const response = await apiClient.get(ENDPOINTS.COORDINATOR.PROFILE);
    return response.data;
  },
};

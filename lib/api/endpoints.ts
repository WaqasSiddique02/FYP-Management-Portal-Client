const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const ENDPOINTS = {
  STUDENT: {
    LOGIN: `${API_BASE_URL}/auth/student/login`,
    REGISTER: `${API_BASE_URL}/auth/student/register`,
    PROFILE: `${API_BASE_URL}/students/profile`,
    REGISTER_FYP: `${API_BASE_URL}/students/register-fyp`,
    DEPARTMENTS: `${API_BASE_URL}/students/departments`,
    SEARCH: `${API_BASE_URL}/auth/student/search`,
  },
  SUPERVISOR: {
    LOGIN: `${API_BASE_URL}/auth/supervisor/login`,
    PROFILE: `${API_BASE_URL}/auth/supervisor/profile`,
    SET_PASSWORD: `${API_BASE_URL}/auth/supervisor/set-password`,
    UPDATE_PROFILE: `${API_BASE_URL}/auth/supervisor/profile`,
    DASHBOARD: `${API_BASE_URL}/dashboard/supervisor`,
  },
  COORDINATOR: {
    LOGIN: `${API_BASE_URL}/auth/coordinator/login`,
    PROFILE: `${API_BASE_URL}/auth/coordinator/profile`,
  },
  DASHBOARD: {
    STUDENT: `${API_BASE_URL}/dashboard/student`,
    SUPERVISOR: `${API_BASE_URL}/dashboard/supervisor`,
    COORDINATOR: `${API_BASE_URL}/dashboard/coordinator`,
  },
  GROUP: {
    CREATE: `${API_BASE_URL}/groups`,
    MY_GROUP: `${API_BASE_URL}/groups/my-group`,
    ADD_MEMBER: (groupId: string) => `${API_BASE_URL}/groups/${groupId}/add-member`,
    REMOVE_MEMBER: (groupId: string, memberId: string) => `${API_BASE_URL}/groups/${groupId}/remove-member/${memberId}`,
    LEAVE: (groupId: string) => `${API_BASE_URL}/groups/${groupId}/leave`,
  },
  PROJECT: {
    SUPERVISOR_IDEAS: `${API_BASE_URL}/projects/supervisor/ideas`,
    SELECT_IDEA: `${API_BASE_URL}/projects/select-idea`,
    REQUEST_CUSTOM_IDEA: `${API_BASE_URL}/projects/request-custom-idea`,
    MY_PROJECT: `${API_BASE_URL}/projects/my-project`,
    SUBMIT_GITHUB: `${API_BASE_URL}/projects/github`,
    MY_GITHUB: `${API_BASE_URL}/projects/github/my`,
  },
  PROPOSAL: {
    UPLOAD: `${API_BASE_URL}/proposals`,
    MY_DOCUMENTS: `${API_BASE_URL}/documents/my-documents`,
  },
  DOCUMENTS: {
    UPLOAD: `${API_BASE_URL}/documents`,
    MY_DOCUMENTS: `${API_BASE_URL}/documents/my-documents`,
  },
  SCHEDULE: {
    MY_SCHEDULE: `${API_BASE_URL}/students/schedule/my-schedule`,
    MY_PANEL: `${API_BASE_URL}/students/schedule/my-panel`,
  },
} as const;

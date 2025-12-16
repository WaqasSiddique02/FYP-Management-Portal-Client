import apiClient from './axios';
import { ENDPOINTS } from './endpoints';
import { SupervisorDashboardResponse, GroupsListResponse, GroupDetails, ApproveIdeaPayload, RejectIdeaPayload } from '../types/supervisor.types';
import { StudentAnnouncement } from '../types/auth.types';

export const supervisorApi = {
  getDashboard: async (): Promise<SupervisorDashboardResponse> => {
    const response = await apiClient.get<SupervisorDashboardResponse>(
      ENDPOINTS.SUPERVISOR.DASHBOARD
    );
    return response.data;
  },

  // Groups Management
  getAssignedGroups: async (): Promise<GroupDetails[]> => {
    const response = await apiClient.get<{ statusCode: number; message: string; data: GroupDetails[]; timestamp: string }>(
      ENDPOINTS.SUPERVISOR.ASSIGNED_GROUPS
    );
    return response.data.data;
  },

  getAssignedGroupById: async (groupId: string): Promise<GroupDetails> => {
    const response = await apiClient.get<{ statusCode: number; message: string; data: GroupDetails; timestamp: string }>(
      ENDPOINTS.SUPERVISOR.ASSIGNED_GROUP_BY_ID(groupId)
    );
    return response.data.data;
  },

  // Custom Ideas Approval
  getCustomIdeas: async () => {
    const response = await apiClient.get(ENDPOINTS.SUPERVISOR.CUSTOM_IDEAS);
    // Handle different response formats from backend
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  },

  approveCustomIdea: async (ideaId: string, payload: ApproveIdeaPayload) => {
    const response = await apiClient.put(
      ENDPOINTS.SUPERVISOR.CUSTOM_IDEA_APPROVE(ideaId),
      payload
    );
    return response.data;
  },

  rejectCustomIdea: async (ideaId: string, payload: RejectIdeaPayload) => {
    const response = await apiClient.put(
      ENDPOINTS.SUPERVISOR.CUSTOM_IDEA_REJECT(ideaId),
      payload
    );
    return response.data;
  },

  // Selected Ideas Approval
  getSelectedIdeas: async () => {
    const response = await apiClient.get(ENDPOINTS.SUPERVISOR.SELECTED_IDEAS);
    return response.data;
  },

  approveSelectedIdea: async (ideaId: string, payload: ApproveIdeaPayload) => {
    const response = await apiClient.put(
      ENDPOINTS.SUPERVISOR.SELECTED_IDEA_APPROVE(ideaId),
      payload
    );
    return response.data;
  },

  rejectSelectedIdea: async (ideaId: string, payload: RejectIdeaPayload) => {
    const response = await apiClient.put(
      ENDPOINTS.SUPERVISOR.SELECTED_IDEA_REJECT(ideaId),
      payload
    );
    return response.data;
  },

  // Project Ideas Management
  getOwnProjectIdeas: async () => {
    const response = await apiClient.get(ENDPOINTS.SUPERVISOR.PROJECT_IDEAS);
    // Handle different response formats from backend
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  },

  createProjectIdea: async (payload: {
    title: string;
    description: string;
    technologies?: string[];
    requirements?: string;
  }) => {
    const response = await apiClient.post(ENDPOINTS.SUPERVISOR.PROJECT_IDEAS, payload);
    return response.data;
  },

  updateProjectIdea: async (
    ideaId: string,
    payload: {
      title?: string;
      description?: string;
      technologies?: string[];
      requirements?: string;
    }
  ) => {
    const response = await apiClient.put(
      ENDPOINTS.SUPERVISOR.PROJECT_IDEA_BY_ID(ideaId),
      payload
    );
    return response.data;
  },

  deleteProjectIdea: async (ideaId: string) => {
    const response = await apiClient.delete(ENDPOINTS.SUPERVISOR.PROJECT_IDEA_BY_ID(ideaId));
    return response.data;
  },

  // Proposals Management
  getProposals: async () => {
    const response = await apiClient.get(ENDPOINTS.SUPERVISOR.PROPOSALS);
    // Handle different response formats
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  },

  getProposalById: async (proposalId: string) => {
    const response = await apiClient.get(ENDPOINTS.SUPERVISOR.PROPOSAL_BY_ID(proposalId));
    return response.data.data || response.data;
  },

  approveProposal: async (proposalId: string, payload: { comments?: string }) => {
    const response = await apiClient.put(
      ENDPOINTS.SUPERVISOR.PROPOSAL_APPROVE(proposalId),
      payload
    );
    return response.data;
  },

  rejectProposal: async (proposalId: string, payload: { reason: string }) => {
    const response = await apiClient.put(
      ENDPOINTS.SUPERVISOR.PROPOSAL_REJECT(proposalId),
      payload
    );
    return response.data;
  },

  addProposalComment: async (proposalId: string, payload: { comment: string }) => {
    const response = await apiClient.put(
      ENDPOINTS.SUPERVISOR.PROPOSAL_COMMENT(proposalId),
      payload
    );
    return response.data;
  },

  // Documents Management
  getDocuments: async () => {
    const response = await apiClient.get(ENDPOINTS.SUPERVISOR.DOCUMENTS);
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  },

  downloadDocument: async (documentId: string) => {
    const response = await apiClient.get(
      ENDPOINTS.SUPERVISOR.DOCUMENT_DOWNLOAD(documentId),
      { responseType: 'blob' }
    );
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'document.zip');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return response.data;
  },

  approveDocument: async (documentId: string, payload: { comments?: string }) => {
    const response = await apiClient.put(
      ENDPOINTS.SUPERVISOR.DOCUMENT_APPROVE(documentId),
      payload
    );
    return response.data;
  },

  rejectDocument: async (documentId: string, payload: { reason: string }) => {
    const response = await apiClient.put(
      ENDPOINTS.SUPERVISOR.DOCUMENT_REJECT(documentId),
      payload
    );
    return response.data;
  },

  addDocumentFeedback: async (documentId: string, payload: { feedback: string }) => {
    const response = await apiClient.put(
      ENDPOINTS.SUPERVISOR.DOCUMENT_FEEDBACK(documentId),
      payload
    );
    return response.data;
  },

  // Evaluations Management
  getFinalEvaluations: async () => {
    const response = await apiClient.get(ENDPOINTS.SUPERVISOR.FINAL_EVALUATIONS);
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  },

  addFinalMarks: async (projectId: string, payload: {
    proposalMarks: number;
    implementationMarks: number;
    documentationMarks: number;
    presentationMarks: number;
    githubMarks: number;
    totalMarks: number;
  }) => {
    const response = await apiClient.put(
      ENDPOINTS.SUPERVISOR.FINAL_EVALUATION_MARKS(projectId),
      payload
    );
    return response.data;
  },

  addFinalFeedback: async (projectId: string, payload: { feedback: string }) => {
    const response = await apiClient.put(
      ENDPOINTS.SUPERVISOR.FINAL_EVALUATION_FEEDBACK(projectId),
      payload
    );
    return response.data;
  },

  completeEvaluation: async (projectId: string) => {
    const response = await apiClient.put(ENDPOINTS.SUPERVISOR.FINAL_EVALUATION_COMPLETE(projectId));
    return response.data;
  },

  // Panels and Schedules
  getMyPanels: async () => {
    const response = await apiClient.get(ENDPOINTS.SUPERVISOR.MY_PANELS);
    // Backend returns nested structure: { statusCode, message, data: { message, totalPanels, panels }, timestamp }
    if (response.data?.data) {
      return response.data.data; // Returns { message, totalPanels, panels }
    }
    if (Array.isArray(response.data)) {
      return { panels: response.data };
    }
    return response.data;
  },

  getMyPanelSchedules: async () => {
    const response = await apiClient.get(ENDPOINTS.SUPERVISOR.MY_PANEL_SCHEDULES);
    // Backend returns nested structure: { statusCode, message, data: { message, totalSchedules, schedules }, timestamp }
    if (response.data?.data) {
      return response.data.data; // Returns { message, totalSchedules, schedules }
    }
    if (Array.isArray(response.data)) {
      return { schedules: response.data };
    }
    return response.data;
  },

  getAssignedGroupsSchedules: async () => {
    const response = await apiClient.get(ENDPOINTS.SUPERVISOR.ASSIGNED_GROUPS_SCHEDULES);
    // Backend returns nested structure: { statusCode, message, data: { message, totalAssignedGroups, scheduledCount, unscheduledCount, schedules, unscheduledGroups }, timestamp }
    if (response.data?.data) {
      return response.data.data; // Returns { message, totalAssignedGroups, scheduledCount, unscheduledCount, schedules, unscheduledGroups }
    }
    if (Array.isArray(response.data)) {
      return { schedules: response.data, unscheduledGroups: [], totalAssignedGroups: 0, scheduledCount: 0, unscheduledCount: 0 };
    }
    return response.data;
  },

  // Profile Management
  getProfile: async () => {
    const response = await apiClient.get(ENDPOINTS.SUPERVISOR.PROFILE);
    if (response.data?.data) {
      return response.data.data;
    }
    return response.data;
  },

  updateProfile: async (payload: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    designation?: string;
    specialization?: string;
    researchInterests?: string[];
    officeLocation?: string;
    officeHours?: string;
    maxStudents?: number;
  }) => {
    const response = await apiClient.patch(ENDPOINTS.SUPERVISOR.UPDATE_PROFILE, payload);
    return response.data;
  },

  updatePassword: async (payload: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await apiClient.patch(ENDPOINTS.SUPERVISOR.UPDATE_PASSWORD, payload);
    return response.data;
  },

  // Announcements
  getAnnouncements: async (): Promise<StudentAnnouncement[]> => {
    const response = await apiClient.get(ENDPOINTS.SUPERVISOR.ANNOUNCEMENTS);
    return response.data.data || response.data;
  },

  getAnnouncementById: async (id: string): Promise<StudentAnnouncement> => {
    const response = await apiClient.get(ENDPOINTS.SUPERVISOR.ANNOUNCEMENT_BY_ID(id));
    return response.data.data || response.data;
  },
};

import apiClient from './axios';
import { SupervisorDashboardResponse, GroupsListResponse, GroupDetails, ApproveIdeaPayload, RejectIdeaPayload } from '../types/supervisor.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

export const supervisorApi = {
  getDashboard: async (): Promise<SupervisorDashboardResponse> => {
    const response = await apiClient.get<SupervisorDashboardResponse>(
      `${API_BASE_URL}/dashboard/supervisor`
    );
    return response.data;
  },

  // Groups Management
  getAssignedGroups: async (): Promise<GroupDetails[]> => {
    const response = await apiClient.get<{ statusCode: number; message: string; data: GroupDetails[]; timestamp: string }>(
      `${API_BASE_URL}/supervisor/assigned-groups`
    );
    return response.data.data;
  },

  getAssignedGroupById: async (groupId: string): Promise<GroupDetails> => {
    const response = await apiClient.get<{ statusCode: number; message: string; data: GroupDetails; timestamp: string }>(
      `${API_BASE_URL}/supervisor/assigned-groups/${groupId}`
    );
    return response.data.data;
  },

  // Custom Ideas Approval
  getCustomIdeas: async () => {
    const response = await apiClient.get(`${API_BASE_URL}/supervisor/custom-ideas`);
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
      `${API_BASE_URL}/supervisor/custom-ideas/${ideaId}/approve`,
      payload
    );
    return response.data;
  },

  rejectCustomIdea: async (ideaId: string, payload: RejectIdeaPayload) => {
    const response = await apiClient.put(
      `${API_BASE_URL}/supervisor/custom-ideas/${ideaId}/reject`,
      payload
    );
    return response.data;
  },

  // Selected Ideas Approval
  getSelectedIdeas: async () => {
    const response = await apiClient.get(`${API_BASE_URL}/supervisor/selected-ideas`);
    return response.data;
  },

  approveSelectedIdea: async (ideaId: string, payload: ApproveIdeaPayload) => {
    const response = await apiClient.put(
      `${API_BASE_URL}/supervisor/selected-ideas/${ideaId}/approve`,
      payload
    );
    return response.data;
  },

  rejectSelectedIdea: async (ideaId: string, payload: RejectIdeaPayload) => {
    const response = await apiClient.put(
      `${API_BASE_URL}/supervisor/selected-ideas/${ideaId}/reject`,
      payload
    );
    return response.data;
  },

  // Project Ideas Management
  getOwnProjectIdeas: async () => {
    const response = await apiClient.get(`${API_BASE_URL}/supervisor/project-ideas`);
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
    const response = await apiClient.post(`${API_BASE_URL}/supervisor/project-ideas`, payload);
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
      `${API_BASE_URL}/supervisor/project-ideas/${ideaId}`,
      payload
    );
    return response.data;
  },

  deleteProjectIdea: async (ideaId: string) => {
    const response = await apiClient.delete(`${API_BASE_URL}/supervisor/project-ideas/${ideaId}`);
    return response.data;
  },

  // Proposals Management
  getProposals: async () => {
    const response = await apiClient.get(`${API_BASE_URL}/supervisor/proposals`);
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
    const response = await apiClient.get(`${API_BASE_URL}/supervisor/proposals/${proposalId}`);
    return response.data.data || response.data;
  },

  approveProposal: async (proposalId: string, payload: { comments?: string }) => {
    const response = await apiClient.put(
      `${API_BASE_URL}/supervisor/proposals/${proposalId}/approve`,
      payload
    );
    return response.data;
  },

  rejectProposal: async (proposalId: string, payload: { reason: string }) => {
    const response = await apiClient.put(
      `${API_BASE_URL}/supervisor/proposals/${proposalId}/reject`,
      payload
    );
    return response.data;
  },

  addProposalComment: async (proposalId: string, payload: { comment: string }) => {
    const response = await apiClient.put(
      `${API_BASE_URL}/supervisor/proposals/${proposalId}/comment`,
      payload
    );
    return response.data;
  },
};

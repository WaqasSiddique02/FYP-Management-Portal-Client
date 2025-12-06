import apiClient from './axios';
import { ENDPOINTS } from './endpoints';

export const projectAPI = {
  getSupervisorIdeas: async () => {
    const response = await apiClient.get(ENDPOINTS.PROJECT.SUPERVISOR_IDEAS);
    return response.data;
  },

  selectIdea: async (ideaId: string) => {
    const response = await apiClient.post(ENDPOINTS.PROJECT.SELECT_IDEA, { ideaId });
    return response.data;
  },

  requestCustomIdea: async (title: string, description: string) => {
    const response = await apiClient.post(ENDPOINTS.PROJECT.REQUEST_CUSTOM_IDEA, {
      title,
      description,
    });
    return response.data;
  },

  getMyProject: async () => {
    const response = await apiClient.get(ENDPOINTS.PROJECT.MY_PROJECT);
    return response.data;
  },

  submitGithub: async (repositoryUrl: string) => {
    const response = await apiClient.post(ENDPOINTS.PROJECT.SUBMIT_GITHUB, {
      repositoryUrl,
    });
    return response.data;
  },

  getMyGithub: async () => {
    const response = await apiClient.get(ENDPOINTS.PROJECT.MY_GITHUB);
    return response.data;
  },
};

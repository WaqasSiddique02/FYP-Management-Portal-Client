import apiClient from './axios';
import { ENDPOINTS } from './endpoints';

export const documentAPI = {
  // Proposal APIs
  uploadProposal: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(ENDPOINTS.PROPOSAL.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  submitProposal: async (proposalId: string) => {
    const response = await apiClient.put(ENDPOINTS.PROPOSAL.SUBMIT(proposalId));
    return response.data;
  },

  // Get all documents (includes proposal and other documents)
  getMyDocuments: async () => {
    const response = await apiClient.get(ENDPOINTS.DOCUMENTS.MY_DOCUMENTS);
    return response.data;
  },

  // Document APIs
  uploadDocument: async (file: File, documentType: string, description?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    if (description) {
      formData.append('description', description);
    }
    
    const response = await apiClient.post(ENDPOINTS.DOCUMENTS.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  downloadFile: (filePath: string) => {
    // Convert backslashes to forward slashes for URL
    const normalizedPath = filePath.replace(/\\/g, '/');
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/${normalizedPath}`;
  },

  // GitHub APIs
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

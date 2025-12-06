import apiClient from './axios';
import { ENDPOINTS } from './endpoints';

export const studentAPI = {
  registerFYP: async (departmentId: string) => {
    const response = await apiClient.post(ENDPOINTS.STUDENT.REGISTER_FYP, { departmentId });
    return response.data;
  },

  getDepartments: async () => {
    const response = await apiClient.get(ENDPOINTS.STUDENT.DEPARTMENTS);
    return response.data.data || response.data;
  },

  searchStudents: async (query: string) => {
    const response = await apiClient.get(ENDPOINTS.STUDENT.SEARCH, {
      params: { search: query }
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get(ENDPOINTS.STUDENT.PROFILE);
    return response.data;
  },
};

export const groupAPI = {
  createGroup: async (groupName: string, members: string[]) => {
    const response = await apiClient.post(ENDPOINTS.GROUP.CREATE, {
      groupName,
      members,
    });
    return response.data;
  },

  getMyGroup: async () => {
    const response = await apiClient.get(ENDPOINTS.GROUP.MY_GROUP);
    return response.data;
  },

  addMember: async (groupId: string, memberId: string) => {
    const response = await apiClient.put(ENDPOINTS.GROUP.ADD_MEMBER(groupId), {
      memberId,
    });
    return response.data;
  },

  removeMember: async (groupId: string, memberId: string) => {
    const response = await apiClient.put(ENDPOINTS.GROUP.REMOVE_MEMBER(groupId, memberId));
    return response.data;
  },

  leaveGroup: async (groupId: string) => {
    const response = await apiClient.put(ENDPOINTS.GROUP.LEAVE(groupId));
    return response.data;
  },
};

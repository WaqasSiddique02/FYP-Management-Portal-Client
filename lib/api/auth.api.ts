import apiClient from "./axios";
import { ENDPOINTS } from "./endpoints";
import {
  LoginCredentials,
  StudentRegisterData,
  AuthResponse,
} from "../types/auth.types";

export const authAPI = {

  student: {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      const { data } = await apiClient.post(
        ENDPOINTS.STUDENT.LOGIN,
        credentials
      );
      return data.data;
    },
    register: async (
      registerData: StudentRegisterData
    ): Promise<AuthResponse> => {
      const { data } = await apiClient.post(
        ENDPOINTS.STUDENT.REGISTER,
        registerData
      );
      return data.data;
    },
    getProfile: async () => {
      const { data } = await apiClient.get(ENDPOINTS.STUDENT.PROFILE);
      return data.data;
    },
  },


  supervisor: {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      const { data } = await apiClient.post(
        ENDPOINTS.SUPERVISOR.LOGIN,
        credentials
      );
      const responseData = data.data;

      if (!responseData.user) {
        return {
          message: responseData.message,
          token: responseData.token,
          user: {
            id: responseData.id,
            email: credentials.email,
            name: responseData.name,
            role: "SUPERVISOR" as any,
            department: responseData.department,
            specialization: responseData.specialization,
            officeLocation: responseData.officeLocation,
          },
        };
      }

      return responseData;
    },
    getProfile: async () => {
      const { data } = await apiClient.get(ENDPOINTS.SUPERVISOR.PROFILE);
      const profileData = data.data;

      if (!profileData.user && profileData.id) {
        return {
          id: profileData.id,
          email: profileData.email,
          name: profileData.name,
          role: "SUPERVISOR" as any,
          department: profileData.department,
          specialization: profileData.specialization,
          officeLocation: profileData.officeLocation,
        };
      }

      return profileData;
    },
    setPassword: async (passwordData: {
      currentPassword?: string;
      newPassword: string;
    }) => {
      const { data } = await apiClient.patch(
        ENDPOINTS.SUPERVISOR.SET_PASSWORD,
        passwordData
      );
      return data.data;
    },
    updateProfile: async (profileData: any) => {
      const { data } = await apiClient.patch(
        ENDPOINTS.SUPERVISOR.UPDATE_PROFILE,
        profileData
      );
      return data.data;
    },
  },

  coordinator: {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      const { data } = await apiClient.post(
        ENDPOINTS.COORDINATOR.LOGIN,
        credentials
      );
      return data.data;
    },
    getProfile: async () => {
      const { data } = await apiClient.get(ENDPOINTS.COORDINATOR.PROFILE);
      return data.data;
    },
  },
};

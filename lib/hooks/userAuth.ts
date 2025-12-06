import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '../api/auth.api';
import { setToken, setUserData, removeToken } from '../utils/token';
import { LoginCredentials, StudentRegisterData } from '../types/auth.types';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loginStudent = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.student.login(credentials);
      console.log('Login response:', response);
      console.log('Token:', response.token);
      console.log('User:', response.user);
      console.log('Response keys:', Object.keys(response));
      
      setToken(response.token);
      setUserData(response.user);
      router.push('/student/dashboard');
      return response;
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginSupervisor = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.supervisor.login(credentials);
      setToken(response.token);
      setUserData(response.user);
      router.push('/supervisor/dashboard');
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginCoordinator = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.coordinator.login(credentials);
      setToken(response.token);
      setUserData(response.user);
      router.push('/coordinator/dashboard');
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerStudent = async (data: StudentRegisterData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.student.register(data);
      setToken(response.token);
      setUserData(response.user);
      router.push('/student/dashboard');
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    router.push('/');
  };

  return {
    loginStudent,
    loginSupervisor,
    loginCoordinator,
    registerStudent,
    logout,
    loading,
    error,
  };
};
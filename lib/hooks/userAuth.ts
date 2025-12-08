import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '../api/auth.api';
import { setToken, setUserData, removeToken } from '../utils/token';
import { LoginCredentials, StudentRegisterData } from '../types/auth.types';
import { useAuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setUser, setToken: setContextToken } = useAuthContext();

  const loginStudent = async (credentials: LoginCredentials, rememberMe: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear any old data first
      removeToken();
      
      const response = await authAPI.student.login(credentials);
      
      setToken(response.token, rememberMe);
      setUserData(response.user, rememberMe);
      
      // Update AuthContext state
      setContextToken(response.token);
      setUser(response.user);
      
      // Small delay to ensure state is saved before navigation
      await new Promise(resolve => setTimeout(resolve, 200));
      router.replace('/student/dashboard');
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginSupervisor = async (credentials: LoginCredentials, rememberMe: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.supervisor.login(credentials);
      setToken(response.token, rememberMe);
      setUserData(response.user, rememberMe);
      
      // Update AuthContext state
      setContextToken(response.token);
      setUser(response.user);
      
      // Small delay to ensure state is saved before navigation
      await new Promise(resolve => setTimeout(resolve, 100));
      router.replace('/supervisor/dashboard');
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginCoordinator = async (credentials: LoginCredentials, rememberMe: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.coordinator.login(credentials);
      setToken(response.token, rememberMe);
      setUserData(response.user, rememberMe);
      
      // Update AuthContext state
      setContextToken(response.token);
      setUser(response.user);
      
      // Small delay to ensure state is saved before navigation
      await new Promise(resolve => setTimeout(resolve, 100));
      router.replace('/coordinator/dashboard');
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
      console.log('Register response:', response);
      console.log('Token:', response.token);
      console.log('User:', response.user);
      router.push('/student/login');
      return response;
    } catch (err: any) {
      console.error('Registration error:', err);
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
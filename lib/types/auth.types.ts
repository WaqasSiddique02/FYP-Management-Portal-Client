export interface LoginCredentials {
  email: string;
  password: string;
}

export interface StudentRegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  rollNumber: string;
  department: string;
  semester: string;
  program: string;
  phoneNumber: string;
  cgpa: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface User {
  id?: string;
  _id?: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  role: string;
  rollNumber?: string;
  registrationNumber?: string;
  department?: string;
  batch?: string;
  semester?: string;
  program?: string;
  phoneNumber?: string;
  cgpa?: number;
  specialization?: string;
  officeLocation?: string;
  designation?: string;
  isRegisteredForFYP?: boolean;
  isRegisteredForFyp?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export enum UserRole {
  STUDENT = 'STUDENT',
  SUPERVISOR = 'SUPERVISOR',
  COORDINATOR = 'COORDINATOR',
}

export interface SetPasswordData {
  currentPassword?: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface UpdateProfileData {
  name?: string;
  department?: string;
  specialization?: string;
  officeLocation?: string;
  phoneNumber?: string;
}

export interface AuthError {
  message: string;
  statusCode?: number;
  error?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: AuthError | null;
}
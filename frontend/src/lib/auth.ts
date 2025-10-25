import { apiService, User as ApiUser } from './api';

export type UserRole = 'doctor' | 'user';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  fullname?: string;
  username?: string;
  avatar?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
}

export interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
}

export interface RegisterData {
  fullname: string;
  username: string;
  email: string;
  password: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
}

export interface DoctorRegisterData {
  fullname: string;
  username: string;
  email: string;
  password: string;
  specialization: string;
  licenseNumber: string;
  hospital: string;
  phone: string;
}

// Convert API user to frontend user format
const convertApiUserToUser = (apiUser: ApiUser): User => {
  return {
    id: apiUser._id,
    email: apiUser.email,
    role: apiUser.role as UserRole,
    name: apiUser.fullname,
    fullname: apiUser.fullname,
    username: apiUser.username,
    avatar: apiUser.avatar,
    age: apiUser.age,
    gender: apiUser.gender,
    phone: apiUser.phone,
  };
};

export const login = async (credentials: LoginCredentials): Promise<User | null> => {
  try {
    const response = await apiService.login(credentials);
    const user = convertApiUserToUser(response.data.user);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    return user;
  } catch (error) {
    console.error('Login failed:', error);
    return null;
  }
};

export const loginDoctor = async (credentials: LoginCredentials): Promise<User | null> => {
  try {
    const response = await apiService.loginDoctor(credentials);
    const user = convertApiUserToUser(response.data.doctor);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    return user;
  } catch (error) {
    console.error('Doctor login failed:', error);
    return null;
  }
};

export const register = async (userData: RegisterData): Promise<User | null> => {
  try {
    const response = await apiService.register(userData);
    const user = convertApiUserToUser(response.data);
    return user;
  } catch (error) {
    console.error('Registration failed:', error);
    return null;
  }
};

export const registerDoctor = async (doctorData: DoctorRegisterData): Promise<User | null> => {
  try {
    const response = await apiService.registerDoctor(doctorData);
    const user = convertApiUserToUser(response.data);
    return user;
  } catch (error) {
    console.error('Doctor registration failed:', error);
    return null;
  }
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

export const logout = async (): Promise<void> => {
  try {
    await apiService.logout();
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

export const refreshAuthToken = async (): Promise<boolean> => {
  try {
    const response = await apiService.refreshToken();
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

export const isAuthenticated = (): boolean => {
  const user = getCurrentUser();
  const accessToken = localStorage.getItem('accessToken');
  return !!(user && accessToken);
};

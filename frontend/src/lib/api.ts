const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface ApiResponse<T = any> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  fullname: string;
  avatar?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username?: string;
  email?: string;
  password: string;
}

export interface RegisterRequest {
  fullname: string;
  username: string;
  email: string;
  password: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
}

export interface DoctorRegisterRequest {
  fullname: string;
  username: string;
  email: string;
  password: string;
  specialization: string;
  licenseNumber: string;
  hospital: string;
  phone: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      credentials: 'include', // Important for cookies
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async loginDoctor(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/doctors/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
    return this.request<User>('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async registerDoctor(doctorData: DoctorRegisterRequest): Promise<ApiResponse<User>> {
    return this.request<User>('/doctors/register', {
      method: 'POST',
      body: JSON.stringify(doctorData),
    });
  }

  async logout(): Promise<ApiResponse<{}>> {
    return this.request<{}>('/users/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/users/current-user');
  }

  async refreshToken(): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    return this.request<{ accessToken: string; refreshToken: string }>('/users/refresh-token', {
      method: 'POST',
    });
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<{}>> {
    return this.request<{}>('/users/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  }

  async updateProfile(userData: Partial<RegisterRequest>): Promise<ApiResponse<User>> {
    return this.request<User>('/users/update-account', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }
}

export const apiService = new ApiService();
export default apiService;

import { apiService, User as ApiUser } from "./api";

export type UserRole = "doctor" | "user";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  fullname?: string;
  username?: string;
  avatar?: string;
  age?: number;
  gender?: "male" | "female" | "other";
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
  gender?: "male" | "female" | "other";
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

// 🔹 Convert API user to frontend user format
const convertApiUserToUser = (apiUser: ApiUser): User => {
  return {
    id: apiUser._id,
    email: apiUser.email,
    role: apiUser.role as UserRole,
    name: apiUser.fullname || apiUser.username,
    fullname: apiUser.fullname,
    username: apiUser.username,
    avatar: apiUser.avatar,
    age: apiUser.age,
    gender: apiUser.gender,
    phone: apiUser.phone,
  };
};

// 🔹 Common function to store auth data
const storeAuthData = (user: User, accessToken: string, refreshToken?: string) => {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("accessToken", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
};

// 🔹 Handle login for normal user
export const login = async (credentials: LoginCredentials): Promise<User | null> => {
  try {
    const response = await apiService.login(credentials);
    const apiUser = response.data.user || response.data.data?.user;

    if (!apiUser) throw new Error("Invalid user data");

    const user = convertApiUserToUser(apiUser);
    storeAuthData(user, response.data.accessToken, response.data.refreshToken);
    return user;
  } catch (error) {
    console.error("Login failed:", error);
    return null;
  }
};

// 🔹 Handle login for doctor
export const loginDoctor = async (credentials: LoginCredentials): Promise<User | null> => {
  try {
    const response = await apiService.loginDoctor(credentials);
    const apiUser = response.data.doctor || response.data.data?.doctor;

    if (!apiUser) throw new Error("Invalid doctor data");

    const user = convertApiUserToUser(apiUser);
    storeAuthData(user, response.data.accessToken, response.data.refreshToken);
    return user;
  } catch (error) {
    console.error("Doctor login failed:", error);
    return null;
  }
};

// 🔹 Register patient
export const register = async (userData: RegisterData): Promise<User | null> => {
  try {
    const response = await apiService.register(userData);
    const user = convertApiUserToUser(response.data);
    return user;
  } catch (error) {
    console.error("Registration failed:", error);
    return null;
  }
};

// 🔹 Register doctor
export const registerDoctor = async (doctorData: DoctorRegisterData): Promise<User | null> => {
  try {
    const response = await apiService.registerDoctor(doctorData);
    const user = convertApiUserToUser(response.data);
    return user;
  } catch (error) {
    console.error("Doctor registration failed:", error);
    return null;
  }
};

// 🔹 Get current logged-in user
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// 🔹 Logout user
export const logout = async (): Promise<void> => {
  try {
    await apiService.logout();
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
};

// 🔹 Refresh token
export const refreshAuthToken = async (): Promise<boolean> => {
  try {
    const response = await apiService.refreshToken();
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);
    return true;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return false;
  }
};

// 🔹 Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const user = getCurrentUser();
  const accessToken = localStorage.getItem("accessToken");
  return !!(user && accessToken);
};

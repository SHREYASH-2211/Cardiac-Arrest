export type UserRole = 'doctor' | 'user';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export const mockLogin = (email: string, password: string, role: UserRole): User | null => {
  // Mock authentication - in production this would validate against a backend
  if (password.length >= 6) {
    const user: User = {
      id: `${role}-${Date.now()}`,
      email,
      role,
      name: email.split('@')[0],
    };
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  }
  return null;
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem('user');
};

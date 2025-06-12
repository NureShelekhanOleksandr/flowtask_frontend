import axios from 'axios';
import { Task, TaskCreate } from '../types/task';
import { User, UserLogin, UserRegister, AuthToken } from '../types/user';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: UserLogin): Promise<AuthToken> => {
    const response = await apiClient.post<AuthToken>('/auth/login-json', credentials);
    return response.data;
  },

  register: async (userData: UserRegister): Promise<User> => {
    const response = await apiClient.post<User>('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },
};

export const userApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users/');
    return response.data;
  },

  getUser: async (id: number): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },
};

export const taskApi = {
  getTasks: async (status?: string, assignedTo?: number) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (assignedTo) params.append('assigned_to', assignedTo.toString());
    const response = await apiClient.get<Task[]>(`/tasks/?${params.toString()}`);
    return response.data;
  },

  getTask: async (id: number) => {
    const response = await apiClient.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (task: TaskCreate) => {
    const response = await apiClient.post<Task>('/tasks/', task);
    return response.data;
  },

  updateTask: async (id: number, task: TaskCreate) => {
    const response = await apiClient.put<Task>(`/tasks/${id}`, task);
    return response.data;
  },

  deleteTask: async (id: number) => {
    await apiClient.delete(`/tasks/${id}`);
  },
}; 
export enum TaskStatus {
  TODO = "To do",
  IN_PROGRESS = "In progress",
  DONE = "Done"
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  deadline?: string;
  assigned_user_id?: number;
  created_by_id?: number;
  created_at: string;
  attachment_url?: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  status: TaskStatus;
  deadline?: string;
  assigned_user_id?: number;
  attachment_url?: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface Comment {
  id: number;
  task_id: number;
  user_id: number;
  content: string;
  created_at: string;
}

export interface TaskHistory {
  id: number;
  task_id: number;
  user_id: number;
  change_type: string;
  change_description: string;
  changed_at: string;
} 
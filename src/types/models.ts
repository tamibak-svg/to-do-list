export type Project = {
  id: string;
  name: string;
  color?: string; // not in DB schema; generated client-side from id
  created_at: string;
  updated_at?: string;
};

export type TaskStatus = "todo" | "doing" | "done";

export type TaskPriority = 1 | 2 | 3;

export type Task = {
  id: string;
  project_id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null; // ISO date string YYYY-MM-DD
  order_index?: number;
  created_at?: string; // ISO timestamp from DB
  updated_at: string;  // ISO timestamp from DB
};

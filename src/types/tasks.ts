export type UpdateTaskPatch = {
  title?: string;
  description?: string | null;
  status?: "todo" | "doing" | "done";
  priority?: 1 | 2 | 3;
  due_date?: string | null;
  for_whom?: string | null;
  completed_at?: string | null;
};

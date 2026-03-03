"use server";

import { createClient } from "@/lib/supabase/server";
import type { Task, TaskStatus, TaskPriority } from "@/types/models";

// ── Types ────────────────────────────────────────────────────────────────────

export type CreateTaskInput = {
  project_id: string;
  title: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
};

export type UpdateTaskPatch = Partial<
  Pick<Task, "title" | "status" | "priority" | "due_date">
>;

// ── Auth helper ──────────────────────────────────────────────────────────────

async function getAuthedClient() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("לא מחובר – יש להתחבר מחדש");
  return { supabase, user };
}

// ── Actions ──────────────────────────────────────────────────────────────────

export async function listTasks(projectId?: string): Promise<Task[]> {
  const { supabase } = await getAuthedClient();
  let query = supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: true });
  if (projectId) query = query.eq("project_id", projectId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as Task[];
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const { supabase, user } = await getAuthedClient();
  // user_id is always set server-side — never trusted from the client.
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      project_id: input.project_id,
      title: input.title,
      status: input.status ?? "todo",
      priority: input.priority ?? 2,
      due_date: input.due_date ?? null,
      user_id: user.id,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Task;
}

export async function updateTask(
  id: string,
  patch: UpdateTaskPatch
): Promise<Task> {
  const { supabase } = await getAuthedClient();
  const { data, error } = await supabase
    .from("tasks")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Task;
}

export async function deleteTask(id: string): Promise<void> {
  const { supabase } = await getAuthedClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

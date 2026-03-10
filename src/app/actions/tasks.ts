"use server";

import { createClient } from "@/lib/supabase/server";
import type { CreateTaskInput, UpdateTaskPatch } from "@/types/models";

export type { UpdateTaskPatch };

/* -------------------- */
/* LIST TASKS           */
/* -------------------- */

export async function listTasks() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading tasks:", error);
    return [];
  }

  return data;
}

/* -------------------- */
/* CREATE TASK          */
/* -------------------- */

export async function createTask(input: CreateTaskInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      project_id: input.project_id,
      title: input.title,
      for_whom: input.for_whom ?? null,
      description: input.description ?? null,
      status: input.status ?? "todo",
      priority: input.priority ?? 2,
      due_date: input.due_date ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating task:", error);
    throw error;
  }

  return data;
}

/* -------------------- */
/* UPDATE TASK          */
/* -------------------- */

export async function updateTask(id: string, patch: UpdateTaskPatch) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating task:", error);
    throw error;
  }

  return data;
}

/* -------------------- */
/* DELETE TASK          */
/* -------------------- */

export async function deleteTask(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
}

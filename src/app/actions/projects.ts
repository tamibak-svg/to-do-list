"use server";

import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/types/models";

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

export async function listProjects(): Promise<Project[]> {
  const { supabase } = await getAuthedClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as Project[];
}

export async function createProject(name: string): Promise<Project> {
  const { supabase, user } = await getAuthedClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({ name, user_id: user.id })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Project;
}

export async function updateProject(
  id: string,
  patch: Partial<Pick<Project, "name">>
): Promise<Project> {
  const { supabase } = await getAuthedClient();
  const { data, error } = await supabase
    .from("projects")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Project;
}

export async function deleteProject(id: string): Promise<void> {
  const { supabase } = await getAuthedClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

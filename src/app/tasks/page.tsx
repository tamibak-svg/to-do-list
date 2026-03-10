import { logout } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listProjects } from "@/app/actions/projects";
import { listTasks } from "@/app/actions/tasks";
import TasksClient from "./TasksClient";

/**
 * Server Component — runs on every request.
 * Authenticates, fetches data from Supabase, passes to the Client Component.
 * After any client-side mutation + router.refresh(), this re-runs automatically.
 */
export default async function TasksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [projects, tasks] = await Promise.all([
    listProjects(),
    listTasks(),
  ]);

  const userName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "משתמש";

  return (
    <div>
      <form action={logout}>
        <button
          type="submit"
          style={{
            background: "#ef4444",
            color: "white",
            padding: "6px 12px",
            borderRadius: "6px"
          }}
        >
          Logout
        </button>
      </form>

      <TasksClient
        initialProjects={projects}
        initialTasks={tasks}
        userName={userName}
      />
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import type { Project, Task, TaskStatus } from "@/types/models";
import AppShell from "@/components/AppShell";
import ProjectsSidebar from "@/components/ProjectsSidebar";
import TasksTable from "@/components/TasksTable";
import {
  createProject,
  deleteProject,
} from "@/app/actions/projects";
import {
  createTask,
  updateTask,
  deleteTask,
  type UpdateTaskPatch,
} from "@/app/actions/tasks";

// ── Deterministic color from project id (no DB column needed) ────────────────
const PALETTE = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444",
  "#3b82f6", "#8b5cf6", "#ec4899",
];
function projectColor(id: string): string {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

// ── Edit Modal ───────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "לביצוע",
  doing: "בתהליך",
  done: "הושלם",
};

type EditModalProps = {
  task: Task;
  onSave: (patch: UpdateTaskPatch) => Promise<void>;
  onClose: () => void;
};

function EditModal({ task, onSave, onClose }: EditModalProps) {
  const [title, setTitle] = useState(task.title);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<1 | 2 | 3>(task.priority);
  const [dueDate, setDueDate] = useState(task.due_date ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onSave({
      title: title.trim(),
      status,
      priority,
      due_date: dueDate || undefined,
    });
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">עריכת משימה</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">כותרת המשימה</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6c3fff]/50 focus:border-[#6c3fff] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">סטטוס</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6c3fff]/50 focus:border-[#6c3fff] transition-colors bg-white"
            >
              {(Object.entries(STATUS_LABELS) as [TaskStatus, string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">עדיפות</label>
            <div className="flex gap-2">
              {([1, 2, 3] as const).map((p) => {
                const labels: Record<number, string> = { 1: "גבוהה", 2: "בינונית", 3: "נמוכה" };
                const colors: Record<number, string> = {
                  1: "border-red-300 bg-red-50 text-red-700",
                  2: "border-amber-300 bg-amber-50 text-amber-700",
                  3: "border-gray-300 bg-gray-50 text-gray-600",
                };
                return (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2 text-sm rounded-lg border-2 font-medium transition-all ${
                      priority === p ? colors[p] : "border-gray-200 text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    {labels[p]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">תאריך יעד</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6c3fff]/50 focus:border-[#6c3fff] transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="flex-1 bg-[#6c3fff] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[#5a2de0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "שומר..." : "שמירה"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Client Component ────────────────────────────────────────────────────

type Props = {
  initialProjects: Project[];
  initialTasks: Task[];
  userName?: string;
};

export default function TasksClient({ initialProjects, initialTasks, userName }: Props) {
  // Hydrate with colors (generated from ID, stable across renders)
  const [projects, setProjects] = useState<Project[]>(
    initialProjects.map((p) => ({ ...p, color: p.color ?? projectColor(p.id) }))
  );
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialProjects[0]?.id ?? ""
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const filteredTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.project_id === selectedProjectId)
        .filter(
          (t) =>
            searchQuery === "" ||
            t.title.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    [tasks, selectedProjectId, searchQuery]
  );

  const stats = useMemo(() => {
    const projectTasks = tasks.filter((t) => t.project_id === selectedProjectId);
    return {
      total: projectTasks.length,
      done: projectTasks.filter((t) => t.status === "done").length,
      doing: projectTasks.filter((t) => t.status === "doing").length,
    };
  }, [tasks, selectedProjectId]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  function handleError(e: unknown) {
    setError(e instanceof Error ? e.message : "שגיאה לא ידועה");
  }

  // ── Task Handlers ──────────────────────────────────────────────────────────

  const handleAddTask = async (title: string) => {
    if (!selectedProjectId) return;
    setError(null);
    try {
      const newTask = await createTask({
        project_id: selectedProjectId,
        title,
        status: "todo",
        priority: 2,
      });
      setTasks((prev) => [...prev, newTask]);
    } catch (e) {
      handleError(e);
    }
  };

  const handleNewTaskFromHeader = async () => {
    const title = window.prompt("שם המשימה החדשה:");
    if (title?.trim()) await handleAddTask(title.trim());
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    setError(null);
    try {
      const updated = await updateTask(taskId, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (e) {
      // Revert optimistic update on failure
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, status: tasks.find((x) => x.id === taskId)!.status } : t
        )
      );
      handleError(e);
    }
  };

  const handleDelete = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setError(null);
    try {
      await deleteTask(taskId);
    } catch (e) {
      handleError(e);
    }
  };

  const handleSaveEdit = async (patch: UpdateTaskPatch) => {
    if (!editingTask) return;
    setError(null);
    try {
      const updated = await updateTask(editingTask.id, patch);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setEditingTask(null);
    } catch (e) {
      handleError(e);
    }
  };

  // ── Project Handlers ───────────────────────────────────────────────────────

  const handleAddProject = async (name: string) => {
    setError(null);
    try {
      const newProject = await createProject(name);
      const withColor = { ...newProject, color: projectColor(newProject.id) };
      setProjects((prev) => [...prev, withColor]);
      setSelectedProjectId(newProject.id);
    } catch (e) {
      handleError(e);
    }
  };

  const handleDeleteProject = async (id: string) => {
    setError(null);
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setTasks((prev) => prev.filter((t) => t.project_id !== id));
      // Select the first remaining project
      const remaining = projects.filter((p) => p.id !== id);
      setSelectedProjectId(remaining[0]?.id ?? "");
    } catch (e) {
      handleError(e);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <AppShell
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onNewTask={handleNewTaskFromHeader}
        userName={userName}
        sidebar={
          <ProjectsSidebar
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            onAddProject={handleAddProject}
            onDeleteProject={handleDeleteProject}
          />
        }
      >
        <div className="p-5 md:p-8 max-w-5xl mx-auto">
          {/* Error banner */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span>⚠</span>
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600 font-bold"
              >
                ×
              </button>
            </div>
          )}

          {/* No projects yet */}
          {projects.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#6c3fff]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                </svg>
              </div>
              <p className="text-gray-700 font-semibold">אין פרויקטים עדיין</p>
              <p className="text-gray-400 text-sm mt-1">לחץ על &apos;+ פרויקט חדש&apos; בסרגל הצד כדי להתחיל</p>
            </div>
          )}

          {/* Project view */}
          {selectedProjectId && (
            <>
              {/* Page title + stats */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                  {selectedProject?.color && (
                    <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: selectedProject.color }} />
                  )}
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedProject?.name ?? "משימות"}
                  </h2>
                </div>

                <div className="flex flex-wrap gap-3 mt-3">
                  {[
                    { label: "סה״כ משימות", value: stats.total, color: "bg-gray-100 text-gray-600" },
                    { label: "בתהליך", value: stats.doing, color: "bg-blue-100 text-blue-700" },
                    { label: "הושלמו", value: stats.done, color: "bg-emerald-100 text-emerald-700" },
                  ].map((stat) => (
                    <div key={stat.label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${stat.color}`}>
                      <span className="text-base font-bold">{stat.value}</span>
                      <span>{stat.label}</span>
                    </div>
                  ))}
                  {searchQuery && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700">
                      <span>סינון: &quot;{searchQuery}&quot;</span>
                      <button onClick={() => setSearchQuery("")} className="hover:text-amber-900 font-bold">×</button>
                    </div>
                  )}
                </div>
              </div>

              <TasksTable
                tasks={filteredTasks}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onAddTask={handleAddTask}
                onEdit={(task) => setEditingTask(task)}
              />
            </>
          )}
        </div>
      </AppShell>

      {editingTask && (
        <EditModal
          task={editingTask}
          onSave={handleSaveEdit}
          onClose={() => setEditingTask(null)}
        />
      )}
    </>
  );
}

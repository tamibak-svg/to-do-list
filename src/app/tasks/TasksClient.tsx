"use client";

import { useState, useMemo } from "react";
import type { Project, Task, TaskStatus, TaskPriority } from "@/types/models";
import AppShell from "@/components/AppShell";
import ProjectsSidebar from "@/components/ProjectsSidebar";
import TasksTable from "@/components/TasksTable";
import { createProject, deleteProject } from "@/app/actions/projects";
import {
  createTask,
  updateTask,
  deleteTask,
} from "@/app/actions/tasks";
import type { UpdateTaskPatch } from "@/types/tasks";
// ── Deterministic color from project id ──────────────────────────────────────
const PALETTE = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444",
  "#3b82f6", "#8b5cf6", "#ec4899",
];
function projectColor(id: string): string {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

// ── Shared UI constants ───────────────────────────────────────────────────────
const INPUT_CLS =
  "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 " +
  "focus:outline-none focus:ring-2 focus:ring-[#6c3fff]/50 focus:border-[#6c3fff] transition-colors bg-white";
const LABEL_CLS = "block text-sm font-medium text-gray-700 mb-1.5";

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "לביצוע",
  doing: "בתהליך",
  done: "הושלם",
};

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 1, label: "גבוהה" },
  { value: 2, label: "בינונית" },
  { value: 3, label: "נמוכה" },
];

// ── Close (X) button shared icon ─────────────────────────────────────────────
function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

// ── Modal overlay wrapper ─────────────────────────────────────────────────────
function ModalOverlay({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────

type EditModalProps = {
  task: Task;
  onSave: (patch: UpdateTaskPatch) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
};

function EditModal({ task, onSave, onDelete, onClose }: EditModalProps) {
  const [title, setTitle] = useState(task.title);
  const [forWhom, setForWhom] = useState(task.for_whom ?? "");
  const [description, setDescription] = useState(task.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [dueDate, setDueDate] = useState(task.due_date ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onSave({
      title: title.trim(),
      for_whom: forWhom.trim() || null,
      description: description.trim() || null,
      status,
      priority,
      due_date: dueDate || null,
      // Set completed_at when first marking done; clear it when un-done
      completed_at:
        status === "done" && task.status !== "done"
          ? new Date().toISOString()
          : status !== "done"
          ? null
          : task.completed_at ?? null,
    });
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("למחוק את המשימה לצמיתות?")) return;
    setDeleting(true);
    await onDelete();
    setDeleting(false);
  };

  return (
    <ModalOverlay onClose={onClose}>
      {/* Sticky header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
        <h2 className="text-lg font-bold text-gray-900">עריכת משימה</h2>
        <CloseButton onClick={onClose} />
      </div>

      {/* Fields */}
      <div className="px-5 py-4 space-y-4">
        {/* Title */}
        <div>
          <label className={LABEL_CLS}>כותרת המשימה</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className={INPUT_CLS}
            placeholder="כותרת..."
          />
        </div>

        {/* for_whom */}
        <div>
          <label className={LABEL_CLS}>עבור</label>
          <input
            value={forWhom}
            onChange={(e) => setForWhom(e.target.value)}
            className={INPUT_CLS}
            placeholder="למי המשימה מיועדת?"
          />
        </div>

        {/* Description — large free-text area */}
        <div>
          <label className={LABEL_CLS}>פרטים ותוכן</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className={`${INPUT_CLS} resize-y min-h-[80px]`}
            placeholder="תיאור, לינקים, הוראות, מספרים, הערות..."
          />
        </div>

        {/* Priority + Status — two columns */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>עדיפות</label>
            <select
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value) as TaskPriority)}
              className={INPUT_CLS}
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLS}>סטטוס</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className={INPUT_CLS}
            >
              {(Object.entries(STATUS_LABELS) as [TaskStatus, string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Due date */}
        <div>
          <label className={LABEL_CLS}>תאריך יעד</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={INPUT_CLS}
          />
        </div>
      </div>

      {/* Footer: delete left, cancel+save right */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {deleting ? "מוחק..." : "מחיקת משימה"}
        </button>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ביטול
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="px-4 py-2 text-sm font-semibold bg-[#6c3fff] text-white rounded-lg hover:bg-[#5a2de0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "שומר..." : "שמירה"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

// ── New Task Modal ────────────────────────────────────────────────────────────

type NewTaskInput = {
  title: string;
  for_whom?: string;
  description?: string;
  priority: TaskPriority;
  due_date?: string;
};

type NewTaskModalProps = {
  onAdd: (input: NewTaskInput) => Promise<void>;
  onClose: () => void;
};

function NewTaskModal({ onAdd, onClose }: NewTaskModalProps) {
  const [title, setTitle] = useState("");
  const [forWhom, setForWhom] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>(2);
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await onAdd({
      title: title.trim(),
      for_whom: forWhom.trim() || undefined,
      description: description.trim() || undefined,
      priority,
      due_date: dueDate || undefined,
    });
    setSaving(false);
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">משימה חדשה</h2>
        <CloseButton onClick={onClose} />
      </div>

      <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
        {/* Title */}
        <div>
          <label className={LABEL_CLS}>
            כותרת <span className="text-red-400">*</span>
          </label>
          <input
            autoFocus
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={INPUT_CLS}
            placeholder="שם המשימה..."
          />
        </div>

        {/* for_whom */}
        <div>
          <label className={LABEL_CLS}>עבור</label>
          <input
            value={forWhom}
            onChange={(e) => setForWhom(e.target.value)}
            className={INPUT_CLS}
            placeholder="למי המשימה מיועדת?"
          />
        </div>

        {/* Priority + Due date — two columns */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLS}>עדיפות</label>
            <select
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value) as TaskPriority)}
              className={INPUT_CLS}
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLS}>תאריך יעד</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={INPUT_CLS}
            />
          </div>
        </div>

        {/* Description — optional */}
        <div>
          <label className={LABEL_CLS}>
            פרטים{" "}
            <span className="text-gray-400 font-normal text-xs">(אופציונלי)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`${INPUT_CLS} resize-y`}
            placeholder="תיאור, לינקים, הוראות..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            ביטול
          </button>
          <button
            type="submit"
            disabled={!title.trim() || saving}
            className="flex-1 bg-[#6c3fff] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-[#5a2de0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-[#6c3fff]/20"
          >
            {saving ? "יוצר..." : "יצירת משימה"}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}

// ── Main Client Component ─────────────────────────────────────────────────────

type Props = {
  initialProjects: Project[];
  initialTasks: Task[];
  userName?: string;
};

export default function TasksClient({ initialProjects, initialTasks, userName }: Props) {
  const [projects, setProjects] = useState<Project[]>(
    initialProjects.map((p) => ({ ...p, color: p.color ?? projectColor(p.id) }))
  );
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialProjects[0]?.id ?? ""
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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

  function handleError(e: unknown) {
    setError(e instanceof Error ? e.message : "שגיאה לא ידועה");
  }

  // ── Task handlers ──────────────────────────────────────────────────────────

  // Quick-add from the inline bottom input (title only)
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

  // Full-create from the NewTaskModal
  const handleAddFullTask = async (input: NewTaskInput) => {
    if (!selectedProjectId) return;
    setError(null);
    try {
      const newTask = await createTask({
        project_id: selectedProjectId,
        status: "todo",
        ...input,
      });
      setTasks((prev) => [...prev, newTask]);
      setNewTaskOpen(false);
    } catch (e) {
      handleError(e);
    }
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
      // Revert on failure
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

  const handleDeleteFromModal = async () => {
    if (!editingTask) return;
    await handleDelete(editingTask.id);
    setEditingTask(null);
  };

  // ── Project handlers ───────────────────────────────────────────────────────

  // Selects a project and closes the mobile sidebar so the task list is visible
  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    setIsMobileSidebarOpen(false);
  };

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
        onNewTask={() => setNewTaskOpen(true)}
        userName={userName}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        onCloseMobileSidebar={() => setIsMobileSidebarOpen(false)}
        sidebar={
          <ProjectsSidebar
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={handleSelectProject}
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
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 font-bold">
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
          onDelete={handleDeleteFromModal}
          onClose={() => setEditingTask(null)}
        />
      )}

      {newTaskOpen && (
        <NewTaskModal
          onAdd={handleAddFullTask}
          onClose={() => setNewTaskOpen(false)}
        />
      )}
    </>
  );
}

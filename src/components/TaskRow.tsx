"use client";

import type { Task, TaskPriority, TaskStatus } from "@/types/models";

type Props = {
  task: Task;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "לביצוע",
  doing: "בתהליך",
  done: "הושלם",
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "bg-gray-100 text-gray-600",
  doing: "bg-blue-100 text-blue-700",
  done: "bg-emerald-100 text-emerald-700",
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  1: "גבוהה (1)",
  2: "בינונית (2)",
  3: "נמוכה (3)",
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  1: "text-red-600 font-semibold",
  2: "text-amber-600",
  3: "text-gray-400",
};

const PRIORITY_DOT: Record<TaskPriority, string> = {
  1: "bg-red-500",
  2: "bg-amber-400",
  3: "bg-gray-300",
};

export default function TaskRow({ task, onStatusChange, onDelete, onEdit }: Props) {
  const done = task.status === "done";

  return (
    <tr className="hover:bg-purple-50/40 transition-colors group border-b border-gray-100 last:border-0">
      {/* Title */}
      <td className="px-4 py-3 min-w-[200px]">
        <div className="flex items-center gap-2">
          {/* Priority dot */}
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[task.priority]}`}
          />
          <span
            className={`text-sm font-medium ${
              done ? "line-through text-gray-400" : "text-gray-800"
            }`}
          >
            {task.title}
          </span>
        </div>
      </td>

      {/* for_whom */}
      <td className="px-4 py-3">
        <span className="text-sm text-gray-600">{task.for_whom || "—"}</span>
      </td>

      {/* Status — dropdown styled as badge */}
      <td className="px-4 py-3 whitespace-nowrap">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6c3fff]/50 appearance-none ${STATUS_COLORS[task.status]}`}
        >
          {(Object.entries(STATUS_LABELS) as [TaskStatus, string][]).map(
            ([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            )
          )}
        </select>
      </td>

      {/* Priority */}
      <td className="px-4 py-3 whitespace-nowrap">
        <span className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>
          {PRIORITY_LABELS[task.priority]}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="text-xs text-[#6c3fff] hover:text-[#5a2de0] font-medium px-2 py-1 rounded-md hover:bg-[#6c3fff]/10 transition-colors"
          >
            עריכה
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
          >
            מחיקה
          </button>
        </div>
      </td>
    </tr>
  );
}

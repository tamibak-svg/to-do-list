"use client";

import type { Task, TaskStatus } from "@/types/models";
import TaskRow from "./TaskRow";
import NewTaskInput from "./NewTaskInput";

type Props = {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  onAddTask: (title: string) => void;
  onEdit: (task: Task) => void;
  isLoading?: boolean;
};

const COL_HEADERS = [
  { label: "כותרת", className: "min-w-[200px]" },
  { label: "סטטוס", className: "" },
  { label: "עדיפות", className: "" },
  { label: "תאריך יעד", className: "" },
  { label: "עודכן", className: "" },
  { label: "פעולות", className: "" },
];

export default function TasksTable({
  tasks,
  onStatusChange,
  onDelete,
  onAddTask,
  onEdit,
  isLoading = false,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Scrollable table wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {COL_HEADERS.map((col) => (
                <th
                  key={col.label}
                  className={`px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide ${col.className}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* Loading state */}
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-[#6c3fff] border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm">טוען משימות...</p>
                  </div>
                </td>
              </tr>
            )}

            {/* Empty state */}
            {!isLoading && tasks.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-8 h-8 text-[#6c3fff]/50"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-700 font-semibold">אין משימות עדיין</p>
                      <p className="text-gray-400 text-sm mt-1">
                        לחץ על &apos;משימה חדשה&apos; כדי להתחיל
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            )}

            {/* Task rows */}
            {!isLoading &&
              tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
          </tbody>
        </table>
      </div>

      {/* New task input at the bottom */}
      <NewTaskInput onAdd={onAddTask} />
    </div>
  );
}

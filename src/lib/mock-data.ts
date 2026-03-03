import type { Project, Task } from "@/types/models";

export const MOCK_PROJECTS: Project[] = [
  {
    id: "p1",
    name: "פרויקט אישי",
    color: "#6366f1",
    created_at: "2026-01-01",
  },
  {
    id: "p2",
    name: "עבודה",
    color: "#10b981",
    created_at: "2026-01-05",
  },
  {
    id: "p3",
    name: "לימודים",
    color: "#f59e0b",
    created_at: "2026-01-10",
  },
];

export const MOCK_TASKS: Task[] = [
  {
    id: "t1",
    project_id: "p1",
    title: "לקנות מצרכים",
    status: "todo",
    priority: 2,
    due_date: "2026-03-15",
    updated_at: "2026-03-01",
  },
  {
    id: "t2",
    project_id: "p1",
    title: "לתאם פגישה עם רופא",
    status: "doing",
    priority: 1,
    due_date: "2026-03-10",
    updated_at: "2026-03-02",
  },
  {
    id: "t3",
    project_id: "p1",
    title: "לשלם חשבונות",
    status: "done",
    priority: 3,
    updated_at: "2026-02-28",
  },
  {
    id: "t4",
    project_id: "p2",
    title: "להכין מצגת רבעונית",
    status: "doing",
    priority: 1,
    due_date: "2026-03-20",
    updated_at: "2026-03-03",
  },
  {
    id: "t5",
    project_id: "p2",
    title: "לכתוב דוח שבועי",
    status: "todo",
    priority: 2,
    updated_at: "2026-03-01",
  },
  {
    id: "t6",
    project_id: "p2",
    title: "לשלוח הצעת מחיר ללקוח",
    status: "todo",
    priority: 1,
    due_date: "2026-03-12",
    updated_at: "2026-03-02",
  },
  {
    id: "t7",
    project_id: "p3",
    title: "לסיים פרק 5 בספר",
    status: "todo",
    priority: 3,
    due_date: "2026-03-25",
    updated_at: "2026-03-01",
  },
  {
    id: "t8",
    project_id: "p3",
    title: "לפתור תרגילים בסטטיסטיקה",
    status: "doing",
    priority: 2,
    due_date: "2026-03-18",
    updated_at: "2026-03-03",
  },
];

// Utility: returns a new today string for updated_at
export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

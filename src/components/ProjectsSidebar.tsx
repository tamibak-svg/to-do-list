"use client";

import { useState } from "react";
import type { Project } from "@/types/models";

type Props = {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  onAddProject: (name: string) => void;
  onDeleteProject?: (id: string) => void;
};

export default function ProjectsSidebar({
  projects,
  selectedProjectId,
  onSelectProject,
  onAddProject,
  onDeleteProject,
}: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (trimmed) {
      onAddProject(trimmed);
      setNewName("");
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") {
      setIsAdding(false);
      setNewName("");
    }
  };

  return (
    <div className="w-60 bg-[#1e1e38] text-white flex flex-col h-full select-none">
      {/* Sidebar header */}
      <div className="px-4 pt-5 pb-3">
        <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-widest mb-1">
          פרויקטים
        </p>
      </div>

      {/* Projects list */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
        {projects.map((project) => {
          const isSelected = project.id === selectedProjectId;
          return (<button
            type="button"
            key={project.id}
            onClick={() => onSelectProject(project.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-right touch-manipulation ${
              isSelected
                ? "bg-[#6c3fff] text-white shadow-md shadow-[#6c3fff]/30"
                : "text-gray-300 hover:bg-white/8 hover:text-white"
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.color ?? "#6366f1" }}
            />
            <span className="flex-1 truncate font-medium">{project.name}</span>
            {isSelected && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5 text-white/60 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-white/10" />

      {/* Add project section */}
      <div className="p-3">
        {isAdding ? (
          <div className="space-y-2">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="שם הפרויקט..."
              maxLength={40}
              className="w-full bg-white/10 text-white placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6c3fff] border border-white/10"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="flex-1 bg-[#6c3fff] text-white text-sm py-1.5 rounded-lg hover:bg-[#5a2de0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                הוסף
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewName("");
                }}
                className="flex-1 bg-white/10 text-gray-300 text-sm py-1.5 rounded-lg hover:bg-white/15 transition-colors"
              >
                ביטול
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>פרויקט חדש</span>
          </button>
        )}
      </div>
    </div>
  );
}

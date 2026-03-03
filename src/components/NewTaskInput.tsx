"use client";

import { useState } from "react";

type Props = {
  onAdd: (title: string) => void;
};

export default function NewTaskInput({ onAdd }: Props) {
  const [value, setValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const trimmed = value.trim();
      if (trimmed) {
        onAdd(trimmed);
        setValue("");
      }
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-100 group">
      <div className="w-5 h-5 rounded border-2 border-dashed border-gray-300 group-focus-within:border-[#6c3fff] transition-colors flex-shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="הקלד משימה ולחץ Enter להוספה..."
        className="flex-1 text-sm text-gray-700 placeholder-gray-400 bg-transparent focus:outline-none"
      />
      {value.trim() && (
        <span className="text-xs text-gray-400 flex-shrink-0">Enter ↵</span>
      )}
    </div>
  );
}

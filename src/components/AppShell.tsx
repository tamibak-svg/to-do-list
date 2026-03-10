"use client";


import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  searchValue: string;
  onSearchChange: (v: string) => void;
  onNewTask: () => void;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  userName?: string;
  isMobileSidebarOpen: boolean;
  onOpenMobileSidebar: () => void;
  onCloseMobileSidebar: () => void;
};

export default function AppShell({
  searchValue,
  onSearchChange,
  onNewTask,
  sidebar,
  children,
  userName = "משתמש",
  isMobileSidebarOpen,
  onOpenMobileSidebar,
  onCloseMobileSidebar,
}: Props) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* ===== HEADER ===== */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm z-20">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Mobile: sidebar toggle */}
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="פתח פרויקטים"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo + App name */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-[#6c3fff] rounded-lg flex items-center justify-center shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
            <span className="text-base font-bold text-gray-900 hidden sm:block">
              Smart Personal Todo
            </span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-sm mx-auto">
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-gray-400 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="חיפוש משימות..."
                className="w-full bg-gray-100 border border-gray-200 rounded-lg pr-9 pl-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6c3fff]/40 focus:bg-white focus:border-[#6c3fff]/50 transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onNewTask}
              className="flex items-center gap-1.5 bg-[#6c3fff] text-white px-3.5 py-2 rounded-lg text-sm font-semibold hover:bg-[#5a2de0] transition-colors shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">משימה חדשה</span>
            </button>

            {/* User menu */}
            <div className="flex items-center gap-2 pr-2 border-r border-gray-200 mr-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6c3fff] to-[#10b981] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-xs font-medium text-gray-700">שלום, {userName}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-400 hover:text-[#6c3fff] transition-colors text-right"
                >
                  התנתקות
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ===== BODY: Sidebar + Main ===== */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar — appears on RIGHT in RTL (first child in flex-row RTL) */}
        <aside className="hidden md:block h-full flex-shrink-0">{sidebar}</aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={onCloseMobileSidebar}
            />
            {/* Sidebar panel — on the right side for RTL */}
            <aside
              className="absolute top-0 bottom-0 right-0 z-10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-full">
                {/* Close button */}
                <button
                  onClick={onCloseMobileSidebar}
                  className="absolute top-3 left-3 z-10 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="סגור"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {sidebar}
              </div>
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] px-4">
      {/* Logo area */}
      <div className="flex flex-col items-center gap-6 mb-12">
        <div className="w-20 h-20 bg-[#6c3fff] rounded-2xl flex items-center justify-center shadow-lg shadow-[#6c3fff]/40">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-10 h-10"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        </div>

        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            Smart Personal Todo
          </h1>
          <p className="text-lg text-blue-200/80 max-w-md">
            נהל את המשימות שלך בצורה חכמה, מסודרת ויעילה
          </p>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-sm">
        <Link
          href="/login"
          className="flex-1 text-center px-8 py-3.5 bg-[#6c3fff] text-white rounded-xl font-semibold hover:bg-[#5a2de0] transition-all shadow-lg shadow-[#6c3fff]/30 hover:shadow-[#6c3fff]/50 hover:-translate-y-0.5"
        >
          התחברות
        </Link>
        <Link
          href="/signup"
          className="flex-1 text-center px-8 py-3.5 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20 backdrop-blur-sm"
        >
          הרשמה
        </Link>
      </div>

      {/* Skip to demo */}
      <Link
        href="/tasks"
        className="mt-8 text-blue-300/60 hover:text-blue-300 text-sm transition-colors underline underline-offset-4"
      >
        המשך ישירות לאפליקציה ←
      </Link>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-2 mt-16 max-w-lg">
        {["ניהול פרויקטים", "עדיפויות", "מעקב סטטוס", "חיפוש מהיר", "ממשק RTL"].map(
          (f) => (
            <span
              key={f}
              className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-blue-200/70"
            >
              {f}
            </span>
          )
        )}
      </div>
    </main>
  );
}

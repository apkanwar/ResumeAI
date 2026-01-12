import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function HomeNav({ variant = "home", tokenLabel = "--" }) {
  const isDashboard = variant === "dashboard";

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-rose-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-[#f97316] to-[#fb7185] bg-clip-text text-transparent">
                ResumeAI
              </span>
            </Link>
          </div>
          {isDashboard ? (
            <div className="hidden items-center gap-8 sm:flex">
              <Link href="/faq" className="text-lg font-semibold text-slate-700 hover:text-rose-600 transition-colors">
                FAQ
              </Link>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-6 py-1 shadow-sm">
                <span className="text-rose-600 uppercase tracking-wide text-xs">Tokens</span>
                <span className="text-slate-900 font-semibold text-base">{tokenLabel}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-8">
              <Link
                href="/faq"
                className="hidden text-lg font-semibold text-slate-700 transition-colors hover:text-rose-600 sm:inline-flex"
              >
                FAQ
              </Link>
              <Link
                href="/dashboard"
                className="bg-gradient-to-r from-[#f97316] to-[#fb7185] text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:shadow-orange-200/60 transition-all transform hover:scale-105"
              >
                Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

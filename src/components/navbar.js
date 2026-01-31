import Image from "next/image";
import Link from "next/link";
import { CircleQuestionMark } from "lucide-react";

export default function Navbar({ variant = "home", tokenLabel = "--" }) {
  const isDashboard = variant === "dashboard";

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.png" alt="ResumeAnalyzer logo" width={32} height={32} />
              <span className="text-2xl font-bold bg-gradient-to-r from-[#f97316] to-[#fb7185] bg-clip-text text-transparent">
                Resume Analyzer
              </span>
            </Link>
          </div>
          {isDashboard ? (
            <div className="hidden items-center gap-8 sm:flex uppercase tracking-wide text-base">
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 text-base font-semibold text-slate-700 border-slate-200 border rounded-full bg-white/80 px-4 py-1 shadow-sm hover:text-top-orange hover:bg-top-orange/10 transition-colors"
              >
                <CircleQuestionMark className="h-4 w-4" aria-hidden="true" />
                FAQ
              </Link>
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-6 py-1 shadow-sm">
                <span className="text-top-orange uppercase tracking-wide text-xs">Tokens</span>
                <span className="text-slate-900 font-semibold text-base">{tokenLabel}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-8">
              <Link
                href="/faq"
                className="hidden items-center gap-2 text-base font-semibold text-slate-700 transition-colors border rounded-full shadow-sm border-slate-200 bg-white/80 px-4 py-1 hover:text-top-orange hover:bg-top-orange/10 sm:inline-flex"
              >
                <CircleQuestionMark className="h-4 w-4" aria-hidden="true" />
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

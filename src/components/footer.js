import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 text-slate-500 sm:flex-row sm:items-center">
        <p>&copy; {new Date().getFullYear()} Resume Analyzer. All Rights Reserved.</p>
        <div className="flex flex-row xl:flex-col gap-1">
          <Link href="/privacy" className="text-sm text-slate-500 hover:text-slate-700">
            Privacy Policy
          </Link>
          <Link href="/tos" className="text-sm text-slate-500 hover:text-slate-700">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}

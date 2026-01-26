import { useEffect } from "react";

export default function LoadingOverlay({ open, message }) {
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Loading"
    >
      <div className="w-full max-w-sm rounded-2xl border border-white/20 bg-white p-8 text-center shadow-xl py-24">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-top-orange" />
        <div className="mt-5 text-base font-semibold text-slate-900" aria-live="polite">
          {message || "Working..."}
        </div>
        <div className="mt-2 text-sm text-slate-600">This usually takes under a minute.</div>
      </div>
    </div>
  );
}


import { useEffect } from "react";

export default function DeleteAnalysisModal({
  open,
  onConfirm,
  onCancel,
  title = "Are you sure you want to delete this analysis?",
  description = "This action cannot be undone.",
  confirmLabel = "Yes",
  cancelLabel = "No",
}) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onCancel?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-[2px] bg-black/20"
      role="dialog"
      aria-modal="true"
      aria-label="Confirm delete analysis"
    >
      <div className="w-full max-w-sm rounded-2xl border border-white/20 bg-white p-8 text-center shadow-xl">
        <div className="text-base font-semibold text-slate-900">{title}</div>
        <div className="mt-2 text-sm text-slate-600">{description}</div>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-5 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white hover:bg-red-600"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

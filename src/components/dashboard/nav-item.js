export default function DashboardNavItem({
  active = false,
  label,
  onClick,
  Icon,
  variant = "default",
  className = "",
}) {
  const base = "w-full text-left rounded-xl px-4 py-2 font-semibold transition-colors flex items-center gap-3";

  const stylesByVariant = {
    default: active
      ? "bg-top-orange/20 text-slate-900"
      : "text-slate-600 hover:text-top-orange hover:bg-top-orange/10",
    danger: "text-slate-600 hover:text-white hover:bg-red-500",
  };

  const styles = stylesByVariant[variant] || stylesByVariant.default;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`${base} ${styles} ${className}`}
    >
      {Icon ? <Icon className="h-5 w-5 shrink-0" aria-hidden="true" /> : null}
      <span className="truncate">{label}</span>
    </button>
  );
}

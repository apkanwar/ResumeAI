const DEFAULT_ITEMS = [
  { value: "50K+", label: "Resumes Analyzed" },
  { value: "3x", label: "More Interviews" },
  { value: "95%", label: "Satisfaction Rate" },
];

export default function Numbers({
  items = DEFAULT_ITEMS,
  sectionClassName = "py-20 px-4 sm:px-6 lg:px-8 bg-white/70",
  labelClassName = "text-rose-600 text-lg",
}) {
  return (
    <section className={sectionClassName}>
      <div className="max-w-5xl mx-auto text-center">
        <div className="grid gap-10 md:grid-cols-3 text-center text-slate-900">
          {items.map((item, idx) => (
            <div key={`${item?.label || "stat"}-${idx}`}>
              <div className="text-5xl font-bold mb-2">{item.value}</div>
              <div className={labelClassName}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

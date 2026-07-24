export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface px-6 text-center">
      <Icon className="h-12 w-12 text-slate-300" aria-hidden="true" />
      <h3 className="mt-6 text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-2 max-w-md text-slate-500">{description}</p>
    </div>
  );
}

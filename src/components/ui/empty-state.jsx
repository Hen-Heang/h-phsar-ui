export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex h-96 flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-white/50">
      <Icon className="h-16 w-16 text-slate-200" />
      <h3 className="mt-6 text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-slate-500">{description}</p>
    </div>
  );
}

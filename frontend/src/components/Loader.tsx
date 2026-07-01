export default function Loader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-accent-400" />
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

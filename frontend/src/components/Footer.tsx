export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-400 md:flex-row">
        <p>© {new Date().getFullYear()} CivicLens AI. Built for the hackathon.</p>
        <p className="flex items-center gap-2">
          Powered by <span className="font-semibold text-slate-200">Google Cloud</span>
          <span className="text-slate-600">×</span>
          <span className="font-semibold text-slate-200">NVIDIA RAPIDS</span>
        </p>
      </div>
    </footer>
  );
}

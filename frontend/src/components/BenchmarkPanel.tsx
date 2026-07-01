import { motion } from "framer-motion";
import { BoltIcon } from "@heroicons/react/24/solid";
import type { BenchmarkResponse } from "../utils/types";
import { formatSeconds } from "../utils/format";

export default function BenchmarkPanel({ benchmark }: { benchmark: BenchmarkResponse }) {
  const maxTime = Math.max(benchmark.cpu_time_seconds, benchmark.gpu_time_seconds || 0) || 1;
  const cpuWidth = Math.max(8, (benchmark.cpu_time_seconds / maxTime) * 100);
  const gpuWidth = benchmark.gpu_time_seconds
    ? Math.max(8, (benchmark.gpu_time_seconds / maxTime) * 100)
    : 0;

  return (
    <div className="glass-card p-6">
      <div className="mb-5 flex items-center gap-2">
        <BoltIcon className="h-5 w-5 text-amber-400" />
        <h3 className="font-display text-lg font-bold text-white">CPU vs GPU Benchmark</h3>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-1 flex justify-between text-sm text-slate-300">
            <span>Pandas (CPU)</span>
            <span className="font-mono">{formatSeconds(benchmark.cpu_time_seconds)}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${cpuWidth}%` }}
              transition={{ duration: 0.6 }}
              className="h-full rounded-full bg-slate-400"
            />
          </div>
        </div>

        <div>
          <div className="mb-1 flex justify-between text-sm text-slate-300">
            <span>RAPIDS cuDF (GPU)</span>
            <span className="font-mono">{formatSeconds(benchmark.gpu_time_seconds)}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${gpuWidth}%` }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="h-full rounded-full bg-gradient-to-r from-accent-500 to-brand-500"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
        <span className="text-sm text-slate-400">Speedup</span>
        <span className="font-display text-xl font-bold text-accent-400">
          {benchmark.speedup ? `${benchmark.speedup}×` : "N/A"}
        </span>
      </div>
      {benchmark.note && (
        <p className="mt-3 text-xs text-slate-500">{benchmark.note}</p>
      )}
    </div>
  );
}

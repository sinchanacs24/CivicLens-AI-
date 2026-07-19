import { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { fetchWardDetail, extractErrorMessage } from "../services/api";
import type { WardDetail } from "../services/api";
import { formatNumber, riskColor } from "../utils/format";

interface Props {
  wardName: string;
  onClose: () => void;
}

export default function WardDetailModal({ wardName, onClose }: Props) {
  const [detail, setDetail] = useState<WardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchWardDetail(wardName)
      .then((d) => {
        if (active) setDetail(d);
      })
      .catch((err) => {
        if (active) setError(extractErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [wardName]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="glass-card max-h-[85vh] w-full max-w-2xl overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-2xl font-bold text-white">{wardName}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {loading && (
          <div className="flex items-center gap-3 py-10 text-slate-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-accent-400" />
            <span>Loading ward details...</span>
          </div>
        )}

        {error && !loading && (
          <p className="py-6 text-red-300">{error}</p>
        )}

        {detail && !loading && (
          <div className="space-y-6">
            {/* Key stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-lg font-bold text-white">{formatNumber(detail.total_complaints)}</p>
                <p className="text-xs text-slate-400">Complaints</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-lg font-bold text-white">{detail.risk.risk_score?.toFixed(1) ?? "—"}</p>
                <p className="text-xs text-slate-400">Risk Score</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-lg font-bold text-white">{formatNumber(detail.risk.open_cases ?? 0)}</p>
                <p className="text-xs text-slate-400">Open Cases</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p
                  className="text-lg font-bold"
                  style={{ color: riskColor[detail.risk.risk_level ?? "Low"] }}
                >
                  {detail.risk.risk_level ?? "—"}
                </p>
                <p className="text-xs text-slate-400">Risk Level</p>
              </div>
            </div>

            {/* Category breakdown */}
            <div>
              <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent-400">
                Complaints by Category
              </h4>
              <div className="space-y-1.5">
                {detail.by_category.slice(0, 8).map((c) => {
                  const max = detail.by_category[0]?.count || 1;
                  const pct = (c.count / max) * 100;
                  return (
                    <div key={c.category} className="flex items-center gap-3 text-sm">
                      <span className="w-40 shrink-0 truncate text-slate-300">{c.category}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-slate-400">{c.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status breakdown */}
            <div>
              <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent-400">
                Status Breakdown
              </h4>
              <div className="flex flex-wrap gap-2">
                {detail.by_status.map((s) => (
                  <span
                    key={s.status}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                  >
                    {s.status}: <span className="font-semibold text-white">{s.count}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import { useState } from "react";
import type { WardRisk } from "../utils/types";
import { formatNumber, riskColor } from "../utils/format";
import WardDetailModal from "./WardDetailModal";

export default function RiskTable({ wards }: { wards: WardRisk[] }) {
  const [selectedWard, setSelectedWard] = useState<string | null>(null);

  return (
    <>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="px-5 py-3 font-medium">Ward</th>
                <th className="px-5 py-3 font-medium">Complaints</th>
                <th className="px-5 py-3 font-medium">Open</th>
                <th className="px-5 py-3 font-medium">Resolved</th>
                <th className="px-5 py-3 font-medium">Population</th>
                <th className="px-5 py-3 font-medium">Risk Score</th>
                <th className="px-5 py-3 font-medium">Level</th>
              </tr>
            </thead>
            <tbody>
              {wards.map((w, idx) => (
                <tr
                  key={w.ward}
                  onClick={() => setSelectedWard(w.ward)}
                  className={`cursor-pointer border-b border-white/5 text-slate-200 transition hover:bg-white/[0.06] ${
                    idx % 2 === 0 ? "bg-white/[0.02]" : ""
                  }`}
                >
                  <td className="px-5 py-3 font-semibold">
                    <div className="flex items-center gap-2">
                      <span>{w.ward}</span>
                      {w.is_anomaly && (
                        <span
                          title="Complaint volume is a statistical outlier"
                          className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-400"
                        >
                          ⚠ Spike
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">{formatNumber(w.complaint_count)}</td>
                  <td className="px-5 py-3">{formatNumber(w.open_cases)}</td>
                  <td className="px-5 py-3">{formatNumber(w.resolved_cases)}</td>
                  <td className="px-5 py-3">{formatNumber(Math.round(w.population))}</td>
                  <td className="px-5 py-3 font-mono">{w.risk_score.toFixed(1)}</td>
                  <td className="px-5 py-3">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        color: riskColor[w.risk_level],
                        backgroundColor: `${riskColor[w.risk_level]}22`,
                      }}
                    >
                      {w.risk_level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedWard && (
        <WardDetailModal wardName={selectedWard} onClose={() => setSelectedWard(null)} />
      )}
    </>
  );
}
import type { WardRisk } from "../utils/types";
import { formatNumber, riskColor } from "../utils/format";

export default function RiskTable({ wards }: { wards: WardRisk[] }) {
  return (
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
                className={`border-b border-white/5 text-slate-200 ${
                  idx % 2 === 0 ? "bg-white/[0.02]" : ""
                }`}
              >
                <td className="px-5 py-3 font-semibold">{w.ward}</td>
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
  );
}

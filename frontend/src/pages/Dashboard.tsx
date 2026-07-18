import { useEffect } from "react";
import {
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useDashboard } from "../hooks/useDashboard";
import StatCard from "../components/StatCard";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import RiskTable from "../components/RiskTable";
import AiInsightsPanel from "../components/AiInsightsPanel";
import BenchmarkPanel from "../components/BenchmarkPanel";
import AskCivicLens from "../components/AskCivicLens";
import { generateReport } from "../utils/reportGenerator";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import {
  CategoryBarChart,
  ComplaintTrendChart,
  DepartmentWorkloadChart,
  RiskPieChart,
} from "../components/Charts";
import { formatNumber } from "../utils/format";

export default function Dashboard() {
  const {
    dashboard,
    risk,
    insights,
    benchmark,
    loading,
    aiLoading,
    benchmarkLoading,
    error,
    loadInsights,
    loadBenchmark,
  } = useDashboard();

  useEffect(() => {
    if (dashboard && !insights) loadInsights();
    if (dashboard && !benchmark) loadBenchmark();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboard]);

  if (loading) return <Loader label="Crunching your complaint data..." />;
  if (error || !dashboard) {
    return (
      <div className="py-16">
        <EmptyState message={error || "No dataset loaded yet."} />
      </div>
    );
  }

  const { summary } = dashboard;

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 text-slate-400">
            Insights for <span className="text-white">{dashboard.filename}</span> — processed
            with <span className="uppercase text-accent-400">{dashboard.engine_used}</span>
          </p>
        </div>
        <button
          onClick={() => generateReport(dashboard, risk)}
          className="btn-secondary text-sm"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          Download Report
        </button>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Complaints"
          value={formatNumber(summary.total_complaints)}
          icon={ChartBarIcon}
          accent="brand"
          delay={0}
        />
        <StatCard
          label="High Risk Wards"
          value={formatNumber(summary.high_risk_wards)}
          icon={ExclamationTriangleIcon}
          accent="red"
          delay={0.05}
        />
        <StatCard
          label="Resolved Cases"
          value={formatNumber(summary.resolved_cases)}
          icon={CheckCircleIcon}
          accent="green"
          delay={0.1}
        />
        <StatCard
          label="Pending Cases"
          value={formatNumber(summary.pending_cases)}
          icon={ClockIcon}
          accent="amber"
          delay={0.15}
        />
      </div>

      <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="mb-4 font-display text-lg font-bold text-white">Complaint Trend</h3>
          <ComplaintTrendChart data={dashboard.complaint_trend} />
        </div>
        <div className="glass-card p-6">
          <h3 className="mb-4 font-display text-lg font-bold text-white">Risk Distribution</h3>
          <RiskPieChart data={dashboard.risk_distribution} />
        </div>
      </div>

      <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h3 className="mb-4 font-display text-lg font-bold text-white">
            Complaints by Category
          </h3>
          <CategoryBarChart data={dashboard.complaints_by_category} />
        </div>
        <div className="glass-card p-6">
          <h3 className="mb-4 font-display text-lg font-bold text-white">
            Department Workload
          </h3>
          <DepartmentWorkloadChart data={dashboard.department_workload} />
        </div>
      </div>

      <div className="mb-10">
        <h3 className="mb-2 font-display text-lg font-bold text-white">
          Top Risk Wards
        </h3>
        <p className="mb-4 text-sm text-slate-400">
          Wards marked <span className="text-red-400">⚠ Spike</span> have an abnormally high complaint volume (statistical outlier).
        </p>
        <RiskTable wards={risk?.top_risk_wards || dashboard.ward_leaderboard} />
      </div>

      <div className="mb-10">
        <AskCivicLens />
      </div>
      
      <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {insights ? (
          <AiInsightsPanel insights={insights} />
        ) : (
          <div className="glass-card flex items-center justify-center p-10">
            <Loader label={aiLoading ? "Asking Gemini for recommendations..." : "Preparing AI summary..."} />
          </div>
        )}

        {benchmark ? (
          <BenchmarkPanel benchmark={benchmark} />
        ) : (
          <div className="glass-card flex items-center justify-center p-10">
            <Loader label={benchmarkLoading ? "Running CPU vs GPU benchmark..." : "Preparing benchmark..."} />
          </div>
        )}
      </div>
    </div>
  );
}

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type {
  CategoryCount,
  DepartmentWorkload,
  RiskDistributionPoint,
  TrendPoint,
} from "../utils/types";
import { categoryPalette, riskColor } from "../utils/format";

const tooltipStyle = {
  backgroundColor: "#0f172a",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "0.75rem",
  color: "#e2e8f0",
  fontSize: "0.8rem",
};

export function ComplaintTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
        <YAxis stroke="#94a3b8" fontSize={12} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#22d3ee"
          strokeWidth={2.5}
          dot={{ r: 2 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CategoryBarChart({ data }: { data: CategoryCount[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
        <XAxis type="number" stroke="#94a3b8" fontSize={12} />
        <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={11} width={140} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="count" radius={[0, 6, 6, 0]}>
          {data.map((_, idx) => (
            <Cell key={idx} fill={categoryPalette[idx % categoryPalette.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RiskPieChart({ data }: { data: RiskDistributionPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="risk_level"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={3}
        >
          {data.map((entry) => (
            <Cell key={entry.risk_level} fill={riskColor[entry.risk_level]} />
          ))}
        </Pie>
        <Legend wrapperStyle={{ fontSize: "0.8rem", color: "#94a3b8" }} />
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function DepartmentWorkloadChart({ data }: { data: DepartmentWorkload[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="department"
          stroke="#94a3b8"
          fontSize={10}
          angle={-20}
          textAnchor="end"
          height={70}
          interval={0}
        />
        <YAxis stroke="#94a3b8" fontSize={12} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: "0.8rem", color: "#94a3b8" }} />
        <Bar dataKey="total" name="Total" fill="#2955f5" radius={[6, 6, 0, 0]} />
        <Bar dataKey="open_cases" name="Open" fill="#f59e0b" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

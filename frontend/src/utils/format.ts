export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function formatSeconds(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(3)}s`;
}

export function formatPercent(part: number, total: number): string {
  if (total === 0) return "0%";
  return `${((part / total) * 100).toFixed(1)}%`;
}

export const riskColor: Record<string, string> = {
  Low: "#22c55e",
  Medium: "#f59e0b",
  High: "#ef4444",
};

export const categoryPalette = [
  "#2955f5",
  "#06b6d4",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
  "#22c55e",
  "#ec4899",
  "#14b8a6",
  "#eab308",
  "#6366f1",
  "#f97316",
  "#84cc16",
  "#0ea5e9",
  "#d946ef",
  "#64748b",
];

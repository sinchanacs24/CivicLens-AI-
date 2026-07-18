export interface UploadResponse {
  message: string;
  filename: string;
  engine_used: "pandas" | "cudf";
  rows_before_cleaning: number;
  rows_after_cleaning: number;
  rows_removed: number;
  load_seconds: number;
  clean_seconds: number;
  gcs_uri: string | null;
}

export interface DashboardSummary {
  total_complaints: number;
  high_risk_wards: number;
  resolved_cases: number;
  pending_cases: number;
}

export interface TrendPoint {
  month: string;
  count: number;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface RiskDistributionPoint {
  risk_level: "Low" | "Medium" | "High";
  count: number;
}

export interface WardRisk {
  ward: string;
  complaint_count: number;
  open_cases: number;
  resolved_cases: number;
  avg_rainfall: number;
  avg_traffic: number;
  population: number;
  risk_score: number;
  risk_level: "Low" | "Medium" | "High";
  is_anomaly?: boolean;
}

export interface DepartmentWorkload {
  department: string;
  total: number;
  open_cases: number;
}

export interface DashboardResponse {
  filename: string;
  engine_used: string;
  rows_after_cleaning: number;
  summary: DashboardSummary;
  complaint_trend: TrendPoint[];
  complaints_by_category: CategoryCount[];
  risk_distribution: RiskDistributionPoint[];
  ward_leaderboard: WardRisk[];
  department_workload: DepartmentWorkload[];
}

export interface RiskResponse {
  wards: WardRisk[];
  top_risk_wards: WardRisk[];
}

export interface GeminiInsights {
  summary: string;
  top_risks: string[];
  recommendations: string[];
  action_plan: string[];
  future_concerns: string[];
  source: string;
}

export interface BenchmarkResponse {
  cpu_time_seconds: number;
  gpu_time_seconds: number | null;
  gpu_available: boolean;
  speedup: number | null;
  note?: string;
}

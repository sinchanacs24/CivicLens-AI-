import { useCallback, useEffect, useState } from "react";
import {
  fetchAiInsights,
  fetchBenchmark,
  fetchDashboard,
  fetchRisk,
  extractErrorMessage,
} from "../services/api";
import type {
  BenchmarkResponse,
  DashboardResponse,
  GeminiInsights,
  RiskResponse,
} from "../utils/types";

interface DashboardState {
  dashboard: DashboardResponse | null;
  risk: RiskResponse | null;
  insights: GeminiInsights | null;
  benchmark: BenchmarkResponse | null;
  loading: boolean;
  aiLoading: boolean;
  benchmarkLoading: boolean;
  error: string | null;
}

export function useDashboard() {
  const [state, setState] = useState<DashboardState>({
    dashboard: null,
    risk: null,
    insights: null,
    benchmark: null,
    loading: true,
    aiLoading: false,
    benchmarkLoading: false,
    error: null,
  });

  const loadCore = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const [dashboard, risk] = await Promise.all([fetchDashboard(), fetchRisk()]);
      setState((s) => ({ ...s, dashboard, risk, loading: false }));
    } catch (err) {
      setState((s) => ({ ...s, loading: false, error: extractErrorMessage(err) }));
    }
  }, []);

  const loadInsights = useCallback(async () => {
    setState((s) => ({ ...s, aiLoading: true }));
    try {
      const insights = await fetchAiInsights();
      setState((s) => ({ ...s, insights, aiLoading: false }));
    } catch (err) {
      setState((s) => ({ ...s, aiLoading: false, error: extractErrorMessage(err) }));
    }
  }, []);

  const loadBenchmark = useCallback(async () => {
    setState((s) => ({ ...s, benchmarkLoading: true }));
    try {
      const benchmark = await fetchBenchmark();
      setState((s) => ({ ...s, benchmark, benchmarkLoading: false }));
    } catch (err) {
      setState((s) => ({ ...s, benchmarkLoading: false, error: extractErrorMessage(err) }));
    }
  }, []);

  useEffect(() => {
    loadCore();
  }, [loadCore]);

  return { ...state, reload: loadCore, loadInsights, loadBenchmark };
}

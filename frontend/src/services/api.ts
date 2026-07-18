import axios from "axios";
import type {
  BenchmarkResponse,
  DashboardResponse,
  GeminiInsights,
  RiskResponse,
  UploadResponse,
} from "../utils/types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
});

export async function uploadComplaintsCsv(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<UploadResponse>("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    },
  });
  return data;
}

export async function fetchDashboard(): Promise<DashboardResponse> {
  const { data } = await api.get<DashboardResponse>("/dashboard");
  return data;
}

export interface AskResponse {
  answer: string;
  source: string;
}

export async function askCivicLens(question: string): Promise<AskResponse> {
  const { data } = await api.post<AskResponse>("/ask", { question });
  return data;
}

export async function fetchRisk(): Promise<RiskResponse> {
  const { data } = await api.get<RiskResponse>("/risk");
  return data;
}

export async function fetchAiInsights(): Promise<GeminiInsights> {
  const { data } = await api.post<GeminiInsights>("/gemini");
  return data;
}

export async function fetchBenchmark(): Promise<BenchmarkResponse> {
  const { data } = await api.get<BenchmarkResponse>("/benchmark");
  return data;
}

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { detail?: string } | undefined)?.detail ||
      error.message
    );
  }
  return "Something went wrong. Please try again.";
}

import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpTrayIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { uploadComplaintsCsv, extractErrorMessage } from "../services/api";
import type { UploadResponse } from "../utils/types";
import { formatNumber, formatSeconds } from "../utils/format";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFile = useCallback((selected: File | null) => {
    if (!selected) return;
    if (!selected.name.toLowerCase().endsWith(".csv")) {
      setError("Only .csv files are supported.");
      setStatus("error");
      return;
    }
    setFile(selected);
    setStatus("idle");
    setError(null);
    setResult(null);
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    setProgress(0);
    setError(null);
    try {
      const data = await uploadComplaintsCsv(file, setProgress);
      setResult(data);
      setStatus("success");
    } catch (err) {
      setError(extractErrorMessage(err));
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <div className="mb-10 text-center">
        <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
          Upload Complaint Data
        </h1>
        <p className="mt-3 text-slate-400">
          Upload a CSV of civic complaints to generate a full risk dashboard.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFile(e.dataTransfer.files?.[0] ?? null);
        }}
        onClick={() => inputRef.current?.click()}
        className={`glass-card flex cursor-pointer flex-col items-center justify-center gap-4 border-2 border-dashed p-14 text-center transition ${
          dragActive ? "border-accent-400 bg-white/10" : "border-white/15"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        <ArrowUpTrayIcon className="h-10 w-10 text-accent-400" />
        <div>
          <p className="font-semibold text-white">
            {file ? file.name : "Drag & drop your CSV here"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "or click to browse"}
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={handleUpload}
          disabled={!file || status === "uploading"}
          className="btn-primary w-full sm:w-auto"
        >
          <DocumentTextIcon className="h-5 w-5" />
          {status === "uploading" ? "Processing..." : "Upload & Analyze"}
        </button>
      </div>

      {status === "uploading" && (
        <div className="mt-8">
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent-500 to-brand-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
          <p className="mt-2 text-center text-sm text-slate-400">{progress}% uploaded</p>
        </div>
      )}

      {status === "error" && error && (
        <div className="mt-8 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          <ExclamationCircleIcon className="h-6 w-6 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {status === "success" && result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 rounded-xl border border-green-500/30 bg-green-500/10 p-6"
        >
          <div className="mb-4 flex items-center gap-3 text-green-300">
            <CheckCircleIcon className="h-6 w-6" />
            <p className="font-semibold">{result.message}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-slate-300 sm:grid-cols-4">
            <div>
              <p className="text-slate-500">Engine</p>
              <p className="font-semibold uppercase text-white">{result.engine_used}</p>
            </div>
            <div>
              <p className="text-slate-500">Rows Cleaned</p>
              <p className="font-semibold text-white">
                {formatNumber(result.rows_after_cleaning)} / {formatNumber(result.rows_before_cleaning)}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Load Time</p>
              <p className="font-semibold text-white">{formatSeconds(result.load_seconds)}</p>
            </div>
            <div>
              <p className="text-slate-500">Clean Time</p>
              <p className="font-semibold text-white">{formatSeconds(result.clean_seconds)}</p>
            </div>
          </div>
          <button onClick={() => navigate("/dashboard")} className="btn-primary mt-6 w-full">
            View Dashboard
          </button>
        </motion.div>
      )}

      <p className="mt-8 text-center text-xs text-slate-600">
        Required columns: complaint_id, ward, category, priority, status, date, latitude,
        longitude, rainfall, traffic, population, department.
      </p>
    </div>
  );
}

"""
Runs a controlled CPU (Pandas) vs GPU (cuDF) benchmark over the same CSV so
the dashboard can display an honest speedup number. If cuDF/a GPU is not
available, the GPU time is reported as null and the frontend displays a
"GPU unavailable — showing CPU baseline" state instead of a fabricated number.
"""
from __future__ import annotations

import time
from typing import Any

import pandas as pd

from app.services.data_processing import gpu_available
from app.utils.cleaning import clean_dataframe


def _time_pandas(csv_path: str) -> float:
    t0 = time.perf_counter()
    df = pd.read_csv(csv_path)
    clean_dataframe(df)
    return time.perf_counter() - t0


def _time_cudf(csv_path: str) -> float | None:
    try:
        import cudf

        t0 = time.perf_counter()
        gdf = cudf.read_csv(csv_path)
        clean_dataframe(gdf)
        return time.perf_counter() - t0
    except Exception:
        return None


def run_benchmark(csv_path: str) -> dict[str, Any]:
    cpu_time = _time_pandas(csv_path)

    gpu_time = _time_cudf(csv_path) if gpu_available() else None

    result: dict[str, Any] = {
        "cpu_time_seconds": round(cpu_time, 4),
        "gpu_time_seconds": round(gpu_time, 4) if gpu_time is not None else None,
        "gpu_available": gpu_time is not None,
    }

    if gpu_time and gpu_time > 0:
        result["speedup"] = round(cpu_time / gpu_time, 2)
    else:
        result["speedup"] = None
        result["note"] = "GPU/cuDF not available in this environment — showing CPU baseline only."

    return result

"""
Data processing service.

Responsible for reading an uploaded CSV, choosing between the GPU-accelerated
(cuDF) or CPU (Pandas) execution path, and returning a cleaned dataframe plus
metadata about which engine ran and how long it took.
"""
from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Literal

import pandas as pd

from app.utils.cleaning import clean_dataframe, validate_columns

EngineName = Literal["cudf", "pandas"]


def gpu_available() -> bool:
    """Detect whether cuDF (and a usable GPU) is importable in this environment."""
    try:
        import cudf  # noqa: F401
        return True
    except Exception:
        return False


@dataclass
class ProcessingResult:
    dataframe: pd.DataFrame
    engine: EngineName
    load_seconds: float
    clean_seconds: float
    rows_before: int
    rows_after: int
    rows_removed: int


def load_and_clean(csv_path: str, force_engine: EngineName | None = None) -> ProcessingResult:
    """
    Load `csv_path` using cuDF if available (unless `force_engine="pandas"` is
    passed), clean it, and return a ProcessingResult. Always falls back to
    Pandas automatically if cuDF raises for any reason.
    """
    use_gpu = gpu_available() if force_engine is None else force_engine == "cudf"

    if use_gpu:
        try:
            import cudf

            t0 = time.perf_counter()
            gdf = cudf.read_csv(csv_path)
            load_seconds = time.perf_counter() - t0

            missing = validate_columns(gdf)
            if missing:
                raise ValueError(f"CSV missing required columns: {missing}")

            rows_before = len(gdf)
            t1 = time.perf_counter()
            gdf, removed = clean_dataframe(gdf)
            clean_seconds = time.perf_counter() - t1

            df = gdf.to_pandas()
            return ProcessingResult(
                dataframe=df,
                engine="cudf",
                load_seconds=load_seconds,
                clean_seconds=clean_seconds,
                rows_before=rows_before,
                rows_after=len(df),
                rows_removed=removed,
            )
        except Exception:
            # Any GPU/cuDF failure -> silently fall back to Pandas
            pass

    t0 = time.perf_counter()
    df = pd.read_csv(csv_path)
    load_seconds = time.perf_counter() - t0

    missing = validate_columns(df)
    if missing:
        raise ValueError(f"CSV missing required columns: {missing}")

    rows_before = len(df)
    t1 = time.perf_counter()
    df, removed = clean_dataframe(df)
    clean_seconds = time.perf_counter() - t1

    return ProcessingResult(
        dataframe=df,
        engine="pandas",
        load_seconds=load_seconds,
        clean_seconds=clean_seconds,
        rows_before=rows_before,
        rows_after=len(df),
        rows_removed=removed,
    )

"""
Ward-level risk scoring engine.

Combines complaint volume, rainfall, traffic, population and complaint
priority mix into a single normalized 0-100 risk score per ward, then buckets
each ward into Low / Medium / High risk.
"""
from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd

PRIORITY_WEIGHT = {"Low": 1, "Medium": 2, "High": 3, "Critical": 4}


def _minmax(series: pd.Series) -> pd.Series:
    lo, hi = series.min(), series.max()
    if hi - lo == 0:
        return pd.Series(np.zeros(len(series)), index=series.index)
    return (series - lo) / (hi - lo)


def compute_ward_risk(df: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregate the cleaned complaints dataframe to one row per ward with a
    composite risk score in [0, 100].
    """
    work = df.copy()
    work["priority_weight"] = work["priority"].map(PRIORITY_WEIGHT).fillna(2)

    grouped = work.groupby("ward").agg(
        complaint_count=("complaint_id", "count"),
        avg_rainfall=("rainfall", "mean"),
        avg_traffic=("traffic", "mean"),
        population=("population", "mean"),
        avg_priority_weight=("priority_weight", "mean"),
        open_cases=("status", lambda s: (s.isin(["Open", "Pending", "In Progress"])).sum()),
        resolved_cases=("status", lambda s: (s.isin(["Resolved", "Closed"])).sum()),
    ).reset_index()

    # Normalize each contributing factor to 0-1, then take a weighted blend.
    grouped["n_complaints"] = _minmax(grouped["complaint_count"])
    grouped["n_rainfall"] = _minmax(grouped["avg_rainfall"])
    grouped["n_traffic"] = _minmax(grouped["avg_traffic"])
    grouped["n_population"] = _minmax(grouped["population"])
    grouped["n_priority"] = _minmax(grouped["avg_priority_weight"])

    grouped["risk_score"] = (
        grouped["n_complaints"] * 35
        + grouped["n_priority"] * 30
        + grouped["n_rainfall"] * 15
        + grouped["n_traffic"] * 12
        + grouped["n_population"] * 8
    ).round(1)

    def bucket(score: float) -> str:
        if score >= 65:
            return "High"
        if score >= 35:
            return "Medium"
        return "Low"

    grouped["risk_level"] = grouped["risk_score"].apply(bucket)

    grouped = grouped.sort_values("risk_score", ascending=False).reset_index(drop=True)

    cols = [
        "ward",
        "complaint_count",
        "open_cases",
        "resolved_cases",
        "avg_rainfall",
        "avg_traffic",
        "population",
        "risk_score",
        "risk_level",
    ]
    return grouped[cols]


def top_risk_wards(risk_df: pd.DataFrame, n: int = 10) -> list[dict[str, Any]]:
    return risk_df.head(n).to_dict(orient="records")

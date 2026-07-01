"""
Builds the aggregate analytics payload consumed by the dashboard charts.
"""
from __future__ import annotations

from typing import Any

import pandas as pd


def build_analytics(df: pd.DataFrame, risk_df: pd.DataFrame) -> dict[str, Any]:
    total_complaints = int(len(df))
    resolved = int(df["status"].isin(["Resolved", "Closed"]).sum())
    pending = int(df["status"].isin(["Open", "Pending", "In Progress"]).sum())
    high_risk_wards = int((risk_df["risk_level"] == "High").sum())

    # Complaint trend by month
    trend_df = df.copy()
    trend_df["month"] = pd.to_datetime(trend_df["date"]).dt.to_period("M").astype(str)
    trend = (
        trend_df.groupby("month")
        .size()
        .reset_index(name="count")
        .sort_values("month")
        .to_dict(orient="records")
    )

    # Complaints by category
    by_category = (
        df.groupby("category")
        .size()
        .reset_index(name="count")
        .sort_values("count", ascending=False)
        .to_dict(orient="records")
    )

    # Risk distribution (pie chart)
    risk_distribution = (
        risk_df.groupby("risk_level")
        .size()
        .reindex(["Low", "Medium", "High"], fill_value=0)
        .reset_index(name="count")
        .rename(columns={"index": "risk_level"})
        .to_dict(orient="records")
    )

    # Ward leaderboard (top 10 by risk)
    ward_leaderboard = risk_df.head(10).to_dict(orient="records")

    # Department workload
    department_workload = (
        df.groupby("department")
        .agg(
            total=("complaint_id", "count"),
            open_cases=("status", lambda s: s.isin(["Open", "Pending", "In Progress"]).sum()),
        )
        .reset_index()
        .sort_values("total", ascending=False)
        .to_dict(orient="records")
    )

    return {
        "summary": {
            "total_complaints": total_complaints,
            "high_risk_wards": high_risk_wards,
            "resolved_cases": resolved,
            "pending_cases": pending,
        },
        "complaint_trend": trend,
        "complaints_by_category": by_category,
        "risk_distribution": risk_distribution,
        "ward_leaderboard": ward_leaderboard,
        "department_workload": department_workload,
    }

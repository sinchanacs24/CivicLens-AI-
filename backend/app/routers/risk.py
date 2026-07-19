from fastapi import APIRouter, HTTPException

from app.services.risk_engine import top_risk_wards
from app.state import state

router = APIRouter(tags=["risk"])


@router.get("/risk")
def get_risk(top_n: int = 10):
    if not state.is_loaded() or state.risk_df is None:
        raise HTTPException(
            status_code=404,
            detail="No dataset has been uploaded yet. Upload a CSV via POST /upload first.",
        )
    return {
        "wards": state.risk_df.to_dict(orient="records"),
        "top_risk_wards": top_risk_wards(state.risk_df, n=top_n),
    }


@router.get("/ward/{ward_name}")
def get_ward_detail(ward_name: str):
    if not state.is_loaded() or state.dataframe is None:
        raise HTTPException(
            status_code=404,
            detail="No dataset has been uploaded yet. Upload a CSV via POST /upload first.",
        )

    df = state.dataframe
    ward_df = df[df["ward"] == ward_name]
    if ward_df.empty:
        raise HTTPException(status_code=404, detail=f"No data found for ward '{ward_name}'.")

    # Category breakdown for this ward
    by_category = (
        ward_df.groupby("category")
        .size()
        .reset_index(name="count")
        .sort_values("count", ascending=False)
        .to_dict(orient="records")
    )

    # Status breakdown for this ward
    by_status = (
        ward_df.groupby("status")
        .size()
        .reset_index(name="count")
        .sort_values("count", ascending=False)
        .to_dict(orient="records")
    )

    # Priority breakdown
    by_priority = (
        ward_df.groupby("priority")
        .size()
        .reset_index(name="count")
        .to_dict(orient="records")
    )

    # Pull this ward's risk row if available
    risk_row = {}
    if state.risk_df is not None:
        match = state.risk_df[state.risk_df["ward"] == ward_name]
        if not match.empty:
            risk_row = match.iloc[0].to_dict()

    return {
        "ward": ward_name,
        "total_complaints": int(len(ward_df)),
        "by_category": by_category,
        "by_status": by_status,
        "by_priority": by_priority,
        "risk": risk_row,
    }
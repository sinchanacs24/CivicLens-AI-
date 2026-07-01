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

from fastapi import APIRouter, HTTPException

from app.state import state

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard")
def get_dashboard():
    if not state.is_loaded():
        raise HTTPException(
            status_code=404,
            detail="No dataset has been uploaded yet. Upload a CSV via POST /upload first.",
        )
    return {
        "filename": state.filename,
        "engine_used": state.engine_used,
        "rows_after_cleaning": state.rows_after,
        **state.analytics,
    }

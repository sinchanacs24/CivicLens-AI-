from fastapi import APIRouter, HTTPException

from app.services.gemini_service import generate_ai_insights
from app.state import state

router = APIRouter(tags=["gemini"])


@router.post("/gemini")
def get_ai_insights():
    if not state.is_loaded():
        raise HTTPException(
            status_code=404,
            detail="No dataset has been uploaded yet. Upload a CSV via POST /upload first.",
        )
    insights = generate_ai_insights(state.analytics)
    return insights

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.gemini_service import generate_ai_insights, answer_question
from app.state import state

router = APIRouter(tags=["gemini"])


class AskRequest(BaseModel):
    question: str


@router.post("/gemini")
def get_ai_insights():
    if not state.is_loaded():
        raise HTTPException(
            status_code=404,
            detail="No dataset has been uploaded yet. Upload a CSV via POST /upload first.",
        )
    insights = generate_ai_insights(state.analytics)
    return insights


@router.post("/ask")
def ask_question(payload: AskRequest):
    if not state.is_loaded():
        raise HTTPException(
            status_code=404,
            detail="No dataset has been uploaded yet. Upload a CSV via POST /upload first.",
        )
    question = (payload.question or "").strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    if len(question) > 500:
        raise HTTPException(status_code=400, detail="Question is too long (max 500 characters).")
    return answer_question(question, state.analytics)
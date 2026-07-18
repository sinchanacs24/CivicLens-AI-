"""
Gemini integration.

Given the analytics payload, ask Gemini to produce a structured, natural
language summary: overview, top risks, recommendations, action plan, and
future concerns. Falls back to a deterministic rule-based summary if the
Gemini API key is missing or the call fails, so the demo never breaks.
"""
from __future__ import annotations

import json
from typing import Any

from app.config import settings

PROMPT_TEMPLATE = """You are a municipal data analyst AI. Based on the JSON analytics below \
from a city complaints dataset, produce a JSON object with exactly these keys: \
"summary" (2-3 sentence natural language overview), \
"top_risks" (array of up to 5 short strings), \
"recommendations" (array of up to 5 short actionable strings), \
"action_plan" (array of up to 5 short ordered steps), \
"future_concerns" (array of up to 3 short strings). \
Respond with ONLY valid JSON, no markdown fences, no extra commentary.

ANALYTICS:
{analytics_json}
"""


def _fallback_summary(analytics: dict[str, Any]) -> dict[str, Any]:
    summary = analytics.get("summary", {})
    leaderboard = analytics.get("ward_leaderboard", [])[:5]
    top_wards = [w["ward"] for w in leaderboard]

    return {
        "summary": (
            f"The dataset contains {summary.get('total_complaints', 0)} complaints, "
            f"with {summary.get('high_risk_wards', 0)} wards currently flagged as high risk. "
            f"{summary.get('resolved_cases', 0)} cases have been resolved while "
            f"{summary.get('pending_cases', 0)} remain pending."
        ),
        "top_risks": [f"{w} shows elevated complaint volume and severity" for w in top_wards]
        or ["No high-risk wards detected in the current dataset."],
        "recommendations": [
            "Prioritize field inspections in the top-ranked wards this week.",
            "Reallocate sanitation and water-board crews toward high-risk zones.",
            "Set up automated alerts for wards crossing the High risk threshold.",
            "Review recurring complaint categories for systemic fixes.",
            "Publish a public dashboard to improve transparency and trust.",
        ],
        "action_plan": [
            "Validate top risk wards with on-ground teams within 48 hours.",
            "Assign department leads to each flagged ward.",
            "Track resolution time weekly against a target SLA.",
            "Re-run risk scoring after each data refresh.",
            "Escalate unresolved Critical priority complaints daily.",
        ],
        "future_concerns": [
            "Seasonal rainfall spikes may increase sewage and water-logging complaints.",
            "Population growth in high-risk wards could compound existing strain.",
            "Delayed resolutions may erode public trust if trends continue.",
        ],
        "source": "fallback-rule-based",
    }


def generate_ai_insights(analytics: dict[str, Any]) -> dict[str, Any]:
    if not settings.gemini_api_key:
        return _fallback_summary(analytics)

    try:
        from google import genai

        client = genai.Client(api_key=settings.gemini_api_key)

        prompt = PROMPT_TEMPLATE.format(analytics_json=json.dumps(analytics, default=str))
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        text = response.text.strip()

        # Strip markdown fences if the model added them anyway
        if text.startswith("```"):
            text = text.strip("`")
            text = text.split("\n", 1)[1] if "\n" in text else text
            if text.lower().startswith("json"):
                text = text[4:]

        parsed = json.loads(text)
        parsed["source"] = "gemini"
        return parsed
    except Exception as exc:  # noqa: BLE001
        fallback = _fallback_summary(analytics)
        fallback["source"] = f"fallback-error: {exc}"
        return fallback
    
ASK_PROMPT_TEMPLATE = """You are a municipal data analyst assistant for a city complaints dashboard. \
Answer the user's question using ONLY the dataset context provided below. \
Be concise (2-4 sentences), specific, and cite real numbers or ward names from the data. \
If the answer isn't in the data, say so honestly. Do not make up figures.

DATASET CONTEXT:
{context_json}

USER QUESTION:
{question}
"""


def answer_question(question: str, analytics: dict[str, Any]) -> dict[str, Any]:
    """
    Answer a free-text question grounded in the current dataset's analytics.
    Falls back to a helpful message if Gemini is unavailable.
    """
    if not settings.gemini_api_key:
        return {
            "answer": "The AI query feature needs a Gemini API key to be configured. "
            "You can still explore the dashboard charts and risk table above.",
            "source": "fallback-no-key",
        }

    # Trim the context so we send a compact, relevant slice to Gemini.
    context = {
        "summary": analytics.get("summary", {}),
        "ward_leaderboard": analytics.get("ward_leaderboard", [])[:10],
        "complaints_by_category": analytics.get("complaints_by_category", []),
        "department_workload": analytics.get("department_workload", []),
        "risk_distribution": analytics.get("risk_distribution", []),
    }

    try:
        from google import genai

        client = genai.Client(api_key=settings.gemini_api_key)
        prompt = ASK_PROMPT_TEMPLATE.format(
            context_json=json.dumps(context, default=str),
            question=question,
        )
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        return {"answer": response.text.strip(), "source": "gemini"}
    except Exception as exc:  # noqa: BLE001
        return {
            "answer": "Sorry, I couldn't process that question right now. Please try rephrasing it.",
            "source": f"fallback-error: {exc}",
        } 
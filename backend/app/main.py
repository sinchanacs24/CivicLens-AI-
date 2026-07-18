"""
CivicLens AI — FastAPI application entrypoint.
Run with: uvicorn app.main:app --reload --port 8000
"""
from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import os
from app.config import settings
from app.routers import benchmark, dashboard, gemini, health, risk, upload
from app.services.analytics import build_analytics
from app.services.data_processing import load_and_clean
from app.services.risk_engine import compute_ward_risk
from app.state import state

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="CivicLens AI",
    description="AI-Powered Community Intelligence Platform for analyzing civic complaints.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logging.getLogger("civiclens").exception("Unhandled error on %s", request.url.path)
    return JSONResponse(status_code=500, content={"detail": f"Internal server error: {exc}"})


app.include_router(health.router)
app.include_router(upload.router)
app.include_router(dashboard.router)
app.include_router(risk.router)
app.include_router(gemini.router)
app.include_router(benchmark.router)

@app.on_event("startup")
def preload_sample_dataset():
    """
    On server startup, auto-load a bundled sample dataset so the dashboard,
    risk, gemini, and benchmark endpoints return data immediately — even on a
    cold start (e.g. after a free-tier host spins the service back up). A real
    upload from the user replaces this sample as normal.
    """
    if state.is_loaded():
        return
    sample_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "..", "sample_data", "complaints.csv"
    )
    sample_path = os.path.abspath(sample_path)
    if not os.path.exists(sample_path):
        logging.getLogger("civiclens").warning(
            "Sample dataset not found at %s; starting with empty state.", sample_path
        )
        return
    try:
        import shutil
        os.makedirs(settings.upload_dir, exist_ok=True)
        preloaded_copy = os.path.join(settings.upload_dir, "preloaded_complaints.csv")
        if not os.path.exists(preloaded_copy):
            shutil.copy(sample_path, preloaded_copy)
        result = load_and_clean(preloaded_copy)
        risk_df = compute_ward_risk(result.dataframe)
        analytics = build_analytics(result.dataframe, risk_df)
        state.dataframe = result.dataframe
        state.risk_df = risk_df
        state.analytics = analytics
        state.engine_used = result.engine
        state.filename = "preloaded_complaints.csv"
        state.load_seconds = result.load_seconds
        state.clean_seconds = result.clean_seconds
        state.rows_before = result.rows_before
        state.rows_after = result.rows_after
        state.rows_removed = result.rows_removed
        logging.getLogger("civiclens").info(
            "Preloaded sample dataset: %s rows.", result.rows_after
        )
    except Exception as exc:  # noqa: BLE001
        logging.getLogger("civiclens").warning(
            "Failed to preload sample dataset: %s", exc
        )

@app.get("/")
def root():
    return {
        "service": "CivicLens AI",
        "docs": "/docs",
        "endpoints": ["/upload", "/dashboard", "/risk", "/gemini", "/benchmark", "/health"],
    }

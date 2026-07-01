"""
CivicLens AI — FastAPI application entrypoint.
Run with: uvicorn app.main:app --reload --port 8000
"""
from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers import benchmark, dashboard, gemini, health, risk, upload

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


@app.get("/")
def root():
    return {
        "service": "CivicLens AI",
        "docs": "/docs",
        "endpoints": ["/upload", "/dashboard", "/risk", "/gemini", "/benchmark", "/health"],
    }

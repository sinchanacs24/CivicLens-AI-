"""
POST /upload

Accepts a CSV file, stores it locally, best-effort pushes it to Google Cloud
Storage + BigQuery, then processes it (cuDF if available, else Pandas),
computes ward risk scores and dashboard analytics, and caches the result in
the in-memory app state for the other endpoints to read.
"""
from __future__ import annotations

import os
import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.config import settings
from app.services import gcp_service
from app.services.analytics import build_analytics
from app.services.data_processing import load_and_clean
from app.services.risk_engine import compute_ward_risk
from app.state import state

router = APIRouter(tags=["upload"])

ALLOWED_EXTENSIONS = {".csv"}


@router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only .csv files are supported.")

    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > settings.max_upload_mb:
        raise HTTPException(
            status_code=400,
            detail=f"File too large ({size_mb:.1f} MB). Limit is {settings.max_upload_mb} MB.",
        )
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    local_filename = f"{uuid.uuid4().hex}_{file.filename}"
    local_path = os.path.join(settings.upload_dir, local_filename)
    with open(local_path, "wb") as f:
        f.write(contents)

    # Best-effort cloud sync — never blocks the pipeline.
    gcs_uri = gcp_service.upload_to_gcs(local_path, f"uploads/{local_filename}")
    if gcs_uri:
        gcp_service.load_into_bigquery(gcs_uri)

    try:
        result = load_and_clean(local_path)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Failed to process CSV: {exc}") from exc

    if result.dataframe.empty:
        raise HTTPException(
            status_code=422,
            detail="No valid rows remained after cleaning. Please check the CSV contents.",
        )

    risk_df = compute_ward_risk(result.dataframe)
    analytics = build_analytics(result.dataframe, risk_df)

    state.dataframe = result.dataframe
    state.risk_df = risk_df
    state.analytics = analytics
    state.engine_used = result.engine
    state.filename = file.filename
    state.load_seconds = result.load_seconds
    state.clean_seconds = result.clean_seconds
    state.rows_before = result.rows_before
    state.rows_after = result.rows_after
    state.rows_removed = result.rows_removed

    return {
        "message": "File processed successfully.",
        "filename": file.filename,
        "engine_used": result.engine,
        "rows_before_cleaning": result.rows_before,
        "rows_after_cleaning": result.rows_after,
        "rows_removed": result.rows_removed,
        "load_seconds": round(result.load_seconds, 4),
        "clean_seconds": round(result.clean_seconds, 4),
        "gcs_uri": gcs_uri,
    }

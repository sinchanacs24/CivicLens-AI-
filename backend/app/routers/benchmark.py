import os

from fastapi import APIRouter, HTTPException

from app.state import state
from app.services.benchmark_service import run_benchmark

router = APIRouter(tags=["benchmark"])


@router.get("/benchmark")
def get_benchmark():
    """
    Re-reads the most recently uploaded CSV from disk and times a Pandas
    pass against a cuDF pass (if a GPU is available) to produce an honest
    CPU vs GPU comparison for the dashboard.
    """
    if not state.is_loaded() or not state.filename:
        raise HTTPException(
            status_code=404,
            detail="No dataset has been uploaded yet. Upload a CSV via POST /upload first.",
        )

    from app.config import settings

    matches = [
        f for f in os.listdir(settings.upload_dir) if f.endswith(state.filename)
    ]
    if not matches:
        raise HTTPException(status_code=404, detail="Original uploaded file no longer available.")

    csv_path = os.path.join(settings.upload_dir, sorted(matches)[-1])
    return run_benchmark(csv_path)

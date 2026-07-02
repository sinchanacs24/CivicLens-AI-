"""
Centralized application configuration.

All values are read from environment variables (see .env.example at the
repository root). Nothing here should ever contain a hard-coded secret.
"""
from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()

# On platforms like Render, there's no local file to point GOOGLE_APPLICATION_CREDENTIALS
# at, so we allow pasting the full service-account JSON into an env var instead. If present,
# write it to a temp file and point GOOGLE_APPLICATION_CREDENTIALS at that file so the
# standard Google Cloud client libraries pick it up automatically.
_creds_json = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON")
if _creds_json and not os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
    import tempfile

    _creds_file = tempfile.NamedTemporaryFile(
        mode="w", suffix=".json", delete=False
    )
    _creds_file.write(_creds_json)
    _creds_file.close()
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = _creds_file.name


@dataclass(frozen=True)
class Settings:
    project_id: str = os.getenv("PROJECT_ID", "")
    gcs_bucket_name: str = os.getenv("GCS_BUCKET_NAME", "")
    bigquery_dataset: str = os.getenv("BIGQUERY_DATASET", "civiclens")
    bigquery_table: str = os.getenv("BIGQUERY_TABLE", "complaints")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    google_application_credentials: str = os.getenv(
        "GOOGLE_APPLICATION_CREDENTIALS", ""
    )
    upload_dir: str = os.getenv("UPLOAD_DIR", "./uploaded_data")
    max_upload_mb: int = int(os.getenv("MAX_UPLOAD_MB", "50"))
    cors_origins: list[str] = None  # set in __post_init__

    def __post_init__(self):
        origins = os.getenv("CORS_ORIGINS", "http://localhost:5173")
        object.__setattr__(
            self, "cors_origins", [o.strip() for o in origins.split(",") if o.strip()]
        )


settings = Settings()

os.makedirs(settings.upload_dir, exist_ok=True)
"""
Google Cloud integration: upload the raw CSV to Cloud Storage and load it
into BigQuery. Both operations are best-effort — if credentials aren't
configured (e.g. running the hackathon demo locally without GCP), the app
logs a warning and continues using the local file, so the core pipeline
never breaks because of cloud connectivity.
"""
from __future__ import annotations

import logging

from app.config import settings

logger = logging.getLogger("civiclens.gcp")


def upload_to_gcs(local_path: str, destination_blob_name: str) -> str | None:
    """Upload `local_path` to the configured GCS bucket. Returns the gs:// URI, or None on failure."""
    if not settings.gcs_bucket_name:
        logger.warning("GCS_BUCKET_NAME not configured; skipping Cloud Storage upload.")
        return None

    try:
        from google.cloud import storage

        client = storage.Client(project=settings.project_id or None)
        bucket = client.bucket(settings.gcs_bucket_name)
        blob = bucket.blob(destination_blob_name)
        blob.upload_from_filename(local_path)
        uri = f"gs://{settings.gcs_bucket_name}/{destination_blob_name}"
        logger.info("Uploaded %s to %s", local_path, uri)
        return uri
    except Exception as exc:  # noqa: BLE001
        logger.warning("GCS upload failed, continuing locally: %s", exc)
        return None


def load_into_bigquery(gcs_uri: str) -> bool:
    """Load a CSV already in GCS into the configured BigQuery table. Returns success flag."""
    if not settings.project_id or not gcs_uri:
        logger.warning("PROJECT_ID or GCS URI missing; skipping BigQuery load.")
        return False

    try:
        from google.cloud import bigquery

        client = bigquery.Client(project=settings.project_id)
        dataset_ref = client.dataset(settings.bigquery_dataset)
        table_ref = dataset_ref.table(settings.bigquery_table)

        job_config = bigquery.LoadJobConfig(
            source_format=bigquery.SourceFormat.CSV,
            skip_leading_rows=1,
            autodetect=True,
            write_disposition=bigquery.WriteDisposition.WRITE_TRUNCATE,
        )
        load_job = client.load_table_from_uri(gcs_uri, table_ref, job_config=job_config)
        load_job.result()
        logger.info("Loaded %s into BigQuery table %s", gcs_uri, table_ref)
        return True
    except Exception as exc:  # noqa: BLE001
        logger.warning("BigQuery load failed, continuing without it: %s", exc)
        return False

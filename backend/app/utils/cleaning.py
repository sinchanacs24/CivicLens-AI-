"""
Data cleaning utilities shared by the Pandas and cuDF processing paths.

Kept dependency-light (only Pandas-compatible operations) so the same
function bodies work unmodified against either a `pandas.DataFrame` or a
`cudf.DataFrame`, since cuDF mirrors the Pandas API for the operations we
need here.
"""
from __future__ import annotations

REQUIRED_COLUMNS = [
    "complaint_id",
    "ward",
    "category",
    "priority",
    "status",
    "date",
    "latitude",
    "longitude",
    "rainfall",
    "traffic",
    "population",
    "department",
]

VALID_PRIORITIES = {"Low", "Medium", "High", "Critical"}
VALID_STATUSES = {"Open", "In Progress", "Resolved", "Closed", "Pending"}


def validate_columns(df) -> list[str]:
    """Return a list of any required columns missing from the dataframe."""
    return [c for c in REQUIRED_COLUMNS if c not in df.columns]


def clean_dataframe(df):
    """
    Clean a raw complaints dataframe.

    Steps:
      1. Drop exact duplicate rows.
      2. Drop rows missing a complaint_id, ward, or category (unrecoverable).
      3. Fill missing numeric values with column medians.
      4. Fill missing status/priority with sensible defaults.
      5. Normalize text columns (trim whitespace, title case).
      6. Parse dates and drop rows with an invalid date.
      7. Clip out-of-range latitude/longitude values.

    Works for both pandas and cuDF dataframes.
    """
    original_len = len(df)

    # 1. Remove exact duplicates
    df = df.drop_duplicates()

    # 2. Drop rows with missing critical identifiers
    df = df.dropna(subset=["complaint_id", "ward", "category"])

    # 3. Coerce numeric columns and fill missing with median
    numeric_cols = ["latitude", "longitude", "rainfall", "traffic", "population"]
    for col in numeric_cols:
        df[col] = df[col].astype("float64", errors="ignore")
        median_val = df[col].median()
        df[col] = df[col].fillna(median_val)

    # 4. Fill categorical defaults
    df["priority"] = df["priority"].fillna("Medium")
    df["status"] = df["status"].fillna("Open")

    # 5. Normalize text columns
    text_cols = ["ward", "category", "priority", "status", "department"]
    for col in text_cols:
        df[col] = df[col].astype(str).str.strip()

    df.loc[~df["priority"].isin(VALID_PRIORITIES), "priority"] = "Medium"
    df.loc[~df["status"].isin(VALID_STATUSES), "status"] = "Open"

    # 6. Parse dates, drop invalid
    df["date"] = df["date"].astype(str)
    try:
        import pandas as pd  # local import keeps cuDF path independent

        parsed = pd.to_datetime(df["date"].to_pandas() if hasattr(df["date"], "to_pandas") else df["date"], errors="coerce")
        df["date"] = parsed.astype(str)
        df = df[df["date"] != "NaT"]
    except Exception:
        pass

    # 7. Clip out-of-range coordinates (Bengaluru bounding box +/- buffer)
    df["latitude"] = df["latitude"].clip(lower=8.0, upper=18.0)
    df["longitude"] = df["longitude"].clip(lower=72.0, upper=82.0)
    df["rainfall"] = df["rainfall"].clip(lower=0)
    df["traffic"] = df["traffic"].clip(lower=0)
    df["population"] = df["population"].clip(lower=0)

    removed = original_len - len(df)
    return df, removed

"""
Very small in-memory store holding the state of the most recently uploaded
and processed dataset. A hackathon-scale app doesn't need a database for
this — everything downstream (dashboard, risk, gemini, benchmark) reads from
here until a new file is uploaded.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

import pandas as pd


@dataclass
class DatasetState:
    dataframe: pd.DataFrame | None = None
    risk_df: pd.DataFrame | None = None
    analytics: dict[str, Any] = field(default_factory=dict)
    engine_used: str | None = None
    filename: str | None = None
    load_seconds: float = 0.0
    clean_seconds: float = 0.0
    rows_before: int = 0
    rows_after: int = 0
    rows_removed: int = 0

    def is_loaded(self) -> bool:
        return self.dataframe is not None and not self.dataframe.empty


state = DatasetState()

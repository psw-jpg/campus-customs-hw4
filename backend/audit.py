"""Append-only audit trail of agent activity.

Every tool call and every agent run is recorded in outputs/audit_trail.json as a
growing JSON array. Entries are only ever appended — the file is never wiped
between runs. Each entry has:
  - timestamp  : when it happened (UTC, ISO 8601)
  - run_id     : ties together all entries from one chat turn
  - tool_name  : the tool or step that ran
  - detail     : a short description of the argument(s) and/or result
  - stop_reason: how it ended ("ok", "completed", or "error: ...")
"""

from __future__ import annotations

import json
import threading
from datetime import datetime, timezone
from pathlib import Path

AUDIT_PATH = Path(__file__).resolve().parent.parent / "outputs" / "audit_trail.json"
_lock = threading.Lock()


def append_entry(tool_name: str, detail: str, stop_reason: str, run_id: str) -> None:
    """Append one record to the audit trail, preserving everything already there."""
    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "run_id": run_id,
        "tool_name": tool_name,
        "detail": detail[:300],  # keep it short
        "stop_reason": stop_reason,
    }
    with _lock:
        AUDIT_PATH.parent.mkdir(parents=True, exist_ok=True)
        existing: list[dict] = []
        if AUDIT_PATH.exists():
            try:
                saved = json.loads(AUDIT_PATH.read_text(encoding="utf-8"))
                if isinstance(saved, list):
                    existing = saved
            except json.JSONDecodeError:
                existing = []  # corrupt/empty — start fresh array but don't lose future appends
        existing.append(entry)
        AUDIT_PATH.write_text(json.dumps(existing, indent=2))

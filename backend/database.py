"""Tiny SQLite layer for contact messages — stdlib only, no ORM."""

import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

from . import config

_SCHEMA = """
CREATE TABLE IF NOT EXISTS messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    email      TEXT    NOT NULL,
    subject    TEXT    NOT NULL,
    message    TEXT    NOT NULL,
    ip         TEXT,
    user_agent TEXT,
    emailed    INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    NOT NULL
);
"""


@contextmanager
def _connect():
    Path(config.DB_PATH).parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(config.DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    with _connect() as conn:
        conn.executescript(_SCHEMA)


def save_message(
    name: str,
    email: str,
    subject: str,
    message: str,
    ip: str | None = None,
    user_agent: str | None = None,
    emailed: bool = False,
) -> int:
    created = datetime.now(timezone.utc).isoformat()
    with _connect() as conn:
        cur = conn.execute(
            """INSERT INTO messages
               (name, email, subject, message, ip, user_agent, emailed, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (name, email, subject, message, ip, user_agent, int(emailed), created),
        )
        return int(cur.lastrowid)


def mark_emailed(message_id: int) -> None:
    with _connect() as conn:
        conn.execute("UPDATE messages SET emailed = 1 WHERE id = ?", (message_id,))


def list_messages(limit: int = 100) -> list[dict]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT * FROM messages ORDER BY id DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(r) for r in rows]


def recent_count(seconds: int, ip: str | None) -> int:
    """How many messages this IP sent within the last `seconds` — for rate limiting."""
    if not ip:
        return 0
    cutoff = datetime.now(timezone.utc).timestamp() - seconds
    with _connect() as conn:
        rows = conn.execute(
            "SELECT created_at FROM messages WHERE ip = ?", (ip,)
        ).fetchall()
    n = 0
    for r in rows:
        try:
            ts = datetime.fromisoformat(r["created_at"]).timestamp()
        except ValueError:
            continue
        if ts >= cutoff:
            n += 1
    return n

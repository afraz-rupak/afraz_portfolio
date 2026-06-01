"""Configuration loaded from environment variables (and an optional .env file).

Nothing here is required for the server to boot — sensible defaults let it run
out of the box (messages are stored to SQLite). Set the SMTP_* vars to also have
submissions emailed to you.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env from the repo root if present (does not override real env vars).
REPO_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(REPO_ROOT / ".env")


def _bool(name: str, default: bool) -> bool:
    val = os.getenv(name)
    if val is None:
        return default
    return val.strip().lower() in {"1", "true", "yes", "on"}


# --- Paths ---------------------------------------------------------------
# The static site folder (contains index.html). Has a space in the name.
STATIC_DIR = Path(os.getenv("STATIC_DIR", REPO_ROOT / "portfolio website")).resolve()
DB_PATH = Path(os.getenv("DB_PATH", REPO_ROOT / "backend" / "messages.db")).resolve()

# --- Server --------------------------------------------------------------
HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "5173"))
# Comma-separated list, or "*" for any. Same-origin needs none of this.
ALLOWED_ORIGINS = [
    o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",") if o.strip()
]

# --- Admin ---------------------------------------------------------------
# Token required to read stored messages via /api/messages. Unset => endpoint
# is disabled (returns 503) so messages are never exposed by accident.
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN") or None

# --- Email (SMTP) --------------------------------------------------------
SMTP_HOST = os.getenv("SMTP_HOST") or None
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER") or None
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD") or None
SMTP_USE_TLS = _bool("SMTP_USE_TLS", True)  # STARTTLS on 587
SMTP_USE_SSL = _bool("SMTP_USE_SSL", False)  # implicit SSL on 465
# Who the notification is sent to / from. Defaults to the portfolio owner.
CONTACT_TO = os.getenv("CONTACT_TO", "afrazulhaque865@gmail.com")
SMTP_FROM = os.getenv("SMTP_FROM") or SMTP_USER or CONTACT_TO


def email_enabled() -> bool:
    """True when enough SMTP config is present to attempt sending mail."""
    return bool(SMTP_HOST and SMTP_FROM and CONTACT_TO)

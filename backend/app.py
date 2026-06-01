"""FastAPI app: serves the static portfolio site + a real contact-form API.

Run:  uvicorn backend.app:app --reload --port 5173
or:   python -m backend
"""

import logging

from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, Field

from . import config, database, email_utils

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("portfolio")

app = FastAPI(title="Afraz Portfolio API", version="1.0.0", docs_url="/api/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Rate limit: max submissions per IP within the window.
RATE_LIMIT_WINDOW_SECONDS = 3600
RATE_LIMIT_MAX = 5


@app.on_event("startup")
def _startup() -> None:
    database.init_db()
    if not config.STATIC_DIR.exists():
        log.warning("Static dir not found: %s", config.STATIC_DIR)
    log.info("Static dir: %s", config.STATIC_DIR)
    log.info("DB:         %s", config.DB_PATH)
    log.info("Email:      %s", "enabled" if config.email_enabled() else "disabled (stores only)")


# --- Schemas -------------------------------------------------------------
class ContactIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    subject: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=10, max_length=5000)
    # Honeypot: real users never fill this hidden field. Bots do.
    company: str | None = Field(default="", max_length=200)


class ContactOut(BaseModel):
    ok: bool
    id: int | None = None
    emailed: bool = False
    message: str


# --- API -----------------------------------------------------------------
@app.get("/api/health")
def health() -> dict:
    return {
        "ok": True,
        "email_enabled": config.email_enabled(),
        "static_dir_exists": config.STATIC_DIR.exists(),
    }


@app.post("/api/contact", response_model=ContactOut)
def contact(payload: ContactIn, request: Request) -> ContactOut:
    # Silently accept-and-drop honeypot hits so bots get no signal.
    if payload.company:
        log.info("Honeypot triggered; dropping submission from %s", payload.email)
        return ContactOut(ok=True, emailed=False, message="Thanks! Your message was received.")

    ip = request.client.host if request.client else None
    if database.recent_count(RATE_LIMIT_WINDOW_SECONDS, ip) >= RATE_LIMIT_MAX:
        raise HTTPException(status_code=429, detail="Too many messages. Please try again later.")

    emailed = False
    if config.email_enabled():
        try:
            email_utils.send_contact_email(
                payload.name, payload.email, payload.subject, payload.message
            )
            emailed = True
        except Exception as exc:  # noqa: BLE001 — never lose a message over SMTP errors
            log.error("Email send failed (message still stored): %s", exc)

    msg_id = database.save_message(
        name=payload.name.strip(),
        email=payload.email,
        subject=payload.subject.strip(),
        message=payload.message.strip(),
        ip=ip,
        user_agent=request.headers.get("user-agent"),
        emailed=emailed,
    )
    log.info("Stored message #%s from %s (emailed=%s)", msg_id, payload.email, emailed)
    return ContactOut(
        ok=True,
        id=msg_id,
        emailed=emailed,
        message="Thanks! Your message looks good — I'll get back to you soon.",
    )


@app.get("/api/messages")
def messages(x_admin_token: str | None = Header(default=None)) -> JSONResponse:
    """Read stored messages. Requires the ADMIN_TOKEN env var + matching header."""
    if not config.ADMIN_TOKEN:
        raise HTTPException(status_code=503, detail="Admin view disabled (set ADMIN_TOKEN).")
    if x_admin_token != config.ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid admin token.")
    return JSONResponse({"messages": database.list_messages()})


# --- Static site (mounted last so /api/* wins) ---------------------------
if config.STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=str(config.STATIC_DIR), html=True), name="site")

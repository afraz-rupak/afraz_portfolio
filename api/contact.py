"""Vercel serverless function for the contact form — POST /api/contact.

Stateless (Vercel functions can't keep a database), so it emails each
submission to you via SMTP. Configure these env vars in the Vercel dashboard:

    SMTP_HOST      e.g. smtp.gmail.com
    SMTP_PORT      587 (STARTTLS) or 465 (SSL)
    SMTP_USER      your SMTP username / email
    SMTP_PASSWORD  app password (for Gmail, create an App Password)
    CONTACT_TO     where messages are delivered (defaults to SMTP_USER)
    SMTP_FROM      From address (defaults to SMTP_USER)
    SMTP_USE_SSL   "true" to use SSL (port 465) instead of STARTTLS

Uses only the Python standard library, so no requirements.txt is needed.
"""

import json
import os
import re
import smtplib
import ssl
from email.message import EmailMessage
from email.utils import formataddr
from http.server import BaseHTTPRequestHandler

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def _bool(name: str, default: bool = False) -> bool:
    v = os.environ.get(name)
    return default if v is None else v.strip().lower() in {"1", "true", "yes", "on"}


def _send_email(name: str, email: str, subject: str, message: str) -> bool:
    """Email the submission. Returns True if sent, False if SMTP isn't configured."""
    host = os.environ.get("SMTP_HOST")
    if not host:
        return False

    user = os.environ.get("SMTP_USER")
    password = os.environ.get("SMTP_PASSWORD")
    port = int(os.environ.get("SMTP_PORT", "587"))
    to_addr = os.environ.get("CONTACT_TO") or user
    from_addr = os.environ.get("SMTP_FROM") or user or to_addr
    if not to_addr:
        return False

    msg = EmailMessage()
    msg["Subject"] = f"[Portfolio] {subject}"
    msg["From"] = formataddr(("Portfolio Contact Form", from_addr))
    msg["To"] = to_addr
    msg["Reply-To"] = formataddr((name, email))
    msg.set_content(
        "New message from your portfolio contact form\n"
        + "-" * 48 + "\n"
        + f"Name:    {name}\n"
        + f"Email:   {email}\n"
        + f"Subject: {subject}\n"
        + "-" * 48 + "\n\n"
        + message + "\n"
    )

    if _bool("SMTP_USE_SSL") or port == 465:
        ctx = ssl.create_default_context()
        with smtplib.SMTP_SSL(host, port, context=ctx) as s:
            if user and password:
                s.login(user, password)
            s.send_message(msg)
    else:
        with smtplib.SMTP(host, port) as s:
            s.starttls(context=ssl.create_default_context())
            if user and password:
                s.login(user, password)
            s.send_message(msg)
    return True


class handler(BaseHTTPRequestHandler):
    def _json(self, code: int, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self) -> None:  # noqa: N802 (Vercel/BaseHTTPRequestHandler API)
        try:
            length = int(self.headers.get("content-length") or 0)
            raw = self.rfile.read(length) if length else b"{}"
            data = json.loads(raw or b"{}")
        except Exception:
            return self._json(400, {"detail": "Invalid request."})

        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").strip()
        subject = (data.get("subject") or "").strip()
        message = (data.get("message") or "").strip()
        company = (data.get("company") or "").strip()  # honeypot

        # Silently accept honeypot hits so bots get no signal.
        if company:
            return self._json(200, {"ok": True, "emailed": False, "message": "Thanks! Your message was received."})

        if not name or not subject or len(message) < 10 or not EMAIL_RE.match(email):
            return self._json(400, {"detail": "Please complete every field with a valid email and a longer message."})

        emailed = False
        try:
            emailed = _send_email(name, email, subject, message)
        except Exception as exc:  # never break the form over a mail error
            print("contact email failed:", exc)

        return self._json(200, {
            "ok": True,
            "emailed": emailed,
            "message": "Thanks! Your message looks good — I'll get back to you soon.",
        })

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(204)
        self.send_header("Allow", "POST, OPTIONS")
        self.end_headers()

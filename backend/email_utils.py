"""Send contact-form notifications over SMTP — stdlib smtplib/email only."""

import smtplib
import ssl
from email.message import EmailMessage
from email.utils import formataddr

from . import config


def send_contact_email(name: str, email: str, subject: str, message: str) -> None:
    """Email a submitted message to CONTACT_TO. Raises on failure."""
    if not config.email_enabled():
        raise RuntimeError("SMTP is not configured")

    msg = EmailMessage()
    msg["Subject"] = f"[Portfolio] {subject}"
    msg["From"] = formataddr(("Portfolio Contact Form", config.SMTP_FROM))
    msg["To"] = config.CONTACT_TO
    msg["Reply-To"] = formataddr((name, email))
    msg.set_content(
        f"New message from your portfolio contact form\n"
        f"{'-' * 48}\n"
        f"Name:    {name}\n"
        f"Email:   {email}\n"
        f"Subject: {subject}\n"
        f"{'-' * 48}\n\n"
        f"{message}\n"
    )

    if config.SMTP_USE_SSL:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(config.SMTP_HOST, config.SMTP_PORT, context=context) as s:
            _login_and_send(s, msg)
    else:
        with smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT) as s:
            if config.SMTP_USE_TLS:
                s.starttls(context=ssl.create_default_context())
            _login_and_send(s, msg)


def _login_and_send(server: smtplib.SMTP, msg: EmailMessage) -> None:
    if config.SMTP_USER and config.SMTP_PASSWORD:
        server.login(config.SMTP_USER, config.SMTP_PASSWORD)
    server.send_message(msg)

# Portfolio backend (FastAPI)

Serves the static portfolio site **and** gives the contact form a real endpoint.
Every submission is stored in SQLite; if SMTP is configured it's also emailed to you.

## Run

```bash
# from the repo root
pip install -r requirements.txt        # first time
python -m backend                       # serves on http://127.0.0.1:5173
#   …or with auto-reload:
make dev
```

Open <http://127.0.0.1:5173> — the whole site is served, and the contact form
posts to the API. Interactive API docs: <http://127.0.0.1:5173/api/docs>.

## Endpoints

| Method | Path             | Purpose                                              |
| ------ | ---------------- | ---------------------------------------------------- |
| GET    | `/api/health`    | Liveness + whether email is enabled                  |
| POST   | `/api/contact`   | Validate, store, and (if configured) email a message |
| GET    | `/api/messages`  | Read stored messages — needs `X-Admin-Token` header  |
| GET    | `/*`             | The static site                                       |

## Configuration

All optional — the server runs with zero config (messages are stored either way).
Copy `.env.example` to `.env` and fill in to enable email. See that file for the
full list (SMTP host/port/user/password, `CONTACT_TO`, `ADMIN_TOKEN`, etc.).

### Reading stored messages

Set `ADMIN_TOKEN` in `.env`, then:

```bash
curl -H "X-Admin-Token: <your-token>" http://127.0.0.1:5173/api/messages
```

## What's built in

- **Validation** — Pydantic enforces name/email/subject/message rules server-side.
- **Honeypot** — a hidden `company` field; bot submissions are silently dropped.
- **Rate limiting** — max 5 submissions per IP per hour.
- **Email is best-effort** — if SMTP fails, the message is still stored and the
  user still gets a success response (you won't lose a message to a mail outage).

## Files

```
backend/
├── app.py          FastAPI app: routes + static mount
├── __main__.py     `python -m backend` entrypoint (uvicorn)
├── config.py       env-driven settings
├── database.py     SQLite store (stdlib sqlite3)
└── email_utils.py  SMTP sender (stdlib smtplib)
```

# Deploying to Vercel

The portfolio is a static site (in `portfolio website/`) plus one Python
serverless function for the contact form (`api/contact.py`). Both are wired up
for Vercel via [`vercel.json`](vercel.json).

## 1. Push to GitHub

Already connected to `github.com/afraz-rupak/afraz_portfolio`. Push as usual:

```bash
git add -A
git commit -m "your message"
git push
```

## 2. Import the repo into Vercel

1. Go to <https://vercel.com/new> and import **afraz-rupak/afraz_portfolio**.
2. **Leave the Root Directory as `./`** (the repo root). `vercel.json` already
   points the static output at the `portfolio website/` folder and exposes
   `api/contact.py` as a function — no framework preset or build command needed.
3. Click **Deploy**.

> If the static site ever fails to appear, the fallback is to set the project's
> **Root Directory** to `portfolio website` in Vercel → Settings → General, and
> move `api/` inside that folder. The `vercel.json` approach above avoids that.

## 3. Make the contact form actually email you

`api/contact.py` emails each submission via SMTP. In Vercel →
**Settings → Environment Variables**, add:

| Variable        | Example                    | Notes                                    |
| --------------- | -------------------------- | ---------------------------------------- |
| `SMTP_HOST`     | `smtp.gmail.com`           |                                          |
| `SMTP_PORT`     | `587`                      | `465` if using SSL                       |
| `SMTP_USER`     | `youraddress@gmail.com`    |                                          |
| `SMTP_PASSWORD` | `your-app-password`        | Gmail: create an **App Password**        |
| `CONTACT_TO`    | `afrazulhaque865@gmail.com`| Where messages land (defaults to USER)   |
| `SMTP_FROM`     | `youraddress@gmail.com`    | From address (defaults to USER)          |
| `SMTP_USE_SSL`  | `true`                     | Only if using port 465                   |

Redeploy after adding them. Until SMTP is set, the form still responds
successfully to visitors but messages are not delivered (the function logs a
warning you can see under the deployment's **Functions** logs).

The form has a hidden honeypot field and server-side validation built in.

## Local development

The static site + a fuller contact backend (stores to SQLite **and** emails)
run via the FastAPI app in [`backend/`](backend/):

```bash
pip install -r requirements.txt
python -m backend          # http://127.0.0.1:5173
```

Live Server (VS Code) also works for the static pages, but its `/api/contact`
route won't exist — use the Python backend or the deployed Vercel site to test
the form.

## What is NOT deployed

`backend/` (local dev server), `image/` (source art), and the ignored local
folders (`portfolio website 2/`, `portfolio website.bak-premerge/`, `*.zip`) are
not part of the Vercel build.

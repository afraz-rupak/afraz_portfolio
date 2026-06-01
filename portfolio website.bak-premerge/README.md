# Afraz Ul Haque — Portfolio

A modern, responsive personal portfolio for an ML researcher / AI developer.
Dark-primary aesthetic with a light toggle, clean sans typography, generous
whitespace, and content driven entirely from editable data files.

## Structure

```
portfolio/
├── index.html         # Home — data-rich hero, focus, featured work, pubs, blog
├── about.html         # About — bio, mission, education + experience timelines
├── projects.html      # Projects — filter + 3 switchable card styles + detail drawer
├── research.html      # Research — interests, current focus, publications, citations
├── blog.html          # Blog — featured post + filterable grid
├── skills.html        # Skills — grouped toolkit + pipeline
├── contact.html       # Contact — channels + validated message form
└── assets/
    ├── styles.css     # Design system: tokens, layout, components, themes
    ├── pages.css      # Page/section specific styles
    ├── data.js        # ← EDIT THIS: profile, projects, publications, blogs, skills
    └── site.js        # Shared nav/footer, theme, menu, reveals, counters, icons
```

## Updating content

Everything you'll routinely change lives in **`assets/data.js`**:

- `PROFILE` — name, title, summary, email, links, CV URL
- `STATS` — the four hero metrics
- `FOCUS_AREAS`, `SKILLS`, `RESEARCH_INTERESTS`, `CURRENT_FOCUS`
- `PROJECTS` — each with problem / dataset / method / tech / results / links
- `PUBLICATIONS`, `EDUCATION`, `EXPERIENCE`, `BLOGS`

Edit the arrays and the pages re-render automatically — no code changes needed.

## Run locally

It's plain HTML/CSS/JS — no build step. Either:

- **Open** `index.html` directly in a browser, **or**
- Serve it (recommended, avoids any file:// quirks):

```bash
# Python
python3 -m http.server 5173
# or Node
npx serve .
```

Then visit `http://localhost:5173`.

## Deploy

Drag-and-drop or connect the repo to any static host:

- **Netlify** — drag the folder onto app.netlify.com, or `netlify deploy`
- **Vercel** — `vercel` in the folder (framework preset: "Other")
- **GitHub Pages** — push to a repo, enable Pages on the `main` branch root
- **Cloudflare Pages** — connect repo, no build command, output dir `/`

## Placeholders to replace

- **Headshot** — the striped boxes labelled "your headshot" (home + about)
- **Project / blog covers** — the labelled striped thumbnails
- **CV** — `PROFILE.cvUrl` currently points to your FlowCV; swap for a hosted PDF if you prefer
- **Blog posts** — sample summaries; replace with real articles
- **ResearchGate / ORCID** — set real URLs in `PROFILE.links`

## Future improvements

- **Real contact backend** — Formspree / Resend / a serverless function so the form actually emails you
- **Markdown blog** — render posts from `.md` files (or a CMS like Sanity / Contentlayer)
- **Analytics** — Plausible or Vercel Analytics
- **Individual project & post pages** — deep links + Open Graph images per item
- **Migrate to Next.js + Tailwind** — the data files map cleanly to typed data + components for SSR/SEO. Ask and I can generate the developer handoff package.

---

Built as a high-fidelity prototype. All profile content is real (from your GitHub);
publications and projects reflect published/accepted work.

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
├── blog-post.html     # Article reader — ?id=<slug>, TOC, prose, related, prev/next
├── editor.html        # Medium-style writing editor (opens from the dashboard)
├── admin.html         # Admin dashboard — CMS for blog/projects/pubs/skills/profile
├── skills.html        # Skills — grouped toolkit + pipeline
├── contact.html       # Contact — channels + validated message form
└── assets/
    ├── styles.css        # Design system: tokens, layout, components, themes
    ├── pages.css         # Page/section specific styles (+ article prose)
    ├── admin.css         # Admin dashboard styles
    ├── data.js           # ← EDIT THIS: profile, projects, publications, blogs, skills
    ├── blog-content.js   # Full article bodies (HTML), attached to BLOGS by id
    ├── store.js          # CMS layer: localStorage hydrate / save / export
    ├── site.js           # Shared nav/footer, theme, menu, reveals, counters, icons
    ├── admin.js          # Dashboard shell, auth, router, overview, blog CRUD
    └── admin-collections.js # Projects / Publications / Skills / Profile / Export
```

## Admin dashboard

Open **`admin.html`** (also linked discreetly in the site footer). Passcode: **`afraz2025`**
— change `AUTH_CODE` at the top of `assets/admin.js`.

> The gate is a **client-side convenience lock for the prototype, not real security.**
> For a public deployment, put the admin behind real auth (a server, or a host like
> Netlify Identity / Vercel + middleware).

From the dashboard you can create, edit, delete and reorder:
- **Blog posts** — opens the **Medium-style writer** (`editor.html`): a distraction-free
  canvas with a floating format toolbar (bold/italic/heading/quote/link on text select),
  a left-margin **"+"** menu to insert images, code blocks, embeds and dividers,
  live **Draft · Saved** auto-save, and a **Publish** panel for category, tags, subtitle,
  date and read-time. Publishing opens your live article.
- **Projects** — all fields, tech stack, results, links, featured toggle
- **Publications** — author lists, venue, role, tags, links
- **Skills** — groups and items
- **Profile** — identity, summary, contact, links, and the home hero stats

**How it persists:** edits are saved to your browser (localStorage) and **immediately
appear on the live pages** (a small hydrate layer overlays them onto the data files).
To make changes permanent for all visitors, open **Export → Copy / Download `data.js`**
and paste the generated code into `assets/data.js`. *Reset to defaults* clears your
local edits.

## Updating content (by hand)

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

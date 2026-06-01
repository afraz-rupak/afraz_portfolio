/* =========================================================================
   site.js — shared chrome + behaviours for every page
   ========================================================================= */

/* ---------- Icon set (inline SVG, currentColor) ---------- */
const ICON = {
  github: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.5v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 016 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33 0-3.04-1.85-3.04s-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 110-4.14 2.07 2.07 0 010 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.8 0 0 .77 0 1.73v20.54C0 23.23.8 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>',
  scholar: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 24a7 7 0 110-14 7 7 0 010 14zm0-24L0 9.5l4.84 3.77A8 8 0 0112 9a8 8 0 017.16 4.27L24 9.5 12 0z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>',
  external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>',
  paper: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>',
  demo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m10 8 6 4-6 4z"/><rect x="3" y="4" width="18" height="16" rx="2"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-5.7-7-11a7 7 0 1 1 14 0c0 5.3-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  moon: '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  sun: '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1.5-1.5"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6M14 11v6"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>',
  flask: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h6M10 3v6L5 19a1.5 1.5 0 0 0 1.3 2.3h11.4A1.5 1.5 0 0 0 19 19l-5-10V3"/><path d="M7.5 14h9"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 2 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
  dots: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m21 16-5-5L5 20"/></svg>',
  code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 8-4 4 4 4M15 8l4 4-4 4"/></svg>',
  divider: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="6" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18" cy="12" r="1.6"/></svg>',
  embed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/></svg>',
  bold: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z"/></svg>',
  italic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 4h-6M14 20H8M15 4 9 20"/></svg>',
  quote: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 7H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2v1a2 2 0 0 1-2 2 1 1 0 0 0 0 2 4 4 0 0 0 4-4V8a1 1 0 0 0-1-1zm11 0h-3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2v1a2 2 0 0 1-2 2 1 1 0 0 0 0 2 4 4 0 0 0 4-4V8a1 1 0 0 0-1-1z"/></svg>',
};

const NAV_ITEMS = [
  { href: "index.html", label: "Home" },
  { href: "about.html", label: "About" },
  { href: "projects.html", label: "Projects" },
  { href: "research.html", label: "Research" },
  { href: "blog.html", label: "Blog" },
  { href: "skills.html", label: "Skills" },
  { href: "contact.html", label: "Contact" },
];

/* ---------- Theme ---------- */
function applyTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  try { localStorage.setItem("afraz-theme", t); } catch (e) {}
}
(function initTheme() {
  let t = "dark";
  try { t = localStorage.getItem("afraz-theme") || "dark"; } catch (e) {}
  document.documentElement.setAttribute("data-theme", t);
})();

/* ---------- Header ---------- */
function renderHeader() {
  const here = (location.pathname.split("/").pop() || "index.html") || "index.html";
  const links = NAV_ITEMS.map(
    (n) => `<li><a href="${n.href}" class="${n.href === here ? "active" : ""}">${n.label}</a></li>`
  ).join("");

  return `
  <header class="site-header" id="siteHeader">
    <div class="container nav">
      <a class="brand" href="index.html">
        <span class="mark">${PROFILE.initials}</span>
        <span>${PROFILE.shortName} Ul Haque <span class="mark-sub">/ ML</span></span>
      </a>
      <nav aria-label="Primary">
        <ul class="nav-links" id="navLinks">${links}</ul>
      </nav>
      <div class="nav-actions">
        <a class="btn btn-primary" href="${PROFILE.cvUrl}" target="_blank" rel="noopener" style="--hide:1">${ICON.download}<span class="cv-label">CV</span></a>
        <button class="theme-toggle" id="themeToggle" aria-label="Toggle colour theme">${ICON.moon}${ICON.sun}</button>
        <button class="nav-toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false">${ICON.menu}</button>
      </div>
    </div>
  </header>`;
}

/* ---------- Footer ---------- */
function renderFooter() {
  const year = new Date().getFullYear();
  return `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="brand" href="index.html">
            <span class="mark">${PROFILE.initials}</span>
            <span>${PROFILE.name}</span>
          </a>
          <p>${PROFILE.summary}</p>
          <div class="social-row" style="margin-top:1.4rem">
            <a href="${PROFILE.links.github}" target="_blank" rel="noopener" aria-label="GitHub">${ICON.github}</a>
            <a href="${PROFILE.links.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn">${ICON.linkedin}</a>
            <a href="${PROFILE.links.scholar}" target="_blank" rel="noopener" aria-label="Google Scholar">${ICON.scholar}</a>
            <a href="mailto:${PROFILE.email}" aria-label="Email">${ICON.mail}</a>
          </div>
        </div>
        <div class="footer-col">
          <h4>Explore</h4>
          ${NAV_ITEMS.map((n) => `<a href="${n.href}">${n.label}</a>`).join("")}
        </div>
        <div class="footer-col">
          <h4>Connect</h4>
          <a href="mailto:${PROFILE.email}">Email</a>
          <a href="${PROFILE.links.github}" target="_blank" rel="noopener">GitHub</a>
          <a href="${PROFILE.links.linkedin}" target="_blank" rel="noopener">LinkedIn</a>
          <a href="${PROFILE.links.scholar}" target="_blank" rel="noopener">Google Scholar</a>
          <a href="${PROFILE.cvUrl}" target="_blank" rel="noopener">Download CV</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${year} ${PROFILE.name}. Built with care in ${PROFILE.location}.</span>
        <span class="faint">Open to research collaborations & ML roles. · <a href="admin.html" style="color:inherit;text-decoration:underline;text-underline-offset:2px">Admin</a></span>
      </div>
    </div>
  </footer>`;
}

/* ---------- Behaviours ---------- */
function mountChrome() {
  const h = document.getElementById("site-header-slot");
  const f = document.getElementById("site-footer-slot");
  if (h) h.innerHTML = renderHeader();
  if (f) f.innerHTML = renderFooter();

  // theme toggle
  const tt = document.getElementById("themeToggle");
  if (tt) tt.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme");
    applyTheme(cur === "dark" ? "light" : "dark");
  });

  // mobile menu
  const nt = document.getElementById("navToggle");
  const nl = document.getElementById("navLinks");
  if (nt && nl) {
    nt.addEventListener("click", () => {
      const open = nl.classList.toggle("open");
      nt.setAttribute("aria-expanded", String(open));
      nt.innerHTML = open ? ICON.close : ICON.menu;
    });
    nl.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nl.classList.remove("open");
        nt.setAttribute("aria-expanded", "false");
        nt.innerHTML = ICON.menu;
      })
    );
  }

  // header shadow on scroll
  const hdr = document.getElementById("siteHeader");
  const onScroll = () => hdr && hdr.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function initReveals() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach((e) => e.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }),
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  els.forEach((e) => io.observe(e));
  // Safety net: if the observer never fires (background tab / capture context),
  // reveal everything so content is never stuck invisible.
  setTimeout(() => els.forEach((e) => e.classList.add("in")), 1400);
}

function initCounters() {
  const nums = document.querySelectorAll("[data-count]");
  if (!nums.length) return;
  const run = (el) => {
    const target = parseFloat(el.getAttribute("data-count"));
    const suffix = el.getAttribute("data-suffix") || "";
    const dur = 1100;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
    }),
    { threshold: 0.5 }
  );
  nums.forEach((n) => io.observe(n));
}

/* ---------- Helpers shared across pages ---------- */
function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}
function tagPill(t) { return `<span class="tag">${t}</span>`; }

/* Render an author list with the profile owner highlighted */
function fmtAuthors(authors) {
  return authors
    .map((a) => (a === (typeof ME !== "undefined" ? ME : PROFILE.name) || a.includes("Afraz") ? `<span class="me">${a}</span>` : a))
    .join(", ");
}

/* Shared rich publication row. opts.full = show authors + note (research page) */
function pubItem(p, opts) {
  opts = opts || {};
  const typeClass = p.type === "IEEE" ? "t-ieee" : p.type === "Springer" ? "t-springer" : "t-review";
  const roleClass = /first/i.test(p.role || "") ? "role-lead" : "role-co";
  const linkable = p.link ? "pub-link" : "";
  const authors = opts.full && p.authors ? `<div class="pub-authors">${fmtAuthors(p.authors)}</div>` : "";
  const note = opts.full && p.note ? `<p class="pub-note">${p.note}</p>` : "";
  const venueFull = opts.full && p.venueFull ? `<span class="dotsep-i"></span><span class="venue-full">${p.venueFull}</span>` : "";
  const role = p.role ? `<span class="role-badge ${roleClass}">${p.role}</span>` : "";
  const openCue = p.link ? `<span class="pub-open">View ${ICON.external}</span>` : "";
  const onclick = p.link ? ` data-href="${p.link}"` : "";
  return `
    <div class="pub reveal ${linkable}"${onclick}>
      <div class="pnum">${String(p.n).padStart(2, "0")}</div>
      <div>
        <h3>${p.title}</h3>
        ${authors}
        ${note}
        <div class="pmeta">
          <span class="venue">${p.venue}</span>
          <span class="badge-type ${typeClass}">${p.type}</span>
          ${venueFull}
        </div>
      </div>
      <div class="pside">
        <div class="pyear">${p.year}</div>
        ${role}
        ${openCue}
      </div>
    </div>`;
}

/* Wire pub rows that carry data-href to open in a new tab */
function initPubLinks(root) {
  (root || document).querySelectorAll(".pub[data-href]").forEach((el) => {
    el.addEventListener("click", () => window.open(el.getAttribute("data-href"), "_blank", "noopener"));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  mountChrome();
  initReveals();
  initCounters();
  if (typeof onPageReady === "function") onPageReady();
  // run reveals/counters again for any content pages injected
  setTimeout(() => { initReveals(); initCounters(); }, 0);
});

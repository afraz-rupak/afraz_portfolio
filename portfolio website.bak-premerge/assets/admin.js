/* =========================================================================
   admin.js — dashboard shell: auth gate, sidebar, routing, and the
   Overview / Messages / Profile / Settings sections.

   Content collections (Projects, Publications, Blog, …) live in
   admin-collections.js, which registers itself on window.AdminCollections.
   Persistence goes through Store (store.js); contact messages come from the
   Python backend at /api/messages.
   ========================================================================= */

/* ---------- small helpers (shared with admin-collections.js) ---------- */
function esc(s) {
  return String(s == null ? "" : s)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
function el(id) { return document.getElementById(id); }

const PASSCODE = "afraz2025"; // client-side prototype gate — not real security
const TOKEN_KEY = "afraz-api-token";
function getToken() { try { return localStorage.getItem(TOKEN_KEY) || ""; } catch (e) { return ""; } }
function setToken(t) { try { localStorage.setItem(TOKEN_KEY, t); } catch (e) {} }

/* ---------- toasts ---------- */
function toast(msg, type) {
  const wrap = el("toasts");
  const t = document.createElement("div");
  t.className = "toast " + (type === "err" ? "err" : "ok");
  t.innerHTML = (type === "err" ? ICON.close : ICON.check) + "<span>" + esc(msg) + "</span>";
  wrap.appendChild(t);
  setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 250); }, 2600);
}

/* ---------- modal ---------- */
function openModal(title, bodyHTML, footHTML) {
  el("modalTitle").textContent = title;
  el("modalBody").innerHTML = bodyHTML;
  el("modalFoot").innerHTML = footHTML || "";
  el("modal").classList.add("open");
  el("modalBackdrop").classList.add("open");
}
function closeModal() {
  el("modal").classList.remove("open");
  el("modalBackdrop").classList.remove("open");
}

/* ---------- sections ---------- */
const SECTIONS = [
  { group: "Main" },
  { key: "overview", label: "Overview", icon: "demo", sub: "Welcome back" },
  { key: "messages", label: "Messages", icon: "mail", sub: "Contact-form submissions" },
  { group: "Content" },
  { key: "projects", label: "Projects", icon: "paper", sub: "Selected work" },
  { key: "publications", label: "Publications", icon: "scholar", sub: "Peer-reviewed papers" },
  { key: "blogs", label: "Blog posts", icon: "edit", sub: "Articles & notes" },
  { key: "skills", label: "Skills", icon: "plus", sub: "Toolkit groups" },
  { key: "experience", label: "Experience", icon: "external", sub: "Work history" },
  { key: "education", label: "Education", icon: "external", sub: "Degrees" },
  { group: "Site" },
  { key: "profile", label: "Profile", icon: "pin", sub: "Identity & links" },
  { key: "settings", label: "Settings", icon: "logout", sub: "API token & data" },
];

function countFor(key) {
  try {
    switch (key) {
      case "projects": return PROJECTS.length;
      case "publications": return PUBLICATIONS.length;
      case "blogs": return BLOGS.length;
      case "skills": return SKILLS.length;
      case "experience": return EXPERIENCE.length;
      case "education": return EDUCATION.length;
      default: return null;
    }
  } catch (e) { return null; }
}

function buildSidebar() {
  const items = SECTIONS.map((s) => {
    if (s.group) return `<div class="side-group">${s.group}</div>`;
    const c = countFor(s.key);
    return `<a class="side-link" data-key="${s.key}" href="#${s.key}">
      ${ICON[s.icon] || ICON.demo}<span>${s.label}</span>${c != null ? `<span class="count">${c}</span>` : ""}</a>`;
  }).join("");
  el("sidebar").innerHTML = `
    <div class="side-brand">
      <span class="bm">${PROFILE.initials || "AH"}</span>
      <div><div class="bn">${esc(PROFILE.shortName || "Afraz")} · Admin</div><div class="br">Content dashboard</div></div>
    </div>
    ${items}
    <div class="side-foot">
      <a class="side-link" href="index.html" target="_blank">${ICON.external}<span>View site</span></a>
      <a class="side-link" id="lockBtn" href="#">${ICON.logout}<span>Lock dashboard</span></a>
    </div>`;

  el("sidebar").querySelectorAll(".side-link[data-key]").forEach((a) =>
    a.addEventListener("click", (e) => { e.preventDefault(); navigate(a.dataset.key); closeSidebar(); }));
  el("lockBtn").addEventListener("click", (e) => { e.preventDefault(); lock(); });
}

let currentSection = "overview";
function navigate(key) {
  currentSection = key;
  const meta = SECTIONS.find((s) => s.key === key) || {};
  el("secTitle").textContent = meta.label || "Overview";
  el("secSub").textContent = meta.sub || "";
  el("topAction").innerHTML = "";
  el("sidebar").querySelectorAll(".side-link[data-key]").forEach((a) =>
    a.classList.toggle("active", a.dataset.key === key));
  try { location.hash = key; } catch (e) {}

  const mount = el("content");
  if (key === "overview") return renderOverview(mount);
  if (key === "messages") return renderMessages(mount);
  if (key === "profile") return renderProfile(mount);
  if (key === "settings") return renderSettings(mount);
  // content collections
  if (window.AdminCollections && AdminCollections.has(key)) {
    el("topAction").innerHTML = `<button class="btn btn-primary btn-sm" id="addBtn">${ICON.plus} Add</button>`;
    el("addBtn").addEventListener("click", () => AdminCollections.openEditor(key, null));
    return AdminCollections.renderList(key, mount);
  }
  mount.innerHTML = `<div class="empty-note">Unknown section.</div>`;
}

/* ---------- Overview ---------- */
function renderOverview(mount) {
  const stat = (sv, sl, icon) => `<div class="card stat-card"><div class="si">${ICON[icon] || ICON.demo}</div><div class="sv">${sv}</div><div class="sl">${sl}</div></div>`;
  mount.innerHTML = `
    <div class="stat-grid">
      ${stat(PROJECTS.length, "Projects", "paper")}
      ${stat(PUBLICATIONS.length, "Publications", "scholar")}
      ${stat(BLOGS.length, "Blog posts", "edit")}
      ${stat(SKILLS.reduce((n, s) => n + s.items.length, 0), "Skills listed", "plus")}
    </div>
    <div class="card panel">
      <div class="panel-head"><h2>Recent messages</h2><button class="btn btn-outline btn-sm" id="goMsgs">Open inbox</button></div>
      <div id="ovMsgs"><div class="empty-note">Loading…</div></div>
    </div>
    <div class="card panel">
      <div class="panel-head"><h2>Quick actions</h2></div>
      <div style="display:flex;flex-wrap:wrap;gap:.6rem">
        <button class="btn btn-outline btn-sm" data-go="projects">${ICON.paper} New project</button>
        <button class="btn btn-outline btn-sm" data-go="blogs">${ICON.edit} New post</button>
        <button class="btn btn-outline btn-sm" data-go="profile">${ICON.pin} Edit profile</button>
      </div>
    </div>`;
  el("goMsgs").addEventListener("click", () => navigate("messages"));
  mount.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => navigate(b.dataset.go)));

  fetchMessages().then((res) => {
    const box = el("ovMsgs");
    if (!box) return;
    if (res.error) { box.innerHTML = `<div class="notice">${res.error}</div>`; return; }
    const msgs = res.messages.slice(0, 3);
    box.innerHTML = msgs.length
      ? msgs.map(msgCardHTML).join("")
      : `<div class="empty-note">No messages yet.</div>`;
  });
}

/* ---------- Messages (from the Python backend) ---------- */
async function fetchMessages() {
  const token = getToken();
  if (!token) return { error: "Set your API admin token in <b>Settings</b> to load contact messages." };
  try {
    const res = await fetch("/api/messages", { headers: { "X-Admin-Token": token } });
    if (res.status === 401) return { error: "Invalid admin token. Update it in <b>Settings</b>." };
    if (res.status === 503) return { error: "The backend has no <b>ADMIN_TOKEN</b> configured yet (see backend/.env)." };
    if (!res.ok) return { error: "Couldn't reach the backend (HTTP " + res.status + ")." };
    const data = await res.json();
    return { messages: data.messages || [] };
  } catch (e) {
    return { error: "Backend not reachable — is the Python server running? <span class='mono'>python -m backend</span>" };
  }
}

function msgCardHTML(m) {
  const date = m.created_at ? new Date(m.created_at).toLocaleString() : "";
  return `<div class="card msg-card">
    <div class="msg-head">
      <div><span class="msg-from">${esc(m.name)}</span> &middot; <a class="msg-email" href="mailto:${esc(m.email)}">${esc(m.email)}</a></div>
      <span class="msg-date">${esc(date)}${m.emailed ? " · ✉ emailed" : ""}</span>
    </div>
    <div class="msg-subj">${esc(m.subject)}</div>
    <div class="msg-body">${esc(m.message)}</div>
  </div>`;
}

function renderMessages(mount) {
  mount.innerHTML = `<div id="msgList"><div class="empty-note">Loading…</div></div>`;
  fetchMessages().then((res) => {
    const box = el("msgList");
    if (res.error) { box.innerHTML = `<div class="notice">${res.error}</div>`; return; }
    box.innerHTML = res.messages.length
      ? res.messages.map(msgCardHTML).join("")
      : `<div class="empty-note">No messages yet. Submissions to the contact form will appear here.</div>`;
  });
}

/* ---------- Profile ---------- */
function renderProfile(mount) {
  const p = Store.get("PROFILE") || {};
  const links = p.links || {};
  const f = (label, name, val, type) => `
    <div class="f-field"><label>${label}</label>
      ${type === "textarea"
        ? `<textarea data-k="${name}">${esc(val)}</textarea>`
        : `<input data-k="${name}" value="${esc(val)}" />`}</div>`;
  mount.innerHTML = `
    <div class="card panel">
      <div class="form-grid two">
        ${f("Name", "name", p.name)}
        ${f("Short name", "shortName", p.shortName)}
        ${f("Initials", "initials", p.initials)}
        ${f("Location", "location", p.location)}
        ${f("Email", "email", p.email)}
        ${f("Phone", "phone", p.phone)}
      </div>
      <div class="form-grid" style="margin-top:1rem">
        ${f("Title", "title", p.title)}
        ${f("Tagline", "tagline", p.tagline)}
        ${f("Summary", "summary", p.summary, "textarea")}
        ${f("Mission", "mission", p.mission, "textarea")}
        ${f("CV URL", "cvUrl", p.cvUrl)}
      </div>
      <h2 style="font-size:1rem;margin:1.4rem 0 .8rem">Links</h2>
      <div class="form-grid two">
        <div class="f-field"><label>GitHub</label><input data-l="github" value="${esc(links.github)}" /></div>
        <div class="f-field"><label>LinkedIn</label><input data-l="linkedin" value="${esc(links.linkedin)}" /></div>
        <div class="f-field"><label>Google Scholar</label><input data-l="scholar" value="${esc(links.scholar)}" /></div>
        <div class="f-field"><label>ResearchGate</label><input data-l="researchgate" value="${esc(links.researchgate)}" /></div>
      </div>
      <div style="display:flex;gap:.6rem;margin-top:1.4rem">
        <button class="btn btn-primary" id="saveProfile">${ICON.check} Save profile</button>
        <button class="btn btn-outline" id="resetProfile">Reset</button>
      </div>
    </div>`;
  el("saveProfile").addEventListener("click", () => {
    const next = { ...p, links: { ...links } };
    mount.querySelectorAll("[data-k]").forEach((i) => { next[i.dataset.k] = i.value; });
    mount.querySelectorAll("[data-l]").forEach((i) => { next.links[i.dataset.l] = i.value; });
    Store.set("PROFILE", next);
    buildSidebar(); navigate("profile");
    toast("Profile saved");
  });
  el("resetProfile").addEventListener("click", () => { Store.reset("PROFILE"); renderProfile(mount); toast("Profile reset"); });
}

/* ---------- Settings ---------- */
function renderSettings(mount) {
  mount.innerHTML = `
    <div class="card panel">
      <div class="panel-head"><h2>Backend API token</h2></div>
      <p class="muted" style="color:var(--text-muted);font-size:.92rem;margin:0 0 1rem">
        Used to load contact messages from the Python backend. It must match <span class="mono">ADMIN_TOKEN</span> in <span class="mono">backend/.env</span>.</p>
      <div class="f-field"><label>Admin token</label><input id="apiToken" type="password" value="${esc(getToken())}" placeholder="paste token" /></div>
      <div style="margin-top:1rem"><button class="btn btn-primary" id="saveToken">${ICON.check} Save token</button></div>
    </div>
    <div class="card panel">
      <div class="panel-head"><h2>Local content edits</h2></div>
      <p class="muted" style="color:var(--text-muted);font-size:.92rem;margin:0 0 1rem">
        Edits you make here are stored in this browser only (localStorage). Reset to restore the original <span class="mono">data.js</span> content.</p>
      <button class="btn btn-danger" id="resetAll">${ICON.trash} Reset all local edits</button>
    </div>
    <div class="card panel">
      <div class="panel-head"><h2>Access</h2></div>
      <p class="muted" style="color:var(--text-muted);font-size:.92rem;margin:0">
        The dashboard passcode (<span class="mono">${esc(PASSCODE)}</span>) is a client-side gate set in <span class="mono">admin.js</span>. It is for prototyping convenience, not security.</p>
    </div>`;
  el("saveToken").addEventListener("click", () => { setToken(el("apiToken").value.trim()); toast("Token saved"); });
  el("resetAll").addEventListener("click", () => {
    if (!confirm("Reset ALL local content edits to the original data.js?")) return;
    Store.resetAll(); buildSidebar(); toast("All edits reset"); navigate(currentSection);
  });
}

/* ---------- gate / shell ---------- */
function unlock() {
  el("gate").classList.add("hidden");
  buildSidebar();
  const start = (location.hash || "").replace("#", "");
  navigate(SECTIONS.some((s) => s.key === start) ? start : "overview");
}
function lock() {
  try { sessionStorage.removeItem("afraz-admin"); } catch (e) {}
  el("gate").classList.remove("hidden");
  el("gatePass").value = "";
}
function openSidebar() { el("sidebar").classList.add("open"); el("scrim").classList.add("show"); }
function closeSidebar() { el("sidebar").classList.remove("open"); el("scrim").classList.remove("show"); }

function initAdmin() {
  // gate form
  el("gateForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (el("gatePass").value === PASSCODE) {
      try { sessionStorage.setItem("afraz-admin", "1"); } catch (er) {}
      el("gateErr").classList.remove("show");
      unlock();
    } else {
      el("gateErr").classList.add("show");
    }
  });

  // chrome wiring
  el("menuBtn").innerHTML = ICON.menu;
  el("menuBtn").addEventListener("click", openSidebar);
  el("scrim").addEventListener("click", closeSidebar);
  el("modalClose").innerHTML = ICON.close;
  el("modalClose").addEventListener("click", closeModal);
  el("modalBackdrop").addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  // gate mark
  el("gateMark").textContent = (typeof PROFILE !== "undefined" && PROFILE.initials) || "AH";

  let authed = false;
  try { authed = sessionStorage.getItem("afraz-admin") === "1"; } catch (e) {}
  if (authed) unlock();
}

/* =========================================================================
   admin.js — dashboard shell, auth, router, shared helpers, overview, blog
   (plain script: shares global scope with data.js / store.js / site.js)
   ========================================================================= */

const AUTH_CODE = "afraz25627377";      // change this passcode
const AUTH_KEY = "afraz-admin-session";

const SECTIONS = [
  { id: "overview",     label: "Overview",     icon: "grid" },
  { id: "blog",         label: "Blog Posts",   icon: "doc",   coll: "BLOGS" },
  { id: "projects",     label: "Projects",     icon: "layers", coll: "PROJECTS" },
  { id: "publications", label: "Publications", icon: "paper", coll: "PUBLICATIONS" },
  { id: "skills",       label: "Skills",       icon: "flask", coll: "SKILLS" },
  { id: "profile",      label: "Profile",      icon: "user" },
  { id: "export",       label: "Export",       icon: "download" },
];

const RENDERERS = {};   // section id -> function(); populated here + in admin-collections.js
let CURRENT_SECTION = "overview";

/* ---------------- boot ---------------- */
function initAdmin() {
  document.getElementById("gateMark").innerHTML = '<img src="' + (PROFILE.logo || 'assets/img/profile_logo.png') + '" alt="' + PROFILE.shortName + '" />';

  // auth
  if (sessionStorage.getItem(AUTH_KEY) === "1") unlock();
  const gf = document.getElementById("gateForm");
  gf.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = document.getElementById("gatePass").value.trim();
    if (v === AUTH_CODE) { sessionStorage.setItem(AUTH_KEY, "1"); unlock(); }
    else { document.getElementById("gateErr").classList.add("show"); }
  });

  // modal close
  document.getElementById("modalClose").innerHTML = ICON.close;
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalBackdrop").addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

  // menu (mobile)
  document.getElementById("menuBtn").innerHTML = ICON.menu;
  document.getElementById("menuBtn").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
    document.getElementById("scrim").classList.toggle("open");
  });
  document.getElementById("scrim").addEventListener("click", closeSidebar);
}

function unlock() {
  document.getElementById("gate").style.display = "none";
  buildSidebar();
  route(location.hash.replace("#", "") || "overview");
}

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("scrim").classList.remove("open");
}

/* ---------------- sidebar ---------------- */
function collCount(coll) {
  const c = Store.collections();
  return c[coll] ? c[coll].length : null;
}

function buildSidebar() {
  const sb = document.getElementById("sidebar");
  const nav = SECTIONS.map((s) => {
    const cnt = s.coll != null ? collCount(s.coll) : null;
    return `<button class="side-link" data-sec="${s.id}">${ICON[s.icon] || ICON.grid}<span>${s.label}</span>${cnt != null ? `<span class="count">${cnt}</span>` : ""}</button>`;
  }).join("");

  sb.innerHTML = `
    <a class="brand" href="index.html">
      <span class="mark"><img src="${PROFILE.logo || 'assets/img/profile_logo.png'}" alt="${PROFILE.shortName}" /></span>
      <span>${PROFILE.shortName} <span class="mark-sub">/ Admin</span></span>
    </a>
    <div class="side-label">Manage</div>
    <nav class="side-nav">${nav}</nav>
    <div class="side-foot">
      <a class="side-link" href="index.html" target="_blank">${ICON.external}<span>View live site</span></a>
      <button class="side-link" id="adminTheme">${ICON.moon}${ICON.sun}<span>Toggle theme</span></button>
      <button class="side-link" id="adminLogout">${ICON.logout}<span>Log out</span></button>
    </div>`;

  sb.querySelectorAll("[data-sec]").forEach((b) =>
    b.addEventListener("click", () => { route(b.dataset.sec); closeSidebar(); }));

  document.getElementById("adminTheme").addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme");
    applyTheme(cur === "dark" ? "light" : "dark");
  });
  document.getElementById("adminLogout").addEventListener("click", () => {
    sessionStorage.removeItem(AUTH_KEY); location.reload();
  });
}

function refreshSidebarCounts() {
  document.querySelectorAll("#sidebar [data-sec]").forEach((b) => {
    const s = SECTIONS.find((x) => x.id === b.dataset.sec);
    if (s && s.coll != null) {
      const c = b.querySelector(".count");
      if (c) c.textContent = collCount(s.coll);
    }
    b.classList.toggle("active", b.dataset.sec === CURRENT_SECTION);
  });
}

/* ---------------- router ---------------- */
function route(section) {
  if (!RENDERERS[section]) section = "overview";
  CURRENT_SECTION = section;
  history.replaceState(null, "", "#" + section);
  refreshSidebarCounts();
  document.getElementById("topAction").innerHTML = "";
  RENDERERS[section]();
  document.getElementById("content").scrollTo ? window.scrollTo(0, 0) : null;
}

function setTop(title, sub) {
  document.getElementById("secTitle").textContent = title;
  document.getElementById("secSub").textContent = sub || "";
}

function topAction(label, onClick, icon) {
  const wrap = document.getElementById("topAction");
  const btn = document.createElement("button");
  btn.className = "btn btn-primary";
  btn.innerHTML = (icon ? ICON[icon] : ICON.plus) + " " + label;
  btn.addEventListener("click", onClick);
  wrap.appendChild(btn);
  return btn;
}

/* ---------------- persistence + toast ---------------- */
function persist(msg) {
  const ok = Store.save();
  refreshSidebarCounts();
  if (ok) toast(msg || "Saved");
  else toast("Couldn't save — browser storage is full. Remove a large image, or use Export to bake changes into the site.");
}

function toast(msg) {
  const wrap = document.getElementById("toasts");
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `<span class="ti">${ICON.check}</span><span>${msg}</span>`;
  wrap.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, 2400);
}

/* ---------------- modal ---------------- */
let MODAL_SAVE = null;
function openModal(opts) {
  document.getElementById("modalTitle").textContent = opts.title || "Edit";
  document.getElementById("modalBody").innerHTML = opts.body || "";
  const foot = document.getElementById("modalFoot");
  foot.innerHTML = "";
  const cancel = document.createElement("button");
  cancel.className = "btn btn-outline"; cancel.textContent = "Cancel";
  cancel.addEventListener("click", closeModal);
  const save = document.createElement("button");
  save.className = "btn btn-primary"; save.textContent = opts.saveLabel || "Save";
  save.addEventListener("click", () => { if (opts.onSave) opts.onSave(); });
  foot.appendChild(cancel); foot.appendChild(save);
  MODAL_SAVE = opts.onSave;
  document.getElementById("modal").classList.add("open");
  document.getElementById("modalBackdrop").classList.add("open");
  if (opts.onMount) opts.onMount();
}
function closeModal() {
  document.getElementById("modal").classList.remove("open");
  document.getElementById("modalBackdrop").classList.remove("open");
  MODAL_SAVE = null;
}

function confirmModal(title, message, onYes, danger) {
  openModal({
    title,
    body: `<p style="color:var(--text-muted);line-height:1.6">${message}</p>`,
    saveLabel: danger ? "Delete" : "Confirm",
    onSave: () => { onYes(); closeModal(); },
  });
  if (danger) {
    const s = document.querySelector("#modalFoot .btn-primary");
    if (s) { s.style.background = "oklch(0.6 0.2 25)"; s.style.boxShadow = "none"; }
  }
}

/* ---------------- form helpers ---------------- */
function val(id) { const e = document.getElementById(id); return e ? e.value.trim() : ""; }

function fieldText(id, label, value, opts) {
  opts = opts || {};
  return `<div class="fld">
    <label for="${id}">${label}</label>
    <input id="${id}" type="${opts.type || "text"}" value="${escapeAttr(value || "")}" placeholder="${opts.ph || ""}" />
    ${opts.help ? `<span class="help">${opts.help}</span>` : ""}
  </div>`;
}
function fieldArea(id, label, value, opts) {
  opts = opts || {};
  return `<div class="fld">
    <label for="${id}">${label}</label>
    <textarea id="${id}" class="${opts.tall ? "tall" : ""}" placeholder="${opts.ph || ""}">${escapeHtml(value || "")}</textarea>
    ${opts.help ? `<span class="help">${opts.help}</span>` : ""}
  </div>`;
}
function fieldSelect(id, label, value, options) {
  return `<div class="fld">
    <label for="${id}">${label}</label>
    <select id="${id}">${options.map((o) => `<option value="${escapeAttr(o)}" ${o === value ? "selected" : ""}>${o}</option>`).join("")}</select>
  </div>`;
}
function fieldToggle(id, label, checked) {
  return `<label class="switch"><input type="checkbox" id="${id}" ${checked ? "checked" : ""}><span class="track"></span><span class="sw-label">${label}</span></label>`;
}

function escapeHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function escapeAttr(s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;"); }

/* Image field: upload (auto-compressed) or paste a URL.
   Returns an element with .getValue() → data URL / URL / "". */
function imageField(opts) {
  opts = opts || {};
  const wrap = document.createElement("div");
  wrap.className = "fld img-field";
  let value = opts.value || "";
  function isUrl(v) { return v && v.slice(0, 5) !== "data:"; }
  function render() {
    const has = !!value;
    wrap.innerHTML = `
      <label>${opts.label || "Image"}</label>
      <div class="img-field-row">
        <div class="img-preview${has ? "" : " empty"}" style="${opts.aspect ? `aspect-ratio:${opts.aspect};` : ""}">
          ${has ? `<img src="${escapeAttr(value)}" alt="">` : `<span>${ICON.image}</span>`}
        </div>
        <div class="img-field-actions">
          <button type="button" class="mini-btn" data-act="pick">${ICON.image} ${has ? "Replace" : "Upload image"}</button>
          ${has ? `<button type="button" class="mini-btn" data-act="remove">${ICON.trash} Remove</button>` : ""}
        </div>
      </div>
      <input type="url" class="img-url" placeholder="…or paste an image URL" value="${isUrl(value) ? escapeAttr(value) : ""}">
      ${opts.help ? `<span class="help">${opts.help}</span>` : ""}`;
    wrap.querySelector('[data-act="pick"]').addEventListener("click", pick);
    const rm = wrap.querySelector('[data-act="remove"]');
    if (rm) rm.addEventListener("click", () => { value = ""; render(); });
    const url = wrap.querySelector(".img-url");
    url.addEventListener("input", () => { value = url.value.trim(); refreshPreview(); });
  }
  function refreshPreview() {
    const box = wrap.querySelector(".img-preview");
    if (!box) return;
    box.classList.toggle("empty", !value);
    box.innerHTML = value ? `<img src="${escapeAttr(value)}" alt="">` : `<span>${ICON.image}</span>`;
  }
  function pick() {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*"; input.style.display = "none";
    document.body.appendChild(input);
    input.addEventListener("change", () => {
      const f = input.files && input.files[0];
      input.remove();
      if (!f) return;
      Store.readImage(f, { mime: opts.mime || "image/jpeg", maxDim: opts.maxDim || 1600, quality: opts.quality || 0.82 })
        .then((dataUrl) => {
          if (dataUrl.length > 1.4 * 1024 * 1024) toast("Large image — it may not save. Try a smaller file.");
          value = dataUrl; render(); if (opts.onChange) opts.onChange(value);
        })
        .catch(() => toast("Couldn't read that image"));
    });
    input.click();
  }
  render();
  wrap.getValue = () => value;
  return wrap;
}

/* Tag editor: returns an element with .getTags() */
function tagEditor(initial) {
  const wrap = document.createElement("div");
  wrap.className = "tag-input-wrap";
  let tags = (initial || []).slice();
  const input = document.createElement("input");
  input.placeholder = "Type a tag, press Enter";
  function render() {
    wrap.querySelectorAll(".tag-chip").forEach((c) => c.remove());
    tags.forEach((t, i) => {
      const chip = document.createElement("span");
      chip.className = "tag-chip";
      chip.innerHTML = `${escapeHtml(t)} <button type="button" aria-label="Remove">${ICON.close}</button>`;
      chip.querySelector("button").addEventListener("click", () => { tags.splice(i, 1); render(); });
      wrap.insertBefore(chip, input);
    });
  }
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const v = input.value.trim().replace(/,$/, "");
      if (v && !tags.includes(v)) { tags.push(v); input.value = ""; render(); }
    } else if (e.key === "Backspace" && !input.value && tags.length) {
      tags.pop(); render();
    }
  });
  wrap.appendChild(input);
  render();
  wrap.getTags = () => tags.slice();
  return wrap;
}

/* Key/value repeatable rows (e.g. project results). Returns el with .getRows() */
function kvEditor(initial, kPh, vPh) {
  const wrap = document.createElement("div");
  wrap.style.display = "grid"; wrap.style.gap = ".5rem";
  let rows = (initial || []).map((r) => ({ k: r.k, v: r.v }));
  if (!rows.length) rows = [{ k: "", v: "" }];
  const list = document.createElement("div");
  list.style.display = "grid"; list.style.gap = ".5rem";
  function render() {
    list.innerHTML = "";
    rows.forEach((r, i) => {
      const row = document.createElement("div");
      row.className = "kv-row";
      row.innerHTML = `<input placeholder="${kPh || "Label"}" value="${escapeAttr(r.k)}"><input placeholder="${vPh || "Value"}" value="${escapeAttr(r.v)}"><button class="icon-btn danger" type="button">${ICON.trash}</button>`;
      const [ki, vi] = row.querySelectorAll("input");
      ki.addEventListener("input", () => r.k = ki.value);
      vi.addEventListener("input", () => r.v = vi.value);
      row.querySelector("button").addEventListener("click", () => { rows.splice(i, 1); if (!rows.length) rows.push({ k: "", v: "" }); render(); });
      list.appendChild(row);
    });
  }
  const add = document.createElement("button");
  add.className = "mini-btn"; add.type = "button"; add.innerHTML = ICON.plus + " Add row";
  add.addEventListener("click", () => { rows.push({ k: "", v: "" }); render(); });
  wrap.appendChild(list); wrap.appendChild(add);
  render();
  wrap.getRows = () => rows.filter((r) => r.k || r.v);
  return wrap;
}

/* String-list repeatable (e.g. authors, skill items). Returns el with .getItems() */
function listEditor(initial, ph) {
  const wrap = document.createElement("div");
  wrap.style.display = "grid"; wrap.style.gap = ".5rem";
  let rows = (initial || []).slice();
  if (!rows.length) rows = [""];
  const list = document.createElement("div");
  list.style.display = "grid"; list.style.gap = ".5rem";
  function render() {
    list.innerHTML = "";
    rows.forEach((r, i) => {
      const row = document.createElement("div");
      row.className = "kv-row"; row.style.gridTemplateColumns = "1fr auto";
      row.innerHTML = `<input placeholder="${ph || "Item"}" value="${escapeAttr(r)}"><button class="icon-btn danger" type="button">${ICON.trash}</button>`;
      const inp = row.querySelector("input");
      inp.addEventListener("input", () => rows[i] = inp.value);
      row.querySelector("button").addEventListener("click", () => { rows.splice(i, 1); if (!rows.length) rows.push(""); render(); });
      list.appendChild(row);
    });
  }
  const add = document.createElement("button");
  add.className = "mini-btn"; add.type = "button"; add.innerHTML = ICON.plus + " Add";
  add.addEventListener("click", () => { rows.push(""); render(); });
  wrap.appendChild(list); wrap.appendChild(add);
  render();
  wrap.getItems = () => rows.map((r) => r.trim()).filter(Boolean);
  return wrap;
}

/* ---------------- OVERVIEW ---------------- */
RENDERERS.overview = function () {
  setTop("Overview", "Welcome back, " + PROFILE.shortName);
  const c = Store.collections();
  const cards = [
    { icon: "doc", n: c.BLOGS.length, l: "Blog posts" },
    { icon: "layers", n: c.PROJECTS.length, l: "Projects" },
    { icon: "paper", n: c.PUBLICATIONS.length, l: "Publications" },
    { icon: "flask", n: c.SKILLS.reduce((a, s) => a + s.items.length, 0), l: "Skills listed" },
  ];
  const recent = c.BLOGS.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 4);
  document.getElementById("content").innerHTML = `
    <div class="ov-grid">
      ${cards.map((k) => `<div class="ov-card"><div class="ico">${ICON[k.icon]}</div><div class="n">${k.n}</div><div class="l">${k.l}</div></div>`).join("")}
    </div>
    <div class="panel" style="margin-bottom:1.5rem">
      <div class="panel-head"><h2>Quick actions</h2></div>
      <div style="padding:1.3rem"><div class="quick-actions" id="qa"></div></div>
    </div>
    <div class="panel">
      <div class="panel-head"><h2>Recent posts</h2><a class="link-more" style="cursor:pointer" id="goBlog">Manage all ${ICON.arrow}</a></div>
      ${recent.map((b) => `<div class="list-row"><div class="ix">${ICON.doc}</div><div><div class="rtitle">${b.title}</div><div class="rmeta"><span class="pill pill-cat">${b.category}</span><span>${fmtDate(b.date)}</span></div></div><div class="row-actions"><a class="icon-btn" href="blog-post.html?id=${b.id}" target="_blank">${ICON.external}</a></div></div>`).join("")}
    </div>`;
  const qa = document.getElementById("qa");
  [["New blog post", () => { location.href = "editor.html"; }],
   ["Add project", () => { route("projects"); setTimeout(() => projectForm(null), 50); }],
   ["Add publication", () => { route("publications"); setTimeout(() => pubForm(null), 50); }],
   ["Export data.js", () => route("export")]].forEach(([l, fn]) => {
    const b = document.createElement("button"); b.className = "btn btn-outline"; b.innerHTML = ICON.plus + " " + l;
    b.addEventListener("click", fn); qa.appendChild(b);
  });
  document.getElementById("goBlog").addEventListener("click", () => route("blog"));
};

/* ---------------- BLOG ---------------- */
RENDERERS.blog = function () {
  setTop("Blog Posts", BLOGS.length + " posts");
  topAction("New post", () => { location.href = "editor.html"; });
  const rows = BLOGS.map((b, i) => `
    <div class="list-row">
      <div class="ix">${String(i + 1).padStart(2, "0")}</div>
      <div>
        <div class="rtitle">${b.title}</div>
        <div class="rmeta"><span class="pill pill-cat">${b.category}</span><span>${fmtDate(b.date)}</span><span class="dotsep"></span><span>${b.read} min</span>${b.body ? "" : `<span class="pill pill-off">no body</span>`}</div>
      </div>
      <div class="row-actions">
        <a class="icon-btn" href="blog-post.html?id=${b.id}" target="_blank" title="Preview">${ICON.external}</a>
        <button class="icon-btn" data-edit="${b.id}" title="Edit in writer">${ICON.edit}</button>
        <button class="icon-btn danger" data-del="${b.id}" title="Delete">${ICON.trash}</button>
      </div>
    </div>`).join("");
  document.getElementById("content").innerHTML = `<div class="panel">${rows || `<div class="empty">No posts yet. Create your first one.</div>`}</div>`;
  document.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => { location.href = "editor.html?id=" + b.dataset.edit; }));
  document.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => {
    const post = BLOGS.find((x) => x.id === b.dataset.del);
    confirmModal("Delete post", `Delete “${post.title}”? This cannot be undone.`, () => {
      const i = BLOGS.findIndex((x) => x.id === b.dataset.del);
      BLOGS.splice(i, 1); persist("Post deleted"); route("blog");
    }, true);
  }));
};

function blogForm(id) {
  const editing = id ? BLOGS.find((b) => b.id === id) : null;
  const cats = BLOG_CATEGORIES.filter((c) => c !== "All");
  openModal({
    title: editing ? "Edit post" : "New post",
    saveLabel: editing ? "Save changes" : "Create post",
    body: `
      ${fieldText("b_title", "Title", editing ? editing.title : "")}
      <div class="grid-2c">
        ${fieldSelect("b_cat", "Category", editing ? editing.category : cats[0], cats)}
        ${fieldText("b_date", "Date", editing ? editing.date : new Date().toISOString().slice(0, 10), { type: "date" })}
      </div>
      <div class="grid-2c">
        ${fieldText("b_read", "Read time (min)", editing ? editing.read : "6", { type: "number" })}
        ${fieldText("b_id", "Slug / ID", editing ? editing.id : "", { help: "Leave blank to auto-generate from title", ph: "auto" })}
      </div>
      ${fieldArea("b_summary", "Summary", editing ? editing.summary : "", { ph: "One or two sentences shown on cards." })}
      <div id="b_cover_mount"></div>
      <div class="fld"><label>Tags</label><div id="b_tags_mount"></div></div>
      ${fieldArea("b_body", "Article body (HTML)", editing ? editing.body || "" : "", { tall: true, help: "Use <h2 id=\"…\">, <p>, <ul>, <blockquote>, <code>. Headings build the table of contents." })}
    `,
    onMount: () => {
      const cover = imageField({ label: "Cover image", value: editing ? editing.cover || "" : "", aspect: "16/9", help: "Shown at the top of the article and on blog cards." });
      document.getElementById("b_cover_mount").appendChild(cover); blogForm._cover = cover;
      const te = tagEditor(editing ? editing.tags : []);
      document.getElementById("b_tags_mount").appendChild(te);
      blogForm._tags = te;
    },
    onSave: () => {
      const title = val("b_title");
      if (!title) { toast("Title is required"); return; }
      const data = {
        id: val("b_id") || (editing ? editing.id : Store.slug(title)),
        title,
        category: val("b_cat"),
        date: val("b_date") || new Date().toISOString().slice(0, 10),
        read: parseInt(val("b_read"), 10) || 5,
        summary: val("b_summary"),
        cover: blogForm._cover.getValue() || null,
        tags: blogForm._tags.getTags(),
        body: val("b_body"),
      };
      if (editing) { Object.assign(editing, data); }
      else {
        if (BLOGS.some((b) => b.id === data.id)) data.id += "-" + Date.now().toString().slice(-4);
        BLOGS.unshift(data);
      }
      persist(editing ? "Post updated" : "Post created");
      closeModal(); route("blog");
    },
  });
}

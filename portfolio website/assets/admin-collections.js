/* =========================================================================
   admin-collections.js — Projects, Publications, Skills, Profile, Export
   (uses helpers defined in admin.js; shared global scope)
   ========================================================================= */

/* ---------------- PROJECTS ---------------- */
RENDERERS.projects = function () {
  setTop("Projects", PROJECTS.length + " projects");
  topAction("New project", () => projectForm(null));
  const rows = PROJECTS.map((p, i) => `
    <div class="list-row">
      <div class="ix">${String(i + 1).padStart(2, "0")}</div>
      <div>
        <div class="rtitle">${p.title}</div>
        <div class="rmeta"><span class="pill pill-cat">${p.category}</span><span>${p.org}</span>${p.featured ? `<span class="pill pill-on">Featured</span>` : ""}</div>
      </div>
      <div class="row-actions">
        <button class="icon-btn" data-edit="${p.id}" title="Edit">${ICON.edit}</button>
        <button class="icon-btn danger" data-del="${p.id}" title="Delete">${ICON.trash}</button>
      </div>
    </div>`).join("");
  document.getElementById("content").innerHTML = `<div class="panel">${rows || `<div class="empty">No projects yet.</div>`}</div>`;
  document.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => projectForm(b.dataset.edit)));
  document.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => {
    const p = PROJECTS.find((x) => x.id === b.dataset.del);
    confirmModal("Delete project", `Delete “${p.title}”?`, () => {
      PROJECTS.splice(PROJECTS.findIndex((x) => x.id === b.dataset.del), 1);
      persist("Project deleted"); route("projects");
    }, true);
  }));
};

function projectForm(id) {
  const editing = id ? PROJECTS.find((p) => p.id === id) : null;
  const cats = PROJECT_CATEGORIES.filter((c) => c !== "All");
  openModal({
    title: editing ? "Edit project" : "New project",
    saveLabel: editing ? "Save changes" : "Create project",
    body: `
      ${fieldText("p_title", "Title", editing ? editing.title : "")}
      <div class="grid-2c">
        ${fieldSelect("p_cat", "Category", editing ? editing.category : cats[0], cats)}
        ${fieldText("p_org", "Organisation / context", editing ? editing.org : "")}
      </div>
      ${fieldArea("p_short", "Short description", editing ? editing.short : "", { ph: "One-line summary for cards." })}
      ${fieldArea("p_problem", "Problem", editing ? editing.problem : "")}
      <div class="grid-2c">
        ${fieldText("p_dataset", "Dataset", editing ? editing.dataset : "")}
        ${fieldText("p_id", "Slug / ID", editing ? editing.id : "", { ph: "auto", help: "Blank = from title" })}
      </div>
      ${fieldArea("p_method", "Methodology", editing ? editing.method : "")}
      <div class="fld"><label>Tech stack</label><div id="p_tech_mount"></div></div>
      <div class="fld"><label>Results (label → value)</label><div id="p_results_mount"></div></div>
      <div class="grid-2c">
        ${fieldText("p_github", "GitHub URL", editing ? (editing.links && editing.links.github) || "" : "", { ph: "# or https://…" })}
        ${fieldText("p_paper", "Paper URL", editing ? (editing.links && editing.links.paper) || "" : "")}
      </div>
      <div class="grid-2c">
        ${fieldText("p_demo", "Demo URL", editing ? (editing.links && editing.links.demo) || "" : "")}
        <div class="fld"><label class="fld-label">Featured on home</label>${fieldToggle("p_featured", "Show in featured", editing ? editing.featured : false)}</div>
      </div>
    `,
    onMount: () => {
      const tech = tagEditor(editing ? editing.tech : []);
      document.getElementById("p_tech_mount").appendChild(tech); projectForm._tech = tech;
      const res = kvEditor(editing ? editing.results : [], "Metric", "Value");
      document.getElementById("p_results_mount").appendChild(res); projectForm._res = res;
    },
    onSave: () => {
      const title = val("p_title");
      if (!title) { toast("Title is required"); return; }
      const data = {
        id: val("p_id") || (editing ? editing.id : Store.slug(title)),
        title, category: val("p_cat"), org: val("p_org"),
        featured: document.getElementById("p_featured").checked,
        short: val("p_short"), problem: val("p_problem"),
        dataset: val("p_dataset"), method: val("p_method"),
        tech: projectForm._tech.getTags(),
        results: projectForm._res.getRows(),
        links: { github: val("p_github") || null, paper: val("p_paper") || null, demo: val("p_demo") || null },
      };
      if (editing) Object.assign(editing, data);
      else { if (PROJECTS.some((p) => p.id === data.id)) data.id += "-" + Date.now().toString().slice(-4); PROJECTS.unshift(data); }
      persist(editing ? "Project updated" : "Project created");
      closeModal(); route("projects");
    },
  });
}

/* ---------------- PUBLICATIONS ---------------- */
RENDERERS.publications = function () {
  setTop("Publications", PUBLICATIONS.length + " entries");
  topAction("New publication", () => pubForm(null));
  const rows = PUBLICATIONS.map((p, i) => `
    <div class="list-row">
      <div class="ix">${String(p.n || i + 1).padStart(2, "0")}</div>
      <div>
        <div class="rtitle">${p.title}</div>
        <div class="rmeta"><span class="pill pill-cat">${p.type}</span><span>${p.venue}</span><span class="dotsep"></span><span>${p.year}</span>${p.role ? `<span class="pill ${/first/i.test(p.role) ? "pill-on" : "pill-off"}">${p.role}</span>` : ""}</div>
      </div>
      <div class="row-actions">
        <button class="icon-btn" data-edit="${i}" title="Edit">${ICON.edit}</button>
        <button class="icon-btn danger" data-del="${i}" title="Delete">${ICON.trash}</button>
      </div>
    </div>`).join("");
  document.getElementById("content").innerHTML = `<div class="panel">${rows || `<div class="empty">No publications yet.</div>`}</div>`;
  document.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => pubForm(parseInt(b.dataset.edit, 10))));
  document.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => {
    const idx = parseInt(b.dataset.del, 10); const p = PUBLICATIONS[idx];
    confirmModal("Delete publication", `Delete “${p.title}”?`, () => {
      PUBLICATIONS.splice(idx, 1);
      PUBLICATIONS.forEach((x, i) => x.n = i + 1);
      persist("Publication deleted"); route("publications");
    }, true);
  }));
};

function pubForm(idx) {
  const editing = idx != null ? PUBLICATIONS[idx] : null;
  const types = ["IEEE", "Springer", "Review", "Preprint", "Journal"];
  const roles = ["First author", "Co-author", "Corresponding author"];
  openModal({
    title: editing ? "Edit publication" : "New publication",
    saveLabel: editing ? "Save changes" : "Add publication",
    body: `
      ${fieldText("u_title", "Title", editing ? editing.title : "")}
      <div class="fld"><label>Authors (in order)</label><div id="u_authors_mount"></div><span class="help">Any author containing “Afraz” is highlighted on the site.</span></div>
      <div class="grid-2c">
        ${fieldText("u_venue", "Venue (short)", editing ? editing.venue : "", { ph: "ICCCNT 2024" })}
        ${fieldSelect("u_type", "Publisher", editing ? editing.type : types[0], types)}
      </div>
      ${fieldText("u_venueFull", "Venue (full name)", editing ? editing.venueFull || "" : "")}
      <div class="grid-2c">
        ${fieldSelect("u_role", "Your role", editing ? editing.role || roles[1] : roles[0], roles)}
        ${fieldText("u_year", "Year", editing ? editing.year : new Date().getFullYear(), { type: "number" })}
      </div>
      ${fieldArea("u_note", "One-line contribution / finding", editing ? editing.note || "" : "")}
      <div class="fld"><label>Tags</label><div id="u_tags_mount"></div></div>
      ${fieldText("u_link", "Link (DOI / IEEE Xplore / ResearchGate)", editing ? editing.link || "" : "")}
    `,
    onMount: () => {
      const a = listEditor(editing ? editing.authors : [PROFILE.name], "Author name");
      document.getElementById("u_authors_mount").appendChild(a); pubForm._authors = a;
      const t = tagEditor(editing ? editing.tags : []);
      document.getElementById("u_tags_mount").appendChild(t); pubForm._tags = t;
    },
    onSave: () => {
      const title = val("u_title");
      if (!title) { toast("Title is required"); return; }
      const data = {
        n: editing ? editing.n : PUBLICATIONS.length + 1,
        title, authors: pubForm._authors.getItems(), role: val("u_role"),
        venue: val("u_venue"), venueFull: val("u_venueFull"), type: val("u_type"),
        year: parseInt(val("u_year"), 10) || new Date().getFullYear(),
        tags: pubForm._tags.getTags(), note: val("u_note"), link: val("u_link"),
      };
      if (editing) Object.assign(editing, data);
      else PUBLICATIONS.unshift(data);
      PUBLICATIONS.forEach((x, i) => x.n = i + 1);
      persist(editing ? "Publication updated" : "Publication added");
      closeModal(); route("publications");
    },
  });
}

/* ---------------- SKILLS ---------------- */
RENDERERS.skills = function () {
  setTop("Skills", SKILLS.length + " groups");
  topAction("New group", () => skillForm(null));
  const rows = SKILLS.map((s, i) => `
    <div class="list-row">
      <div class="ix">${String(i + 1).padStart(2, "0")}</div>
      <div>
        <div class="rtitle">${s.group}</div>
        <div class="rmeta">${s.items.map((it) => `<span class="pill pill-off">${it}</span>`).join(" ")}</div>
      </div>
      <div class="row-actions">
        <button class="icon-btn" data-edit="${i}" title="Edit">${ICON.edit}</button>
        <button class="icon-btn danger" data-del="${i}" title="Delete">${ICON.trash}</button>
      </div>
    </div>`).join("");
  document.getElementById("content").innerHTML = `<div class="panel">${rows || `<div class="empty">No skill groups yet.</div>`}</div>`;
  document.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => skillForm(parseInt(b.dataset.edit, 10))));
  document.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => {
    const idx = parseInt(b.dataset.del, 10); const s = SKILLS[idx];
    confirmModal("Delete group", `Delete the “${s.group}” skill group?`, () => {
      SKILLS.splice(idx, 1); persist("Skill group deleted"); route("skills");
    }, true);
  }));
};

function skillForm(idx) {
  const editing = idx != null ? SKILLS[idx] : null;
  openModal({
    title: editing ? "Edit skill group" : "New skill group",
    saveLabel: editing ? "Save changes" : "Create group",
    body: `
      ${fieldText("s_group", "Group name", editing ? editing.group : "", { ph: "e.g. Machine Learning" })}
      <div class="fld"><label>Skills in this group</label><div id="s_items_mount"></div></div>
    `,
    onMount: () => {
      const it = listEditor(editing ? editing.items : [], "Skill");
      document.getElementById("s_items_mount").appendChild(it); skillForm._items = it;
    },
    onSave: () => {
      const group = val("s_group");
      if (!group) { toast("Group name is required"); return; }
      const data = { group, items: skillForm._items.getItems() };
      if (editing) Object.assign(editing, data);
      else SKILLS.push(data);
      persist(editing ? "Group updated" : "Group created");
      closeModal(); route("skills");
    },
  });
}

/* ---------------- PROFILE ---------------- */
RENDERERS.profile = function () {
  setTop("Profile", "Your identity, summary, links and headline stats");
  const p = PROFILE;
  const L = p.links || {};
  document.getElementById("content").innerHTML = `
    <div class="panel" style="margin-bottom:1.5rem">
      <div class="panel-head"><h2>Identity</h2></div>
      <div style="padding:1.3rem;display:grid;gap:1.1rem">
        <div class="grid-2c">
          ${fieldText("pr_name", "Full name", p.name)}
          ${fieldText("pr_short", "Short name", p.shortName)}
        </div>
        <div class="grid-2c">
          ${fieldText("pr_initials", "Initials (logo)", p.initials)}
          ${fieldText("pr_location", "Location", p.location)}
        </div>
        ${fieldText("pr_title", "Title / role line", p.title)}
        ${fieldArea("pr_summary", "Short summary (hero + footer)", p.summary)}
        ${fieldArea("pr_long", "Long summary (about page)", p.longSummary)}
        ${fieldArea("pr_mission", "Mission statement", p.mission)}
      </div>
    </div>
    <div class="panel" style="margin-bottom:1.5rem">
      <div class="panel-head"><h2>Contact &amp; links</h2></div>
      <div style="padding:1.3rem;display:grid;gap:1.1rem">
        <div class="grid-2c">
          ${fieldText("pr_email", "Email", p.email, { type: "email" })}
          ${fieldText("pr_phone", "Phone", p.phone)}
        </div>
        <div class="fld" id="cv_block"></div>
        <div class="grid-2c">
          ${fieldText("pr_github", "GitHub", L.github)}
          ${fieldText("pr_linkedin", "LinkedIn", L.linkedin)}
        </div>
        <div class="grid-2c">
          ${fieldText("pr_scholar", "Google Scholar", L.scholar)}
          ${fieldText("pr_rg", "ResearchGate", L.researchgate)}
        </div>
      </div>
    </div>
    <div class="panel" style="margin-bottom:1.5rem">
      <div class="panel-head"><h2>Headline stats</h2><span class="sub" style="color:var(--text-faint);font-size:.83rem">Shown on the home hero</span></div>
      <div style="padding:1.3rem"><div id="stats_mount"></div></div>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:.7rem">
      <button class="btn btn-primary" id="pr_save">${ICON.check} Save profile</button>
    </div>`;

  // stats editor
  const statsWrap = document.createElement("div");
  statsWrap.style.display = "grid"; statsWrap.style.gap = ".7rem";
  let stats = STATS.map((s) => ({ value: s.value, suffix: s.suffix || "", label: s.label, sub: s.sub || "" }));
  function renderStats() {
    statsWrap.innerHTML = "";
    stats.forEach((s, i) => {
      const row = document.createElement("div");
      row.style.display = "grid"; row.style.gridTemplateColumns = "80px 60px 1fr 1fr auto"; row.style.gap = ".5rem"; row.style.alignItems = "center";
      row.innerHTML = `<input value="${escapeAttr(s.value)}" placeholder="Value"><input value="${escapeAttr(s.suffix)}" placeholder="+"><input value="${escapeAttr(s.label)}" placeholder="Label"><input value="${escapeAttr(s.sub)}" placeholder="Sublabel"><button class="icon-btn danger" type="button">${ICON.trash}</button>`;
      const ins = row.querySelectorAll("input");
      ins[0].addEventListener("input", () => s.value = ins[0].value);
      ins[1].addEventListener("input", () => s.suffix = ins[1].value);
      ins[2].addEventListener("input", () => s.label = ins[2].value);
      ins[3].addEventListener("input", () => s.sub = ins[3].value);
      row.querySelector("button").addEventListener("click", () => { stats.splice(i, 1); renderStats(); });
      statsWrap.appendChild(row);
    });
    const add = document.createElement("button");
    add.className = "mini-btn"; add.type = "button"; add.innerHTML = ICON.plus + " Add stat";
    add.addEventListener("click", () => { stats.push({ value: 0, suffix: "", label: "", sub: "" }); renderStats(); });
    statsWrap.appendChild(add);
  }
  renderStats();
  document.getElementById("stats_mount").appendChild(statsWrap);

  // CV: hosted URL or an uploaded PDF (embedded as a data URL in this browser)
  let cvValue = p.cvUrl || "";
  const isCvFile = (u) => typeof u === "string" && u.slice(0, 5) === "data:";
  function renderCvBlock() {
    const wrap = document.getElementById("cv_block");
    if (!wrap) return;
    const file = isCvFile(cvValue);
    wrap.innerHTML = `
      <label>CV / Resume</label>
      ${file
        ? `<div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
             <span class="badge">${ICON.doc} Uploaded PDF</span>
             <a class="mini-btn" href="${cvValue}" target="_blank" rel="noopener">Open</a>
             <button type="button" class="mini-btn" id="cv_replace">${ICON.download} Replace</button>
             <button type="button" class="mini-btn" id="cv_remove">${ICON.trash} Remove</button>
           </div>`
        : `<input id="cv_url" type="url" value="${escapeAttr(cvValue)}" placeholder="https://… link to a hosted CV" />
           <div style="margin-top:.6rem"><button type="button" class="mini-btn" id="cv_upload">${ICON.download} Upload PDF</button></div>`}
      <span class="help">Paste a hosted link, or upload a PDF (stored in this browser). The “CV” buttons across the site use this. Tip: use <b>Export</b> to bake an uploaded CV into the published site.</span>`;
    const urlInput = document.getElementById("cv_url");
    if (urlInput) urlInput.addEventListener("input", () => { cvValue = urlInput.value.trim(); });
    const up = document.getElementById("cv_upload") || document.getElementById("cv_replace");
    if (up) up.addEventListener("click", pickCv);
    const rm = document.getElementById("cv_remove");
    if (rm) rm.addEventListener("click", () => { cvValue = ""; renderCvBlock(); });
  }
  function pickCv() {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "application/pdf,.pdf"; input.style.display = "none";
    document.body.appendChild(input);
    input.addEventListener("change", () => {
      const f = input.files && input.files[0];
      if (!f) { input.remove(); return; }
      if (f.type !== "application/pdf" && !/\.pdf$/i.test(f.name)) { toast("Please choose a PDF file"); input.remove(); return; }
      if (f.size > 3 * 1024 * 1024) toast("PDF is large (>3MB) — it may not save in the browser");
      const reader = new FileReader();
      reader.onload = () => { cvValue = reader.result; renderCvBlock(); toast("CV ready — click Save profile"); };
      reader.onerror = () => toast("Couldn't read that file");
      reader.readAsDataURL(f);
      input.remove();
    });
    input.click();
  }
  renderCvBlock();

  document.getElementById("pr_save").addEventListener("click", () => {
    Object.assign(PROFILE, {
      name: val("pr_name"), shortName: val("pr_short"), initials: val("pr_initials"),
      location: val("pr_location"), title: val("pr_title"),
      summary: val("pr_summary"), longSummary: val("pr_long"), mission: val("pr_mission"),
      email: val("pr_email"), phone: val("pr_phone"), cvUrl: cvValue,
    });
    PROFILE.links = Object.assign({}, PROFILE.links, {
      github: val("pr_github"), linkedin: val("pr_linkedin"),
      scholar: val("pr_scholar"), researchgate: val("pr_rg"),
    });
    STATS.length = 0;
    stats.forEach((s) => STATS.push({ value: parseFloat(s.value) || 0, suffix: s.suffix, label: s.label, sub: s.sub }));
    persist("Profile saved");
  });
};

/* ---------------- EXPORT ---------------- */
RENDERERS.export = function () {
  setTop("Export", "Push your edits to the live site");
  const code = Store.generateDataJs();
  document.getElementById("content").innerHTML = `
    <div class="panel" style="margin-bottom:1.5rem">
      <div style="padding:1.3rem 1.3rem .4rem">
        <p style="color:var(--text-muted);line-height:1.6;margin-bottom:1rem">Your changes are saved in this browser and already show on the live preview. To make them permanent for everyone, copy the generated code below into <code class="mono" style="color:var(--accent)">assets/data.js</code> (replacing the matching <code class="mono" style="color:var(--accent)">const</code> blocks), or download it.</p>
        <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-bottom:1rem">
          <button class="btn btn-primary" id="ex_copy">${ICON.doc} Copy to clipboard</button>
          <button class="btn btn-outline" id="ex_dl">${ICON.download} Download data.js</button>
          <button class="btn btn-ghost" id="ex_reset" style="color:oklch(0.7 0.18 25)">${ICON.trash} Reset all to defaults</button>
        </div>
      </div>
      <div style="padding:0 1.3rem 1.3rem"><textarea class="export-area" id="ex_area" readonly>${escapeHtml(code)}</textarea></div>
    </div>`;
  document.getElementById("ex_copy").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(code); toast("Copied to clipboard"); }
    catch (e) { document.getElementById("ex_area").select(); toast("Select-all ready — press Ctrl/Cmd+C"); }
  });
  document.getElementById("ex_dl").addEventListener("click", () => {
    const blob = new Blob([code], { type: "text/javascript" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "data.js"; a.click();
    URL.revokeObjectURL(a.href); toast("Downloaded data.js");
  });
  document.getElementById("ex_reset").addEventListener("click", () => {
    confirmModal("Reset everything", "Discard all edits and restore the original content? This clears your saved changes in this browser.", () => {
      Store.reset(); toast("Reset — reloading…"); setTimeout(() => location.reload(), 700);
    }, true);
  });
};

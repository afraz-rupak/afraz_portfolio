/* =========================================================================
   admin-collections.js — schema-driven CRUD for the data.js collections.

   Registers window.AdminCollections used by admin.js. Each collection maps to
   a Store key (a global array from data.js); edits persist via Store.
   Field types: text | textarea | number | checkbox | tags | lines | json | select
   ========================================================================= */
(function () {
  const catOptions = (typeof PROJECT_CATEGORIES !== "undefined")
    ? PROJECT_CATEGORIES.filter((c) => c !== "All") : [];

  const COLLECTIONS = {
    projects: {
      storeKey: "PROJECTS", singular: "Project", idField: "id",
      title: (p) => p.title, subtitle: (p) => `${p.category} · ${p.org || ""}`,
      blank: { id: "", title: "", category: catOptions[0] || "", org: "", featured: false, cover: "",
        short: "", problem: "", dataset: "", method: "", tech: [], results: [], links: { github: "#", paper: null, demo: null } },
      fields: [
        { k: "id", label: "ID (slug)", type: "text", required: true, half: true },
        { k: "title", label: "Title", type: "text", required: true, half: true },
        { k: "category", label: "Category", type: "select", options: catOptions, half: true },
        { k: "org", label: "Organisation", type: "text", half: true },
        { k: "featured", label: "Featured on home page", type: "checkbox" },
        { k: "cover", label: "Cover image path", type: "text", help: "e.g. assets/img/my-project.png" },
        { k: "short", label: "Short summary", type: "textarea" },
        { k: "problem", label: "Problem", type: "textarea" },
        { k: "dataset", label: "Dataset", type: "textarea" },
        { k: "method", label: "Method", type: "textarea" },
        { k: "tech", label: "Tech stack", type: "tags", help: "comma-separated" },
        { k: "results", label: "Results", type: "json", help: '[{ "k": "Accuracy", "v": "97%" }]' },
        { k: "links", label: "Links", type: "json", help: '{ "github": "#", "paper": null, "demo": null }' },
      ],
    },
    publications: {
      storeKey: "PUBLICATIONS", singular: "Publication", idField: "n",
      title: (p) => p.title, subtitle: (p) => `${p.venue || ""} · ${p.year || ""}`,
      blank: { n: 0, title: "", authors: [], role: "", venue: "", venueFull: "", type: "", year: 2025, month: "", tags: [], note: "", link: "" },
      fields: [
        { k: "n", label: "Order #", type: "number", half: true },
        { k: "year", label: "Year", type: "number", half: true },
        { k: "title", label: "Title", type: "text", required: true },
        { k: "authors", label: "Authors", type: "lines", help: "one per line" },
        { k: "role", label: "Your role", type: "text", half: true },
        { k: "month", label: "Month", type: "text", half: true },
        { k: "venue", label: "Venue (short)", type: "text", half: true },
        { k: "type", label: "Publisher", type: "text", half: true },
        { k: "venueFull", label: "Venue (full)", type: "text" },
        { k: "tags", label: "Tags", type: "tags" },
        { k: "note", label: "Note", type: "textarea" },
        { k: "link", label: "Link", type: "text" },
      ],
    },
    blogs: {
      storeKey: "BLOGS", singular: "Blog post", idField: "id",
      title: (b) => b.title, subtitle: (b) => `${b.category} · ${b.date}`,
      blank: { id: "", title: "", category: "", date: "", read: 5, summary: "", tags: [], cover: "", body: "" },
      fields: [
        { k: "id", label: "ID (slug)", type: "text", required: true, half: true },
        { k: "date", label: "Date (YYYY-MM-DD)", type: "text", half: true },
        { k: "title", label: "Title", type: "text", required: true },
        { k: "category", label: "Category", type: "text", half: true },
        { k: "read", label: "Read time (min)", type: "number", half: true },
        { k: "cover", label: "Cover image path", type: "text" },
        { k: "summary", label: "Summary", type: "textarea" },
        { k: "tags", label: "Tags", type: "tags" },
        { k: "body", label: "Body (HTML)", type: "textarea", help: "use <h2> for sections; they build the table of contents" },
      ],
    },
    skills: {
      storeKey: "SKILLS", singular: "Skill group", idField: "group",
      title: (s) => s.group, subtitle: (s) => `${s.items.length} items`,
      blank: { group: "", items: [] },
      fields: [
        { k: "group", label: "Group name", type: "text", required: true },
        { k: "items", label: "Skills", type: "tags", help: "comma-separated" },
      ],
    },
    experience: {
      storeKey: "EXPERIENCE", singular: "Experience", idField: null,
      title: (x) => x.role, subtitle: (x) => `${x.org} · ${x.period}`,
      blank: { role: "", org: "", period: "", points: [] },
      fields: [
        { k: "role", label: "Role", type: "text", required: true },
        { k: "org", label: "Organisation", type: "text" },
        { k: "period", label: "Period", type: "text" },
        { k: "points", label: "Highlights", type: "lines", help: "one per line" },
      ],
    },
    education: {
      storeKey: "EDUCATION", singular: "Education", idField: null,
      title: (x) => x.degree, subtitle: (x) => `${x.school} · ${x.period}`,
      blank: { degree: "", school: "", place: "", period: "", detail: "", current: false },
      fields: [
        { k: "degree", label: "Degree", type: "text", required: true },
        { k: "school", label: "School", type: "text" },
        { k: "place", label: "Place", type: "text", half: true },
        { k: "period", label: "Period", type: "text", half: true },
        { k: "detail", label: "Detail", type: "textarea" },
        { k: "current", label: "Current", type: "checkbox" },
      ],
    },
  };

  /* ----- value <-> input serialisation ----- */
  function toInput(type, val) {
    if (type === "tags") return Array.isArray(val) ? val.join(", ") : "";
    if (type === "lines") return Array.isArray(val) ? val.join("\n") : "";
    if (type === "json") return val == null ? "" : JSON.stringify(val, null, 2);
    return val == null ? "" : val;
  }
  function fromInput(type, raw) {
    if (type === "number") return raw === "" ? 0 : Number(raw);
    if (type === "tags") return raw.split(",").map((s) => s.trim()).filter(Boolean);
    if (type === "lines") return raw.split("\n").map((s) => s.trim()).filter(Boolean);
    if (type === "json") { if (raw.trim() === "") return null; return JSON.parse(raw); } // may throw → caught on save
    return raw;
  }

  /* ----- form html ----- */
  function fieldHTML(f, item) {
    const v = item[f.k];
    const help = f.help ? `<div class="f-help">${f.help}</div>` : "";
    let input;
    if (f.type === "textarea" || f.type === "json" || f.type === "lines") {
      input = `<textarea data-k="${f.k}" data-t="${f.type}">${esc(toInput(f.type, v))}</textarea>`;
    } else if (f.type === "checkbox") {
      return `<div class="f-field"><label class="f-check"><input type="checkbox" data-k="${f.k}" data-t="checkbox" ${v ? "checked" : ""} /> ${f.label}</label>${help}</div>`;
    } else if (f.type === "select") {
      input = `<select data-k="${f.k}" data-t="select">${(f.options || []).map((o) => `<option ${o === v ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>`;
    } else {
      input = `<input type="${f.type === "number" ? "number" : "text"}" data-k="${f.k}" data-t="${f.type}" value="${esc(toInput(f.type, v))}" />`;
    }
    return `<div class="f-field" style="${f.half ? "" : "grid-column:1/-1"}"><label>${f.label}${f.required ? " *" : ""}</label>${input}${help}</div>`;
  }

  function readForm(coll, item) {
    const next = JSON.parse(JSON.stringify(item));
    const inputs = document.querySelectorAll("#modalBody [data-k]");
    for (const inp of inputs) {
      const k = inp.dataset.k, t = inp.dataset.t;
      if (t === "checkbox") { next[k] = inp.checked; continue; }
      next[k] = fromInput(t, inp.value); // json may throw
    }
    return next;
  }

  /* ----- editor ----- */
  function openEditor(key, index) {
    const coll = COLLECTIONS[key];
    const arr = Store.get(coll.storeKey) || [];
    const isNew = index == null;
    const item = isNew ? JSON.parse(JSON.stringify(coll.blank)) : arr[index];
    const body = `<div class="form-grid two">${coll.fields.map((f) => fieldHTML(f, item)).join("")}</div>`;
    const foot = `<button class="btn btn-outline" id="mCancel">Cancel</button>
                  <button class="btn btn-primary" id="mSave">${ICON.check} Save</button>`;
    openModal(isNew ? `New ${coll.singular.toLowerCase()}` : `Edit ${coll.singular.toLowerCase()}`, body, foot);
    el("mCancel").addEventListener("click", closeModal);
    el("mSave").addEventListener("click", () => {
      let next;
      try { next = readForm(coll, item); }
      catch (e) { toast("Invalid JSON in one of the fields", "err"); return; }
      // required check
      for (const f of coll.fields) {
        if (f.required && (next[f.k] == null || String(next[f.k]).trim() === "")) {
          toast(`“${f.label}” is required`, "err"); return;
        }
      }
      const list = Store.get(coll.storeKey) || [];
      if (isNew) list.push(next); else list[index] = next;
      Store.set(coll.storeKey, list);
      closeModal();
      if (window.buildSidebar) buildSidebar();
      renderList(key, el("content"));
      toast(`${coll.singular} ${isNew ? "added" : "saved"}`);
    });
  }

  function deleteItem(key, index) {
    const coll = COLLECTIONS[key];
    const list = Store.get(coll.storeKey) || [];
    const label = coll.title(list[index]) || "this item";
    if (!confirm(`Delete “${label}”? This only changes your local copy.`)) return;
    list.splice(index, 1);
    Store.set(coll.storeKey, list);
    if (window.buildSidebar) buildSidebar();
    renderList(key, el("content"));
    toast(`${coll.singular} deleted`);
  }

  /* ----- list ----- */
  function renderList(key, mount) {
    const coll = COLLECTIONS[key];
    const list = Store.get(coll.storeKey) || [];
    const edited = Store.isEdited(coll.storeKey);
    const rows = list.map((item, i) => `
      <div class="item-row">
        <div class="it-main">
          <div class="it-title">${esc(coll.title(item) || "(untitled)")}</div>
          <div class="it-sub">${esc(coll.subtitle(item) || "")}</div>
        </div>
        ${item.featured ? `<span class="badge">Featured</span>` : ""}
        <div class="it-actions">
          <button class="icon-btn" title="Edit" data-edit="${i}">${ICON.edit}</button>
          <button class="icon-btn danger" title="Delete" data-del="${i}">${ICON.trash}</button>
        </div>
      </div>`).join("");
    mount.innerHTML = `
      ${edited ? `<div class="notice" style="margin-bottom:1rem">You have unsaved-to-disk local edits for <b>${coll.storeKey}</b>. <a href="#" id="revertColl" style="color:var(--accent)">Revert to original</a>.</div>` : ""}
      <div class="item-list">${rows || `<div class="empty-note">No ${coll.singular.toLowerCase()}s yet — use “Add”.</div>`}</div>`;
    mount.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => openEditor(key, Number(b.dataset.edit))));
    mount.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => deleteItem(key, Number(b.dataset.del))));
    const revert = el("revertColl");
    if (revert) revert.addEventListener("click", (e) => {
      e.preventDefault(); Store.reset(coll.storeKey);
      if (window.buildSidebar) buildSidebar(); renderList(key, mount); toast(`${coll.storeKey} reverted`);
    });
  }

  window.AdminCollections = {
    has: (key) => Object.prototype.hasOwnProperty.call(COLLECTIONS, key),
    openEditor,
    renderList,
  };
})();

/* =========================================================================
   editor.js — Medium-style writing editor
   contenteditable canvas · floating selection toolbar · "+" insert menu ·
   auto-save draft · publish flow → writes to BLOGS via Store
   ========================================================================= */

(function () {
  const AUTH_KEY = "afraz-admin-session";
  const DRAFT_KEY = "afraz-editor-draft";

  let editing = null;          // existing BLOGS entry when editing
  let saveTimer = null;
  let dirty = false;
  let pubCover = "";           // staged cover image for the publish panel

  const $ = (id) => document.getElementById(id);

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    // auth gate — must be unlocked in the dashboard first
    if (sessionStorage.getItem(AUTH_KEY) !== "1") {
      location.replace("admin.html");
      return;
    }

    buildChrome();
    loadContent();
    renderMathBlocks($("edBody"));
    wireEditor();
    wireToolbar();
    wireRibbon();
    wirePlus();
    wireMathEditing();
    wirePublish();
    wireMore();

    // header shadow
    const top = $("edTop");
    const onScroll = () => top.classList.toggle("scrolled", window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- chrome (icons / labels) ---------- */
  function buildChrome() {
    $("edBackIcon").innerHTML = ICON.arrow;
    $("edAvatar").textContent = PROFILE.initials;
    $("moreBtn").innerHTML = ICON.dots || "···";
    $("savedIcon").innerHTML = ICON.check;
    $("pubClose").innerHTML = ICON.close;

    // selection toolbar icons (heading buttons keep their "T")
    const tb = $("selToolbar");
    const setIcon = (root, sel, svg) => { const b = root.querySelector(sel); if (b && svg) b.innerHTML = svg; };
    setIcon(tb, '[data-cmd="bold"]', ICON.bold);
    setIcon(tb, '[data-cmd="italic"]', ICON.italic);
    setIcon(tb, '[data-val="blockquote"]', ICON.quote);
    setIcon(tb, '[data-cmd="createLink"]', ICON.link);

    // plus insert menu icons
    $("plusBtn").innerHTML = ICON.plus;
    const pm = $("plusMenu");
    setIcon(pm, '[data-insert="image"]', ICON.image);
    setIcon(pm, '[data-insert="code"]', ICON.code);
    setIcon(pm, '[data-insert="equation"]',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 5H9.5a2.5 2.5 0 0 0-2.46 2.04L5 19M4 12h7"/></svg>');
    setIcon(pm, '[data-insert="table"]',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 10h18M3 15h18M9 4v16M15 4v16"/></svg>');
    setIcon(pm, '[data-insert="embed"]', ICON.embed);
    setIcon(pm, '[data-insert="divider"]', ICON.divider);
  }

  /* ---------- load existing post or fresh draft ---------- */
  function loadContent() {
    const id = new URLSearchParams(location.search).get("id");
    if (id) editing = BLOGS.find((b) => b.id === id) || null;

    if (editing) {
      $("edTitle").innerHTML = editing.title || "";
      $("edBody").innerHTML = editing.body || "";
      editor._meta = {
        category: editing.category,
        date: editing.date,
        read: editing.read,
        tags: (editing.tags || []).slice(),
        summary: editing.summary || "",
        cover: editing.cover || "",
        id: editing.id,
      };
    } else {
      // restore unsaved draft if present
      let draft = null;
      try { draft = JSON.parse(localStorage.getItem(DRAFT_KEY)); } catch (e) {}
      if (draft) {
        $("edTitle").innerHTML = draft.title || "";
        $("edBody").innerHTML = draft.body || "";
        editor._meta = draft.meta || {};
      } else {
        editor._meta = {};
      }
    }
    refreshEmpty();
    setStatus("saved");
  }

  const editor = { _meta: {} };

  /* ---------- empty-placeholder handling ---------- */
  function refreshEmpty() {
    const t = $("edTitle"), b = $("edBody");
    t.classList.toggle("is-empty", t.textContent.trim() === "");
    const bodyEmpty = b.textContent.trim() === "" && !b.querySelector("img, hr, pre, table, .ed-math");
    b.classList.toggle("is-empty", bodyEmpty);
  }

  /* ---------- editor wiring ---------- */
  function wireEditor() {
    try { document.execCommand("defaultParagraphSeparator", false, "p"); } catch (e) {}
    const body = $("edBody"), title = $("edTitle");

    // ensure body starts with a paragraph
    if (body.innerHTML.trim() === "") body.innerHTML = "<p><br></p>";

    title.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); body.focus(); placeCaretStart(body); }
    });

    [title, body].forEach((el) => {
      el.addEventListener("input", () => { refreshEmpty(); markDirty(); });
    });

    body.addEventListener("keyup", updatePlus);
    body.addEventListener("mouseup", updatePlus);
    body.addEventListener("focus", updatePlus);
    document.addEventListener("selectionchange", () => { saveRange(); updateToolbar(); updateRibbon(); updatePlus(); });
    window.addEventListener("scroll", () => { positionPlus(); positionToolbar(); }, { passive: true });
    window.addEventListener("resize", () => { positionPlus(); positionToolbar(); });
  }

  function markDirty() {
    dirty = true;
    setStatus("saving");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveDraft, 700);
  }

  function saveDraft() {
    const data = { title: $("edTitle").innerText.trim(), body: $("edBody").innerHTML, meta: editor._meta };
    if (!editing) { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch (e) {} }
    dirty = false;
    setStatus("saved");
  }

  function setStatus(state) {
    const s = $("savedLabel");
    const txt = $("savedText");
    if (state === "saving") { s.classList.add("saving"); txt.textContent = "Saving…"; }
    else { s.classList.remove("saving"); txt.textContent = "Saved"; }
  }

  /* ---------- caret helpers ---------- */
  function placeCaretStart(el) {
    const r = document.createRange(); r.selectNodeContents(el); r.collapse(true);
    const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
  }
  function currentBlock() {
    const sel = window.getSelection();
    if (!sel.rangeCount) return null;
    let node = sel.getRangeAt(0).startContainer;
    const body = $("edBody");
    if (!body.contains(node)) return null;
    while (node && node.parentNode !== body) node = node.parentNode;
    return node && node.nodeType === 1 ? node : null;
  }

  /* ---------- floating selection toolbar ---------- */
  function wireToolbar() {
    $("selToolbar").querySelectorAll("[data-cmd]").forEach((btn) => {
      btn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const cmd = btn.dataset.cmd, val = btn.dataset.val;
        if (cmd === "createLink") { openLinkPop(); return; }
        document.execCommand(cmd, false, val || null);
        markDirty(); updateToolbar();
      });
    });
    // link popover
    $("linkApply").addEventListener("mousedown", (e) => { e.preventDefault(); applyLink(); });
    $("linkInput").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); applyLink(); } });
  }

  /* ---------- persistent formatting ribbon (Word-style) ---------- */
  let lastRange = null;
  function saveRange() {
    const sel = window.getSelection();
    if (sel.rangeCount && $("edBody").contains(sel.anchorNode)) lastRange = sel.getRangeAt(0).cloneRange();
  }
  function restoreRange() {
    $("edBody").focus();
    if (lastRange) { const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(lastRange); }
  }
  // Run an execCommand against the editor selection, then refresh state.
  function exec(cmd, val) {
    restoreRange();
    try { document.execCommand(cmd, false, val == null ? null : val); } catch (e) {}
    saveRange();
    refreshEmpty(); markDirty(); updateRibbon(); updateToolbar();
  }
  // Like exec(), but emits inline CSS (used for indent/outdent so they apply a
  // margin instead of wrapping the text in a quote-styled <blockquote>).
  function execCss(cmd, val) {
    restoreRange();
    try { document.execCommand("styleWithCSS", false, true); } catch (e) {}
    try { document.execCommand(cmd, false, val == null ? null : val); } catch (e) {}
    try { document.execCommand("styleWithCSS", false, false); } catch (e) {}
    saveRange();
    refreshEmpty(); markDirty(); updateRibbon(); updateToolbar();
  }
  // Highlight needs styleWithCSS in some browsers; fall back to backColor.
  function execHighlight(color) {
    restoreRange();
    try { document.execCommand("styleWithCSS", false, true); } catch (e) {}
    let ok = false;
    try { ok = document.execCommand("hiliteColor", false, color); } catch (e) {}
    if (!ok) { try { document.execCommand("backColor", false, color); } catch (e) {} }
    try { document.execCommand("styleWithCSS", false, false); } catch (e) {}
    saveRange();
    markDirty(); updateRibbon();
  }

  function wireRibbon() {
    const tb = $("edToolbar");
    if (!tb) return;
    tb.querySelectorAll("[data-cmd]").forEach((b) => {
      b.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const cmd = b.dataset.cmd;
        if (cmd === "createLink") { openLinkPop(); return; }
        if (cmd === "indent" || cmd === "outdent") { execCss(cmd); return; }
        exec(cmd, b.dataset.val);
      });
    });
    tb.querySelectorAll("[data-insert]").forEach((b) => {
      b.addEventListener("mousedown", (e) => { e.preventDefault(); restoreRange(); insertBlock(b.dataset.insert); });
    });

    const block = $("tbBlock");
    block.addEventListener("mousedown", saveRange);
    block.addEventListener("change", () => exec("formatBlock", block.value));

    const font = $("tbFont");
    font.addEventListener("mousedown", saveRange);
    font.addEventListener("change", () => { if (font.value) exec("fontName", font.value); font.selectedIndex = 0; });

    const size = $("tbSize");
    size.addEventListener("mousedown", saveRange);
    size.addEventListener("change", () => { if (size.value) exec("fontSize", size.value); size.selectedIndex = 0; });

    const fore = $("tbFore"), back = $("tbBack");
    fore.addEventListener("mousedown", saveRange);
    fore.addEventListener("input", () => { exec("foreColor", fore.value); setBar(fore); });
    back.addEventListener("mousedown", saveRange);
    back.addEventListener("input", () => { execHighlight(back.value); setBar(back); });

    // Sit the sticky ribbon flush beneath the top bar, whatever its height.
    const place = () => { tb.style.top = $("edTop").offsetHeight + "px"; };
    place();
    window.addEventListener("resize", place);
  }
  function setBar(input) {
    const bar = input.parentNode.querySelector(".bar");
    if (bar) bar.style.background = input.value;
  }
  // Reflect current selection state in the ribbon (active toggles + block style).
  const TOGGLE_CMDS = ["bold", "italic", "underline", "strikeThrough", "superscript", "subscript",
    "insertUnorderedList", "insertOrderedList", "justifyLeft", "justifyCenter", "justifyRight", "justifyFull"];
  function updateRibbon() {
    const tb = $("edToolbar");
    if (!tb || !$("edBody").contains(window.getSelection().anchorNode)) return;
    tb.querySelectorAll("[data-cmd]").forEach((b) => {
      if (TOGGLE_CMDS.includes(b.dataset.cmd)) {
        let on = false; try { on = document.queryCommandState(b.dataset.cmd); } catch (e) {}
        b.classList.toggle("active", on);
      }
    });
    const blk = currentBlock();
    const tag = blk && blk.tagName ? blk.tagName.toLowerCase() : "p";
    const sel = $("tbBlock");
    if (sel) sel.value = ["h2", "h3", "blockquote", "pre"].includes(tag) ? tag : "p";
  }

  let savedRange = null;
  function updateToolbar() {
    const tb = $("selToolbar");
    const sel = window.getSelection();
    if (!sel.rangeCount || sel.isCollapsed || !$("edBody").contains(sel.anchorNode)) {
      tb.classList.remove("open"); $("linkPop").classList.remove("open"); return;
    }
    // reflect active states
    tb.querySelectorAll("[data-cmd]").forEach((b) => {
      let on = false;
      try {
        if (b.dataset.cmd === "bold") on = document.queryCommandState("bold");
        else if (b.dataset.cmd === "italic") on = document.queryCommandState("italic");
        else if (b.dataset.cmd === "formatBlock") on = isBlock(b.dataset.val);
      } catch (e) {}
      b.classList.toggle("active", on);
    });
    tb.classList.add("open");
    positionToolbar();
  }
  function isBlock(tag) {
    const blk = currentBlock();
    return blk && blk.tagName && blk.tagName.toLowerCase() === tag.replace(/[<>]/g, "");
  }
  function positionToolbar() {
    const tb = $("selToolbar");
    if (!tb.classList.contains("open")) return;
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    if (!rect.width && !rect.height) return;
    const tw = tb.offsetWidth, th = tb.offsetHeight;
    let left = rect.left + rect.width / 2 - tw / 2;
    left = Math.max(10, Math.min(left, window.innerWidth - tw - 10));
    let top = rect.top - th - 12;
    if (top < 8) top = rect.bottom + 12;
    tb.style.left = left + "px";
    tb.style.top = top + "px";
  }

  function openLinkPop() {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    savedRange = sel.getRangeAt(0).cloneRange();
    const rect = savedRange.getBoundingClientRect();
    const pop = $("linkPop");
    pop.classList.add("open");
    pop.style.left = Math.max(10, Math.min(rect.left, window.innerWidth - 320)) + "px";
    pop.style.top = (rect.bottom + 10) + "px";
    const inp = $("linkInput"); inp.value = ""; setTimeout(() => inp.focus(), 30);
  }
  function applyLink() {
    const url = $("linkInput").value.trim();
    if (savedRange) { const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(savedRange); }
    if (url) document.execCommand("createLink", false, url);
    $("linkPop").classList.remove("open");
    markDirty();
  }

  /* ---------- plus insert menu ---------- */
  function wirePlus() {
    const pm = $("plusMenu");
    $("plusBtn").addEventListener("mousedown", (e) => { e.preventDefault(); pm.classList.toggle("expanded"); });
    pm.querySelectorAll("[data-insert]").forEach((b) => {
      b.addEventListener("mousedown", (e) => { e.preventDefault(); insertBlock(b.dataset.insert); pm.classList.remove("expanded"); });
    });
  }
  function updatePlus() {
    const pm = $("plusMenu");
    const blk = currentBlock();
    const body = $("edBody");
    const isEmpty = blk && blk.textContent.trim() === "" && !blk.querySelector("img, hr, pre");
    if (document.activeElement === body && blk && isEmpty) {
      pm.classList.add("show"); positionPlus(blk);
    } else if (!pm.matches(":hover")) {
      pm.classList.remove("show", "expanded");
    }
  }
  function positionPlus(blk) {
    const pm = $("plusMenu");
    blk = blk || currentBlock();
    if (!blk) return;
    const rect = blk.getBoundingClientRect();
    const docRect = $("edDoc").getBoundingClientRect();
    pm.style.top = (rect.top + rect.height / 2 - 17) + "px";
    pm.style.left = (docRect.left - 52) + "px";
  }
  function insertBlock(type) {
    $("edBody").focus();
    if (type === "image") {
      pickLocalImage();
    } else if (type === "code") {
      document.execCommand("insertHTML", false, `<pre><code>// your code here</code></pre><p><br></p>`);
    } else if (type === "equation") {
      const tex = prompt("Enter the equation in LaTeX:", "E = mc^2");
      if (tex && tex.trim()) {
        // LaTeX is stored in data-tex (survives contenteditable intact) and rendered for display.
        document.execCommand("insertHTML", false,
          `<p class="ed-math" contenteditable="false" data-tex="${escapeAttr(tex.trim())}"></p><p><br></p>`);
        renderMathBlocks($("edBody"));
      }
    } else if (type === "table") {
      let cols = parseInt(prompt("How many columns?", "3"), 10);
      let rows = parseInt(prompt("How many data rows (excluding the header)?", "2"), 10);
      cols = Math.max(1, Math.min(8, cols || 3));
      rows = Math.max(1, Math.min(20, rows || 2));
      const head = `<tr>${Array.from({ length: cols }, (_, i) => `<th>Header ${i + 1}</th>`).join("")}</tr>`;
      const bodyRows = Array.from({ length: rows }, () =>
        `<tr>${Array.from({ length: cols }, () => `<td>&nbsp;</td>`).join("")}</tr>`).join("");
      document.execCommand("insertHTML", false,
        `<table class="ed-table"><thead>${head}</thead><tbody>${bodyRows}</tbody></table><p><br></p>`);
      toast("Click any cell to edit it");
    } else if (type === "divider") {
      document.execCommand("insertHTML", false, `<hr class="dots"><p><br></p>`);
    } else if (type === "embed") {
      const url = prompt("Paste a link to embed (YouTube, etc.):", "");
      if (url) document.execCommand("insertHTML", false, `<p><a href="${escapeAttr(url)}" target="_blank" rel="noopener">${escapeHtml(url)}</a></p><p><br></p>`);
    }
    refreshEmpty(); markDirty();
  }

  /* ---------- math blocks (LaTeX stored in data-tex, rendered with KaTeX) ---------- */
  function renderMathBlocks(root) {
    if (!root) return;
    root.querySelectorAll(".ed-math").forEach((el) => {
      const tex = el.getAttribute("data-tex") || "";
      if (typeof katex !== "undefined") {
        try { katex.render(tex, el, { displayMode: true, throwOnError: false }); }
        catch (e) { el.textContent = tex; }
      } else {
        el.textContent = tex; // KaTeX not loaded yet — show raw LaTeX as a fallback
      }
    });
  }
  // Click an existing equation to edit its LaTeX.
  function wireMathEditing() {
    $("edBody").addEventListener("click", (e) => {
      const block = e.target.closest(".ed-math");
      if (!block) return;
      const current = block.getAttribute("data-tex") || "";
      const next = prompt("Edit the equation (LaTeX):", current);
      if (next === null) return;
      if (!next.trim()) { block.remove(); }
      else { block.setAttribute("data-tex", next.trim()); renderMathBlocks($("edBody")); }
      markDirty();
    });
  }

  /* ---------- insert an image from the local computer ---------- */
  function pickLocalImage() {
    const body = $("edBody");
    body.focus();
    // remember where the caret is — the file dialog steals focus/selection
    const sel = window.getSelection();
    const range = sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";
    document.body.appendChild(input);

    input.addEventListener("change", () => {
      const file = input.files && input.files[0];
      if (!file) { input.remove(); return; }
      if (!file.type.startsWith("image/")) { toast("Please choose an image file"); input.remove(); return; }
      // ~4 MB guard: data URLs are stored in the post body (localStorage)
      if (file.size > 4 * 1024 * 1024) { toast("Image is large (>4MB) — it may not save"); }

      const reader = new FileReader();
      reader.onload = () => {
        body.focus();
        if (range) { const s = window.getSelection(); s.removeAllRanges(); s.addRange(range); }
        const alt = escapeAttr(file.name.replace(/\.[^.]+$/, ""));
        const fig = `<figure><img src="${reader.result}" alt="${alt}"><figcaption>Add a caption…</figcaption></figure><p><br></p>`;
        document.execCommand("insertHTML", false, fig);
        refreshEmpty(); markDirty();
      };
      reader.onerror = () => toast("Couldn't read that image");
      reader.readAsDataURL(file);
      input.remove();
    });

    input.click();
  }

  /* ---------- publish flow ---------- */
  function wirePublish() {
    $("publishBtn").addEventListener("click", openPublish);
    $("pubClose").addEventListener("click", closePublish);
    $("pubBackdrop").addEventListener("click", closePublish);
    $("pubConfirm").addEventListener("click", doPublish);
  }

  function estimateRead() {
    const words = $("edBody").innerText.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  }
  function autoSummary() {
    const p = $("edBody").querySelector("p");
    const txt = (p ? p.innerText : "").trim();
    return txt.length > 180 ? txt.slice(0, 177) + "…" : txt;
  }

  function openPublish() {
    const title = $("edTitle").innerText.trim();
    if (!title) { toast("Add a title first"); $("edTitle").focus(); return; }

    const m = editor._meta || {};
    const cats = BLOG_CATEGORIES.filter((c) => c !== "All");
    $("pubCategory").innerHTML = cats.map((c) => `<option ${c === m.category ? "selected" : ""}>${c}</option>`).join("");
    $("pubDate").value = m.date || new Date().toISOString().slice(0, 10);
    $("pubRead").value = m.read || estimateRead();
    $("pubSummary").value = m.summary || autoSummary();

    // tags editor
    const mount = $("pubTagsMount"); mount.innerHTML = "";
    pubTags = makeTags(m.tags || []);
    mount.appendChild(pubTags.el);

    // cover image
    pubCover = m.cover || (editing && editing.cover) || "";
    renderCover();
    $("pubCoverPick").onclick = pickCover;
    $("pubCoverRemove").onclick = () => { pubCover = ""; $("pubCoverUrl").value = ""; renderCover(); };
    $("pubCoverUrl").oninput = () => { pubCover = $("pubCoverUrl").value.trim(); renderCover(true); };

    // preview
    $("pubPrevTitle").textContent = title;
    $("pubPrevCat").textContent = $("pubCategory").value;
    $("pubPrevSummary").textContent = $("pubSummary").value || "Your summary will appear here.";
    $("pubConfirm").textContent = editing ? "Update post" : "Publish now";
    $("pubHeading").textContent = editing ? "Update story" : "Story preview";

    $("pubSummary").oninput = () => { $("pubPrevSummary").textContent = $("pubSummary").value || "Your summary will appear here."; };
    $("pubCategory").onchange = () => { $("pubPrevCat").textContent = $("pubCategory").value; };

    $("pubPanel").classList.add("open");
    $("pubBackdrop").classList.add("open");
  }
  function closePublish() {
    $("pubPanel").classList.remove("open");
    $("pubBackdrop").classList.remove("open");
  }

  function renderCover(keepUrl) {
    if (editor._meta) editor._meta.cover = pubCover;
    const box = $("pubPrevCover");
    const has = !!pubCover;
    if (box) {
      if (has) {
        box.classList.remove("ph");
        box.removeAttribute("data-label");
        box.style.aspectRatio = "16/9";
        box.innerHTML = `<img src="${escapeAttr(pubCover)}" alt="" style="width:100%;height:100%;object-fit:cover;display:block">`;
      } else {
        box.classList.add("ph");
        box.style.aspectRatio = "";
        box.setAttribute("data-label", "add a cover");
        box.innerHTML = "";
      }
    }
    $("pubCoverPick").textContent = has ? "Replace image" : "Upload image";
    $("pubCoverRemove").style.display = has ? "" : "none";
    if (!keepUrl) { const u = $("pubCoverUrl"); if (u) u.value = (has && pubCover.slice(0, 5) !== "data:") ? pubCover : ""; }
  }
  function pickCover() {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*"; input.style.display = "none";
    document.body.appendChild(input);
    input.addEventListener("change", () => {
      const f = input.files && input.files[0];
      input.remove();
      if (!f) return;
      Store.readImage(f, { mime: "image/jpeg", maxDim: 1600, quality: 0.82 })
        .then((d) => { if (d.length > 1.4 * 1024 * 1024) toast("Large image — it may not save"); pubCover = d; renderCover(); })
        .catch(() => toast("Couldn't read that image"));
    });
    input.click();
  }

  function doPublish() {
    const wasEditing = !!editing;
    const title = $("edTitle").innerText.trim();
    const body = $("edBody").innerHTML;
    const data = {
      id: (editor._meta && editor._meta.id) || (editing ? editing.id : Store.slug(title)),
      title,
      category: $("pubCategory").value,
      date: $("pubDate").value || new Date().toISOString().slice(0, 10),
      read: parseInt($("pubRead").value, 10) || estimateRead(),
      summary: $("pubSummary").value.trim() || autoSummary(),
      tags: pubTags.get(),
      cover: pubCover || null,
      body,
    };

    if (editing) {
      Object.assign(editing, data);
    } else {
      if (BLOGS.some((b) => b.id === data.id)) data.id += "-" + Date.now().toString().slice(-4);
      BLOGS.unshift(data);
      editing = BLOGS[0];
      editor._meta.id = data.id;
    }
    const ok = Store.save();
    if (!ok) {
      // roll the in-memory insert back so the list stays consistent
      if (!wasEditing) {
        const i = BLOGS.findIndex((b) => b.id === data.id); if (i >= 0) BLOGS.splice(i, 1);
        editing = null; if (editor._meta) delete editor._meta.id;
      }
      toast("Couldn't publish — storage is full. Try a smaller cover image, or remove images.");
      return;
    }
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
    closePublish();
    toast("Published — opening your story…");
    setTimeout(() => location.href = "blog-post.html?id=" + data.id, 900);
  }

  /* ---------- more menu ---------- */
  function wireMore() {
    const menu = $("edMenu");
    $("moreBtn").addEventListener("click", (e) => { e.stopPropagation(); menu.classList.toggle("open"); });
    document.addEventListener("click", () => menu.classList.remove("open"));
    menu.addEventListener("click", (e) => e.stopPropagation());
    $("miPreview").addEventListener("click", () => {
      saveDraft();
      if (editing) window.open("blog-post.html?id=" + editing.id, "_blank");
      else toast("Publish once to preview the live page");
    });
    $("miClear").addEventListener("click", () => {
      if (confirm("Clear the editor? Unsaved draft content will be removed.")) {
        $("edTitle").innerHTML = ""; $("edBody").innerHTML = "<p><br></p>";
        try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
        refreshEmpty(); menu.classList.remove("open");
      }
    });
    $("miDash").addEventListener("click", () => location.href = "admin.html#blog");
  }

  /* ---------- small tag editor ---------- */
  function makeTags(initial) {
    const wrap = document.createElement("div");
    wrap.className = "tag-input-wrap"; wrap.style.cssText = "display:flex;flex-wrap:wrap;gap:.4rem;padding:.5rem;border:1px solid var(--border);border-radius:9px;background:var(--bg-2)";
    let tags = (initial || []).slice();
    const input = document.createElement("input");
    input.placeholder = "Add a tag, press Enter";
    input.style.cssText = "border:0;background:transparent;flex:1;min-width:8rem;padding:.3rem;color:var(--text);font:inherit;font-size:.9rem;outline:none";
    function render() {
      wrap.querySelectorAll(".tag-chip").forEach((c) => c.remove());
      tags.forEach((t, i) => {
        const chip = document.createElement("span");
        chip.className = "tag-chip";
        chip.style.cssText = "display:inline-flex;align-items:center;gap:.35rem;padding:.25rem .55rem;border-radius:7px;background:var(--accent-soft);color:var(--accent);font-size:.8rem;font-weight:500";
        chip.innerHTML = `${escapeHtml(t)} <button type="button" style="border:0;background:none;color:inherit;cursor:pointer;display:grid;place-items:center;padding:0">${ICON.close}</button>`;
        chip.querySelector("svg").style.width = ".75rem"; chip.querySelector("svg").style.height = ".75rem";
        chip.querySelector("button").addEventListener("click", () => { tags.splice(i, 1); render(); });
        wrap.insertBefore(chip, input);
      });
    }
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === ",") { e.preventDefault(); const v = input.value.trim().replace(/,$/, ""); if (v && !tags.includes(v)) { tags.push(v); input.value = ""; render(); } }
      else if (e.key === "Backspace" && !input.value && tags.length) { tags.pop(); render(); }
    });
    wrap.appendChild(input); render();
    return { el: wrap, get: () => tags.slice() };
  }
  let pubTags = null;

  /* ---------- toast ---------- */
  function toast(msg) {
    const wrap = $("toasts");
    const t = document.createElement("div"); t.className = "toast";
    t.innerHTML = `<span class="ti">${ICON.check}</span><span>${msg}</span>`;
    wrap.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 300); }, 2400);
  }

  function escapeHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function escapeAttr(s) { return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;"); }
})();

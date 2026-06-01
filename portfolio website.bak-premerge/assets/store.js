/* =========================================================================
   store.js — a tiny localStorage overlay over the data.js collections.

   Loaded AFTER data.js (and blog-content.js). It captures the originals, then
   applies any saved admin edits on top of the live globals — so pages that
   include this script reflect content edited in the admin dashboard. Edits
   persist in localStorage; nothing here talks to a server.
   ========================================================================= */
const Store = (function () {
  const KEY = "afraz-cms-v1";

  // Collections the admin can edit. Each name is a global from data.js.
  const NAMES = [
    "PROFILE", "STATS", "FOCUS_AREAS", "PROJECTS", "PUBLICATIONS",
    "RESEARCH_INTERESTS", "EDUCATION", "EXPERIENCE", "SKILLS", "BLOGS",
  ];

  const clone = (v) => JSON.parse(JSON.stringify(v));

  // Live references to the in-memory globals from data.js (mutated in place).
  // Referenced directly (not via eval/window) since this script shares global
  // scope with data.js; `typeof` guards anything not present on a given page.
  const live = {};
  if (typeof PROFILE !== "undefined") live.PROFILE = PROFILE;
  if (typeof STATS !== "undefined") live.STATS = STATS;
  if (typeof FOCUS_AREAS !== "undefined") live.FOCUS_AREAS = FOCUS_AREAS;
  if (typeof PROJECTS !== "undefined") live.PROJECTS = PROJECTS;
  if (typeof PUBLICATIONS !== "undefined") live.PUBLICATIONS = PUBLICATIONS;
  if (typeof RESEARCH_INTERESTS !== "undefined") live.RESEARCH_INTERESTS = RESEARCH_INTERESTS;
  if (typeof EDUCATION !== "undefined") live.EDUCATION = EDUCATION;
  if (typeof EXPERIENCE !== "undefined") live.EXPERIENCE = EXPERIENCE;
  if (typeof SKILLS !== "undefined") live.SKILLS = SKILLS;
  if (typeof BLOGS !== "undefined") live.BLOGS = BLOGS;

  // Snapshot pristine values BEFORE applying overrides (used by reset()).
  const original = {};
  NAMES.forEach((n) => { if (live[n]) original[n] = clone(live[n]); });

  let data = {};
  try { data = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { data = {}; }

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }

  // Replace the CONTENTS of a live array/object in place (binding is const).
  function replaceContents(target, src) {
    if (Array.isArray(target)) {
      target.length = 0;
      clone(src).forEach((x) => target.push(x));
    } else if (target && typeof target === "object") {
      Object.keys(target).forEach((k) => delete target[k]);
      Object.assign(target, clone(src));
    }
  }

  function applyAll() {
    NAMES.forEach((n) => {
      if (data[n] === undefined || !live[n]) return;
      replaceContents(live[n], data[n]);
    });
  }

  applyAll();

  return {
    /** Current effective value (clone, safe to mutate) for editing. */
    get(name) { return live[name] ? clone(live[name]) : null; },
    /** Whether this collection has saved edits. */
    isEdited(name) { return data[name] !== undefined; },
    /** Save a new value: persist + reflect on the live page. */
    set(name, value) {
      data[name] = clone(value);
      persist();
      if (live[name]) replaceContents(live[name], value);
    },
    /** Revert one collection to its data.js original. */
    reset(name) {
      delete data[name];
      persist();
      if (live[name] && original[name]) replaceContents(live[name], original[name]);
    },
    /** Revert everything. */
    resetAll() {
      data = {};
      persist();
      NAMES.forEach((n) => { if (live[n] && original[n]) replaceContents(live[n], original[n]); });
    },
    names() { return NAMES.slice(); },
  };
})();

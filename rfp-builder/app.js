(() => {
  const CONFIG = {
    storagePrefix: "trilogy-rfp-draft:",
    indexKey: "trilogy-rfp-index",
    // Point these at Power Automate HTTP trigger URLs when ready
    webhooks: {
      saveDraft: "https://default77cde95f930f495e89c64d2c30f6df.21.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/12/workflows/12897ac2d1e94a149bd39340b39ac8c9/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=VqvO6vdmGXNlJj9PJIiu0J46H762ddWTxLEcL6Soa90",
      finalCommit: "",
      sendForAcceptance: "",
    },
  };

  const state = {
    catalog: [],
    sectionOrder: [],
    placeholders: {},
    theme: { primary: "#61d779", accent: "#d5ec67", navy: "#13202e" },
    logoDataUrl: "",
    status: "draft",
    acceptance: {
      status: "not_sent",
      signerName: "",
      signerEmail: "",
      designation: "",
      envelopeId: "",
      sharePointPath: "",
    },
  };

  const els = {
    library: document.getElementById("library"),
    orderList: document.getElementById("orderList"),
    placeholders: document.getElementById("placeholders"),
    logoInput: document.getElementById("logoInput"),
    logoPreview: document.getElementById("logoPreview"),
    themeSwatches: document.getElementById("themeSwatches"),
    coverClientLogo: document.getElementById("coverClientLogo"),
    slugPreview: document.getElementById("slugPreview"),
    draftStatus: document.getElementById("draftStatus"),
    existingSelect: document.getElementById("existingSelect"),
    toast: document.getElementById("toast"),
    acceptanceStatus: document.getElementById("acceptanceStatus"),
    fields: {
      clientName: document.getElementById("clientName"),
      reference: document.getElementById("reference"),
      date: document.getElementById("date"),
      validUntil: document.getElementById("validUntil"),
      preparedBy: document.getElementById("preparedBy"),
      title: document.getElementById("title"),
      contact: document.getElementById("contact"),
      signerName: document.getElementById("signerName"),
      designation: document.getElementById("designation"),
      signerEmail: document.getElementById("signerEmail"),
    },
    preview: {
      client: document.getElementById("pvClient"),
      ref: document.getElementById("pvRef"),
      date: document.getElementById("pvDate"),
      valid: document.getElementById("pvValid"),
      by: document.getElementById("pvBy"),
      title: document.getElementById("pvTitle"),
      contact: document.getElementById("pvContact"),
    },
  };

  function slugify(name) {
    return String(name || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "customer";
  }

  function toast(msg) {
    els.toast.hidden = false;
    els.toast.textContent = msg;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      els.toast.hidden = true;
    }, 2600);
  }

  function applyTheme() {
    document.documentElement.style.setProperty("--client-primary", state.theme.primary);
    document.documentElement.style.setProperty("--client-accent", state.theme.accent);
    els.themeSwatches.innerHTML = "";
    [state.theme.primary, state.theme.accent, state.theme.navy].forEach((c) => {
      const s = document.createElement("span");
      s.className = "swatch";
      s.style.background = c;
      s.title = c;
      els.themeSwatches.appendChild(s);
    });
  }

  function readMeta() {
    return {
      clientName: els.fields.clientName.value.trim(),
      reference: els.fields.reference.value.trim(),
      date: els.fields.date.value.trim(),
      validUntil: els.fields.validUntil.value.trim(),
      preparedBy: els.fields.preparedBy.value.trim(),
      title: els.fields.title.value.trim(),
      contact: els.fields.contact.value.trim(),
    };
  }

  function updatePreview() {
    const m = readMeta();
    const fill = (el, val, fallback) => {
      el.textContent = val || fallback;
    };
    fill(els.preview.client, m.clientName, "[Client Name]");
    fill(els.preview.ref, m.reference, "[RFP Reference No.]");
    fill(els.preview.date, m.date, "[Submission Date]");
    fill(els.preview.valid, m.validUntil, "[Valid for 90 days]");
    fill(els.preview.by, m.preparedBy, "[Your Name]");
    fill(els.preview.title, m.title, "[Your Title]");
    fill(els.preview.contact, m.contact, "[name@trilogydigital.com]");
    els.slugPreview.textContent = `proposals/${slugify(m.clientName)}/`;
    els.draftStatus.textContent = state.status === "committed" ? "Committed" : "Draft";
    els.draftStatus.classList.toggle("is-committed", state.status === "committed");
  }

  function sectionById(id) {
    return state.catalog.find((s) => s.id === id);
  }

  function renderLibrary() {
    els.library.innerHTML = "";
    state.catalog.forEach((sec) => {
      const li = document.createElement("li");
      li.className = "library-item" + (state.sectionOrder.includes(sec.id) ? " is-used" : "");
      li.dataset.id = sec.id;
      li.innerHTML = `<div class="sec-num">${sec.num}</div>
        <div class="sec-body"><strong>${sec.title}</strong><span>${sec.summary}${sec.editable ? " · editable" : ""}</span></div>`;
      li.addEventListener("dblclick", () => addSection(sec.id));
      els.library.appendChild(li);
    });
  }

  function renderOrder() {
    els.orderList.innerHTML = "";
    state.sectionOrder.forEach((id) => {
      const sec = sectionById(id);
      if (!sec) return;
      const li = document.createElement("li");
      li.className = "order-item";
      li.dataset.id = id;
      li.innerHTML = `<div class="sec-num">${sec.num}</div>
        <div class="sec-body"><strong>${sec.title}</strong><span>${sec.summary}</span></div>
        <button type="button" class="remove" aria-label="Remove">×</button>`;
      li.querySelector(".remove").addEventListener("click", () => {
        state.sectionOrder = state.sectionOrder.filter((x) => x !== id);
        renderAll();
        autosaveLocal();
      });
      els.orderList.appendChild(li);
    });
  }

  function renderPlaceholders() {
    const editable = state.sectionOrder
      .map(sectionById)
      .filter((s) => s && s.editable && s.placeholderKey);

    if (!editable.length) {
      els.placeholders.innerHTML =
        '<p class="hint">Add an editable section (e.g. Company Overview / Specific Client Experience) to type content here.</p>';
      return;
    }

    els.placeholders.innerHTML = "";
    editable.forEach((sec) => {
      const key = sec.placeholderKey;
      const card = document.createElement("div");
      card.className = "placeholder-card";
      const value = state.placeholders[key] || "";
      card.innerHTML = `<h3>${sec.placeholderLabel || sec.title}</h3>
        <p class="empty-hint">${value ? "" : "Content placeholder"}</p>
        <textarea data-key="${key}" placeholder="Type ${sec.placeholderLabel || sec.title} content for this customer…">${value.replace(/</g, "&lt;")}</textarea>`;
      const ta = card.querySelector("textarea");
      const hint = card.querySelector(".empty-hint");
      if (value) hint.style.display = "none";
      ta.addEventListener("input", () => {
        state.placeholders[key] = ta.value;
        hint.style.display = ta.value.trim() ? "none" : "";
        state.status = "draft";
        updatePreview();
        autosaveLocal();
      });
      els.placeholders.appendChild(card);
    });
  }

  function renderAll() {
    renderLibrary();
    renderOrder();
    renderPlaceholders();
    updatePreview();
    applyTheme();
  }

  function addSection(id) {
    if (state.sectionOrder.includes(id)) return;
    state.sectionOrder.push(id);
    state.status = "draft";
    renderAll();
    autosaveLocal();
  }

  function getIndex() {
    try {
      return JSON.parse(localStorage.getItem(CONFIG.indexKey) || "[]");
    } catch {
      return [];
    }
  }

  function setIndex(list) {
    localStorage.setItem(CONFIG.indexKey, JSON.stringify(list));
  }

  function draftPayload() {
    const meta = readMeta();
    return {
      version: 1,
      status: state.status,
      slug: slugify(meta.clientName),
      meta,
      theme: { ...state.theme },
      logoDataUrl: state.logoDataUrl,
      sectionOrder: [...state.sectionOrder],
      placeholders: { ...state.placeholders },
      acceptance: {
        ...state.acceptance,
        signerName: els.fields.signerName.value.trim(),
        designation: els.fields.designation.value.trim(),
        signerEmail: els.fields.signerEmail.value.trim(),
      },
      updatedAt: new Date().toISOString(),
      committedAt: state.status === "committed" ? new Date().toISOString() : null,
      paths: {
        draft: `proposals/${slugify(meta.clientName)}/draft.json`,
        logo: `proposals/${slugify(meta.clientName)}/logo.png`,
        final: `proposals/${slugify(meta.clientName)}/index.html`,
        acceptance: `proposals/${slugify(meta.clientName)}/acceptance.json`,
      },
    };
  }

  function autosaveLocal() {
    const meta = readMeta();
    if (!meta.clientName) return;
    const payload = draftPayload();
    localStorage.setItem(CONFIG.storagePrefix + payload.slug, JSON.stringify(payload));
    const idx = getIndex().filter((x) => x.slug !== payload.slug);
    idx.unshift({ slug: payload.slug, clientName: meta.clientName, updatedAt: payload.updatedAt, status: payload.status });
    setIndex(idx);
    refreshExistingSelect();
  }

  function refreshExistingSelect() {
    const cur = els.existingSelect.value;
    els.existingSelect.innerHTML = '<option value="">Select customer draft…</option>';
    getIndex().forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item.slug;
      opt.textContent = `${item.clientName} (${item.status})`;
      els.existingSelect.appendChild(opt);
    });
    if (cur) els.existingSelect.value = cur;
  }

  function loadDraft(slug) {
    const raw = localStorage.getItem(CONFIG.storagePrefix + slug);
    if (!raw) return toast("Draft not found locally");
    const d = JSON.parse(raw);
    Object.entries(d.meta || {}).forEach(([k, v]) => {
      if (els.fields[k]) els.fields[k].value = v || "";
    });
    state.sectionOrder = d.sectionOrder || [];
    state.placeholders = d.placeholders || {};
    state.theme = d.theme || state.theme;
    state.logoDataUrl = d.logoDataUrl || "";
    state.status = d.status || "draft";
    state.acceptance = d.acceptance || state.acceptance;
    els.fields.signerName.value = state.acceptance.signerName || "";
    els.fields.designation.value = state.acceptance.designation || "";
    els.fields.signerEmail.value = state.acceptance.signerEmail || "";
    els.acceptanceStatus.textContent = `Status: ${state.acceptance.status || "not_sent"}`;
    if (state.logoDataUrl) {
      els.logoPreview.innerHTML = `<img src="${state.logoDataUrl}" alt="Customer logo">`;
      els.coverClientLogo.src = state.logoDataUrl;
      els.coverClientLogo.hidden = false;
    }
    renderAll();
    toast(`Loaded draft: ${d.meta.clientName}`);
  }

  async function postWebhook(url, payload) {
    if (!url) return { ok: false, skipped: true };
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { ok: res.ok, status: res.status };
  }

  function download(filename, text, type = "application/json") {
    const blob = new Blob([text], { type });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function buildFinalHtml(payload) {
    const sections = payload.sectionOrder
      .map((id, i) => {
        const sec = sectionById(id);
        if (!sec) return "";
        const ph =
          sec.editable && sec.placeholderKey
            ? `<div class="placeholder-block"><h3>${sec.placeholderLabel || sec.title}</h3><div class="prose"><p>${escapeHtml(payload.placeholders[sec.placeholderKey] || "CONTENT PLACEHOLDER").replace(/\n/g, "<br>")}</p></div></div>`
            : `<div class="prose"><p><em>Content pulled from master template section ${sec.num} on final GitHub build.</em></p></div>`;
        return `<section class="proposal-page" id="${sec.id}">
          <div class="section-head"><span class="section-num">${String(i + 1).padStart(2, "0")}</span><h2>${sec.title}</h2></div>
          <div class="section-body">${ph}</div>
        </section>`;
      })
      .join("\n");

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(payload.meta.clientName)} — Trilogy Digital Proposal</title>
<style>
:root{--brand-navy:#13202e;--brand-green:${payload.theme.primary};--brand-lime:${payload.theme.accent};--font-sans:Inter,system-ui,sans-serif;--font-heading:Poppins,system-ui,sans-serif}
body{margin:0;font-family:var(--font-sans);background:#f2f5f7;color:#13202e}
.cover{background:var(--brand-navy);color:#fff;padding:3rem 2rem}
.badge{display:inline-flex;border:1px solid color-mix(in srgb,var(--brand-green) 50%,transparent);background:color-mix(in srgb,var(--brand-green) 12%,transparent);color:var(--brand-lime);border-radius:999px;padding:.25rem .7rem;font-size:.7rem}
h1{font-family:var(--font-heading);font-size:2rem;max-width:16ch}
.tagline{color:var(--brand-green);font-weight:600}
.meta{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-top:2rem;padding-top:1rem;border-top:1px solid rgba(255,255,255,.12)}
.meta span{display:block;font-size:.65rem;letter-spacing:.08em;text-transform:uppercase;color:var(--brand-green)}
.proposal-page{max-width:860px;margin:1.5rem auto;background:#fff;border:1px solid #dadfe3;border-radius:.75rem;padding:1.5rem}
.section-num{color:var(--brand-green);font-weight:700;margin-right:.5rem}
.placeholder-block{border:1px dashed #c5ccd3;border-radius:.75rem;background:#f7f9fb;padding:1rem;margin-top:.75rem}
.logo-row{display:flex;gap:1rem;align-items:center;margin-bottom:1.25rem}
.logo-row img{max-height:48px}
</style>
</head>
<body>
<section class="cover">
  <div class="logo-row">
    ${payload.logoDataUrl ? `<img src="${payload.logoDataUrl}" alt="${escapeHtml(payload.meta.clientName)} logo">` : ""}
  </div>
  <div class="badge">RFP / RFI Response</div>
  <h1>Customer Experience &amp; BPO Services Proposal</h1>
  <p class="tagline">Human Led · Ai-enabled</p>
  <div class="meta">
    <div><span>Prepared for</span><strong>${escapeHtml(payload.meta.clientName || "[Client Name]")}</strong></div>
    <div><span>Reference</span><strong>${escapeHtml(payload.meta.reference || "[Reference]")}</strong></div>
    <div><span>Date</span><strong>${escapeHtml(payload.meta.date || "[Date]")}</strong></div>
    <div><span>Valid until</span><strong>${escapeHtml(payload.meta.validUntil || "[Valid until]")}</strong></div>
  </div>
</section>
${sections}
<footer style="max-width:860px;margin:1rem auto 2rem;color:#606a74;font-size:.85rem">Trilogy Digital — draft built from RFP Builder. Final GitHub commit merges full master section HTML.</footer>
</body>
</html>`;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /** Sample dominant non-dark/non-light colours from logo for theming */
  function extractThemeFromImage(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const w = (canvas.width = 64);
        const h = (canvas.height = 64);
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;
        const buckets = new Map();
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 200) continue;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          if (max < 40 || min > 230) continue; // skip near-black / near-white
          const key = `${Math.round(r / 24) * 24},${Math.round(g / 24) * 24},${Math.round(b / 24) * 24}`;
          buckets.set(key, (buckets.get(key) || 0) + 1);
        }
        const sorted = [...buckets.entries()].sort((a, b) => b[1] - a[1]);
        const toHex = (rgb) =>
          "#" +
          rgb
            .split(",")
            .map((n) => Number(n).toString(16).padStart(2, "0"))
            .join("");
        const primary = sorted[0] ? toHex(sorted[0][0]) : "#61d779";
        const accent = sorted[1] ? toHex(sorted[1][0]) : "#d5ec67";
        resolve({ primary, accent, navy: "#13202e" });
      };
      img.onerror = () => resolve({ primary: "#61d779", accent: "#d5ec67", navy: "#13202e" });
      img.src = dataUrl;
    });
  }

  // Events
  Object.values(els.fields).forEach((input) => {
    input.addEventListener("input", () => {
      state.status = "draft";
      updatePreview();
      autosaveLocal();
    });
  });

  els.logoInput.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      state.logoDataUrl = String(reader.result);
      els.logoPreview.innerHTML = `<img src="${state.logoDataUrl}" alt="Customer logo">`;
      els.coverClientLogo.src = state.logoDataUrl;
      els.coverClientLogo.hidden = false;
      state.theme = await extractThemeFromImage(state.logoDataUrl);
      state.status = "draft";
      applyTheme();
      renderOrder();
      autosaveLocal();
      toast("Logo applied — theme colours updated");
    };
    reader.readAsDataURL(file);
  });

  document.getElementById("btnExportDraft").addEventListener("click", () => {
    const payload = draftPayload();
    if (!payload.meta.clientName) return toast("Enter a customer name first");
    download(`${payload.slug}-draft.json`, JSON.stringify(payload, null, 2));
    toast("Draft JSON downloaded");
  });

  document.getElementById("btnSaveDraft").addEventListener("click", async () => {
    const payload = draftPayload();
    if (!payload.meta.clientName) return toast("Enter a customer name first");
    autosaveLocal();
    payload.event = "saveDraft";
    const res = await postWebhook(CONFIG.webhooks.saveDraft, payload);
    if (res.skipped) {
      download(`${payload.slug}-draft.json`, JSON.stringify(payload, null, 2));
      toast("Draft saved locally + JSON exported (webhook not configured)");
    } else if (res.ok) {
      toast("Draft sent to Power Automate / GitHub save flow");
    } else {
      toast(`Draft webhook failed (${res.status}) — kept local copy`);
    }
  });

  document.getElementById("btnFinalCommit").addEventListener("click", async () => {
    const payload = draftPayload();
    if (!payload.meta.clientName) return toast("Enter a customer name first");
    if (!payload.sectionOrder.length) return toast("Add at least one section");
    state.status = "committed";
    payload.status = "committed";
    payload.event = "finalCommit";
    payload.builtHtml = buildFinalHtml(payload);
    autosaveLocal();
    download(`${payload.slug}-index.html`, payload.builtHtml, "text/html");
    download(`${payload.slug}-draft.json`, JSON.stringify({ ...payload, builtHtml: undefined }, null, 2));
    const res = await postWebhook(CONFIG.webhooks.finalCommit, payload);
    if (res.skipped) {
      toast("Final HTML exported — drop into proposals/" + payload.slug + "/ (webhook not configured)");
    } else if (res.ok) {
      toast("Final commit sent to build flow");
    } else {
      toast(`Commit webhook failed (${res.status}) — files downloaded`);
    }
    updatePreview();
  });

  document.getElementById("btnSendAcceptance").addEventListener("click", async () => {
    const payload = draftPayload();
    if (!payload.acceptance.signerName || !payload.acceptance.signerEmail) {
      return toast("Signer name and email required");
    }
    payload.event = "sendForAcceptance";
    payload.acceptance.status = "sent";
    state.acceptance = payload.acceptance;
    els.acceptanceStatus.textContent = "Status: sent (awaiting DocuSign)";
    autosaveLocal();
    const res = await postWebhook(CONFIG.webhooks.sendForAcceptance, payload);
    if (res.skipped) {
      toast("Acceptance payload ready — configure DocuSign Power Automate webhook");
      download(`${payload.slug}-acceptance-request.json`, JSON.stringify(payload.acceptance, null, 2));
    } else if (res.ok) {
      toast("DocuSign acceptance flow triggered");
    } else {
      toast(`Acceptance webhook failed (${res.status})`);
    }
  });

  els.existingSelect.addEventListener("change", () => {
    if (els.existingSelect.value) loadDraft(els.existingSelect.value);
  });

  // Init
  fetch("sections.json")
    .then((r) => r.json())
    .then((data) => {
      state.catalog = data.sections || [];
      // Sensible default starter set
      state.sectionOrder = ["section-01", "section-02", "section-03", "section-04"];
      renderAll();
      refreshExistingSelect();
      new Sortable(els.orderList, {
        group: "sections",
        animation: 150,
        onAdd: (evt) => {
          const id = evt.item.dataset.id;
          evt.item.remove();
          if (id && !state.sectionOrder.includes(id)) {
            const to = evt.newIndex;
            state.sectionOrder.splice(to, 0, id);
            state.status = "draft";
            renderAll();
            autosaveLocal();
          } else {
            renderAll();
          }
        },
        onEnd: () => {
          state.sectionOrder = [...els.orderList.querySelectorAll(".order-item")].map((li) => li.dataset.id);
          state.status = "draft";
          renderLibrary();
          renderPlaceholders();
          updatePreview();
          autosaveLocal();
        },
      });
      new Sortable(els.library, {
        group: { name: "sections", pull: "clone", put: false },
        sort: false,
        animation: 150,
      });
    })
    .catch(() => toast("Could not load sections.json"));
})();

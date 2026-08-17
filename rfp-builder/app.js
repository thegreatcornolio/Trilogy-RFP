(() => {
  const CONFIG = {
    storagePrefix: "trilogy-rfp-draft:",
    indexKey: "trilogy-rfp-index-v2",
    templateBase: "",
    entityContentUrl: "",
    webhooks: {
      saveDraft:
        "https://default77cde95f930f495e89c64d2c30f6df.21.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/12/workflows/12897ac2d1e94a149bd39340b39ac8c9/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=VqvO6vdmGXNlJj9PJIiu0J46H762ddWTxLEcL6Soa90",
      finalCommit: "",
      sendForAcceptance: "",
    },
  };

  // Resolve asset bases from the builder folder even when the URL has no trailing slash
  (function initPaths() {
    const href = window.location.href.split(/[?#]/)[0];
    const builderDir = href.replace(/\/index\.html$/i, "").replace(/\/?$/, "/");
    CONFIG.templateBase = new URL("../trilogydigital/", builderDir).href;
    CONFIG.entityContentUrl = new URL("entity-content.json", builderDir).href;
  })();

  // Embedded fallback so Company Overview never depends on a JSON fetch succeeding
  const ENTITY_CONTENT_FALLBACK = {
    companyOverview: {
      "Trilogy Digital": {
        tagline: null,
        paragraphs: [
          "Trilogy Digital (Pty) Ltd is a purpose-built customer experience (CX) joint venture between Trilogy BPO and CXG, operating as a single integrated entity and now a Trilogy Group company. The partnership marries CXG's 27-year operational tenure and scale within the South African market to Trilogy's deep expertise in managing UK campaigns and delivering advanced digital and AI capabilities.",
          "The combined leadership team brings over 25 years of industry expertise, having previously established and successfully exited two major BPOs. Over their careers they have managed more than 36 contact centre operations, scaled over 10,000 seats globally, and delivered CX programmes for brands including John Lewis & Partners, British Gas, Vodafone UK, Aldi UK, and Virgin.",
          "Today, Trilogy Digital deploys over 1,000 CX specialists across five operational sites in South Africa, anchored by its flagship campus at Mutual Park in Cape Town. Despite this scale, Trilogy Digital remains an owner-led, high-touch business — focused on being responsive.",
        ],
        bullets: [],
      },
      "Trilogy BPO": {
        tagline: "Human empathy meets AI efficiency.",
        lead: "Making customer engagement offshoring easy.",
        paragraphs: [
          "Trilogy BPO is an offshore Business Process Outsourcing company in South Africa, helping UK and USA companies augment their customer experience while cutting the cost of customer service and sales.",
          "Trilogy is led by seasoned BPO operators with 25+ years of combined leadership. Between them they have built and managed 30+ contact centres globally, launched 1,000-seat operations, and stood up fully operational sites in under six weeks. They know what it takes to get customer experience right, first time.",
          "The combined leadership team brings over 25 years of industry expertise, having previously established and successfully exited two major BPOs. Over their careers they have managed more than 36 contact centre operations, scaled over 10,000 seats globally, and delivered CX programmes for brands including John Lewis & Partners, British Gas, Vodafone UK, Aldi UK, and Virgin.",
        ],
        bullets: [],
      },
      "Trilogy GCC": {
        tagline: "From outsourcing to ownership.",
        lead: "Trilogy GCC allows you to move beyond outsourcing. Design, Build, Innovate, Transfer — your risk-mitigated roadmap to a fully-owned Center of Excellence in South Africa.",
        paragraphs: [
          "Establish a Global Capability Center in South Africa that functions as a seamless extension of your headquarters — transitioning from third-party dependency to a fully-owned global asset.",
        ],
        bullets: [
          "Build your own capability center in South Africa.",
          "DBIT assists international BPO or enterprise companies to establish global capability centers in South Africa.",
          "Global capability centers or captives provide between 20%–30% cost savings versus offshore outsourcing.",
          "Trilogy also offers a unique digital and autonomous platform to reduce headcount.",
        ],
      },
    },
  };

  const state = {
    catalog: [],
    sectionOrder: [],
    placeholders: {},
    entityContent: ENTITY_CONTENT_FALLBACK,
    theme: {
      primary: "#61d779",
      accent: "#d5ec67",
      secondary: "#2f9e4a",
      navy: "#13202e",
    },
    palette: ["#61d779", "#d5ec67", "#2f9e4a", "#e2b93b", "#ffffff"],
    selectedPaletteIndex: 0,
    logoDataUrl: "",
    status: "draft",
    currentSlug: null,
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
    themeRoles: document.getElementById("themeRoles"),
    coverClientLogo: document.getElementById("coverClientLogo"),
    slugPreview: document.getElementById("slugPreview"),
    draftStatus: document.getElementById("draftStatus"),
    existingSelect: document.getElementById("existingSelect"),
    toast: document.getElementById("toast"),
    acceptanceStatus: document.getElementById("acceptanceStatus"),
    pvEntity: document.getElementById("pvEntity"),
    fields: {
      clientName: document.getElementById("clientName"),
      documentType: document.getElementById("documentType"),
      proposalTitle: document.getElementById("proposalTitle"),
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
      documentType: document.getElementById("pvDocumentType"),
      proposalTitle: document.getElementById("pvProposalTitle"),
      date: document.getElementById("pvDate"),
      valid: document.getElementById("pvValid"),
      by: document.getElementById("pvBy"),
      title: document.getElementById("pvTitle"),
      contact: document.getElementById("pvContact"),
    },
  };

  function slugify(name) {
    return (
      String(name || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "customer"
    );
  }

  function clientSlug(meta) {
    return slugify(meta?.clientName || "customer");
  }

  function docTypeSlug(meta) {
    return slugify(meta?.documentType || "rfp-rfi-response") || "document";
  }

  function draftSlug(meta) {
    return `${clientSlug(meta)}__${docTypeSlug(meta)}`;
  }

  function customerPaths(meta) {
    const client = clientSlug(meta);
    const doc = docTypeSlug(meta);
    const base = `proposals/${client}/${doc}`;
    return {
      draft: `${base}/draft.json`,
      logo: `proposals/${client}/logo.png`,
      final: `${base}/index.html`,
      acceptance: `${base}/acceptance.json`,
      folder: `${base}/`,
    };
  }

  function toast(msg) {
    els.toast.hidden = false;
    els.toast.textContent = msg;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      els.toast.hidden = true;
    }, 2800);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getEntityName() {
    const checked = document.querySelector('input[name="entityName"]:checked');
    return checked ? checked.value : "Trilogy Digital";
  }

  function setEntityName(value) {
    const allowed = new Set(["Trilogy Digital", "Trilogy BPO", "Trilogy GCC"]);
    const normalized =
      value === "Trilogy" || !allowed.has(value) ? "Trilogy Digital" : value;
    const input = document.querySelector(
      `input[name="entityName"][value="${CSS.escape(normalized)}"]`
    );
    if (input) input.checked = true;
  }

  function legalEntityName(entity) {
    // BPO and GCC are brands under Trilogy Digital (Pty) Ltd
    return "Trilogy Digital (Pty) Ltd";
  }

  async function loadEntityContent() {
    if (state._entityLoaded) return state.entityContent;
    state._entityLoaded = true;
    try {
      const res = await fetch(`${CONFIG.entityContentUrl}?v=entity-overview-2`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.companyOverview?.["Trilogy BPO"]) {
          state.entityContent = data;
        }
      }
    } catch (err) {
      console.warn("entity-content.json fetch failed; using embedded copy", err);
    }
    if (!state.entityContent?.companyOverview) {
      state.entityContent = ENTITY_CONTENT_FALLBACK;
    }
    renderEntityOverviewPreview();
    return state.entityContent;
  }

  function getCompanyOverviewPack(entity) {
    const map = state.entityContent?.companyOverview || ENTITY_CONTENT_FALLBACK.companyOverview;
    return map[entity] || map["Trilogy Digital"];
  }

  function companyOverviewHtml(entity) {
    const pack = getCompanyOverviewPack(entity);
    if (!pack) return "";

    const parts = [];
    if (pack.tagline) {
      parts.push(
        `<p class="co-tagline"><strong>${escapeHtml(pack.tagline)}</strong></p>`
      );
    }
    if (pack.lead) {
      parts.push(`<p class="co-lead">${escapeHtml(pack.lead)}</p>`);
    }
    (pack.paragraphs || []).forEach((p, i) => {
      // For GCC, bullets sit between lead and closing paragraph
      if (
        entity === "Trilogy GCC" &&
        i === (pack.paragraphs || []).length - 1 &&
        (pack.bullets || []).length
      ) {
        parts.push(
          `<ul class="co-bullets">${(pack.bullets || [])
            .map((b) => `<li>${escapeHtml(b)}</li>`)
            .join("")}</ul>`
        );
      }
      parts.push(`<p>${escapeHtml(p)}</p>`);
    });
    if (entity !== "Trilogy GCC" && (pack.bullets || []).length) {
      parts.push(
        `<ul class="co-bullets">${(pack.bullets || [])
          .map((b) => `<li>${escapeHtml(b)}</li>`)
          .join("")}</ul>`
      );
    }
    return parts.join("\n            ");
  }

  function renderEntityOverviewPreview() {
    const body = document.getElementById("entityOverviewPreviewBody");
    const hint = document.getElementById("entityOverviewHint");
    const entity = getEntityName();
    if (hint) {
      hint.textContent = `Company Overview uses the ${entity} narrative.`;
    }
    if (!body) return;
    const html = companyOverviewHtml(entity);
    body.innerHTML = html || "<p>No overview copy loaded.</p>";
  }

  function applyTheme() {
    document.documentElement.style.setProperty("--client-primary", state.theme.primary);
    document.documentElement.style.setProperty("--client-accent", state.theme.accent);
    document.documentElement.style.setProperty(
      "--client-secondary",
      state.theme.secondary || state.theme.primary
    );
    renderPalette();
    syncLogoUi();
  }

  function isNearWhite(hex) {
    const h = String(hex || "").toLowerCase();
    return h === "#fff" || h === "#ffffff";
  }

  /** Always offer white so Document Type / accents stay readable on dark logos */
  function ensureWhiteInPalette(palette) {
    const list = Array.isArray(palette) ? [...palette] : [];
    if (!list.some(isNearWhite)) list.push("#ffffff");
    return list;
  }

  function syncLogoUi() {
    const btn = document.getElementById("btnRemoveLogo");
    if (!btn) return;
    btn.disabled = !state.logoDataUrl;
    btn.setAttribute("aria-disabled", state.logoDataUrl ? "false" : "true");
  }

  function clearLogo() {
    state.logoDataUrl = "";
    state.palette = ensureWhiteInPalette([
      "#61d779",
      "#d5ec67",
      "#2f9e4a",
      "#e2b93b",
    ]);
    state.theme = {
      primary: "#61d779",
      accent: "#d5ec67",
      secondary: "#2f9e4a",
      navy: "#13202e",
    };
    if (els.logoInput) els.logoInput.value = "";
    els.logoPreview.innerHTML = "<span>Logo preview + colour palette</span>";
    els.coverClientLogo.removeAttribute("src");
    els.coverClientLogo.hidden = true;
    state.status = "draft";
    applyTheme();
    updatePreview();
    autosaveLocal();
    toast("Customer logo removed");
  }

  function renderPalette() {
    // Keep palette container empty — roles show colours directly
    if (els.themeSwatches) els.themeSwatches.innerHTML = "";
    state.palette = ensureWhiteInPalette(state.palette);

    const roles = [
      ["primary", "Primary"],
      ["accent", "Accent"],
      ["secondary", "Secondary"],
    ];
    els.themeRoles.innerHTML = "";
    roles.forEach(([key, label]) => {
      const row = document.createElement("div");
      row.className = "theme-role";
      const swatches = document.createElement("div");
      swatches.className = "theme-role__swatches";
      state.palette.forEach((c) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className =
          "swatch" +
          (state.theme[key] === c ? " is-selected" : "") +
          (isNearWhite(c) ? " swatch--light" : "");
        btn.style.background = c;
        btn.setAttribute("aria-label", `${label} ${c}`);
        btn.title = isNearWhite(c) ? `${label} · White` : label;
        btn.addEventListener("click", () => {
          state.theme[key] = c;
          state.status = "draft";
          applyTheme();
          autosaveLocal();
        });
        swatches.appendChild(btn);
      });
      const name = document.createElement("span");
      name.textContent = label;
      row.appendChild(name);
      row.appendChild(swatches);
      els.themeRoles.appendChild(row);
    });
  }

  function formatDisplayDate(isoDate) {
    if (!isoDate) return "";
    const parts = String(isoDate).split("-").map(Number);
    if (parts.length !== 3 || parts.some((n) => !n)) return isoDate;
    const [y, m, d] = parts;
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const ord =
      d % 10 === 1 && d !== 11
        ? "st"
        : d % 10 === 2 && d !== 12
          ? "nd"
          : d % 10 === 3 && d !== 13
            ? "rd"
            : "th";
    return `${d}${ord} ${months[m - 1]} ${y}`;
  }

  function readMeta() {
    const dateRaw = els.fields.date.value.trim();
    return {
      entityName: getEntityName(),
      clientName: els.fields.clientName.value.trim(),
      documentType:
        els.fields.documentType.value.trim() || "RFP / RFI Response",
      proposalTitle:
        els.fields.proposalTitle.value.trim() ||
        "Customer Experience & BPO Services Proposal",
      date: dateRaw,
      dateDisplay: formatDisplayDate(dateRaw),
      validUntil: els.fields.validUntil.value.trim() || "Valid for 90 days",
      preparedBy: els.fields.preparedBy.value.trim(),
      title: els.fields.title.value.trim(),
      contact: els.fields.contact.value.trim(),
    };
  }

  function updatePreview() {
    const m = readMeta();
    const fill = (el, val, fallback) => {
      if (!el) return;
      el.textContent = val || fallback;
    };
    els.pvEntity.textContent = m.entityName;
    fill(els.preview.documentType, m.documentType, "RFP / RFI Response");
    fill(
      els.preview.proposalTitle,
      m.proposalTitle,
      "Customer Experience & BPO Services Proposal"
    );
    fill(els.preview.client, m.clientName, "[Client Name]");
    fill(els.preview.date, m.dateDisplay || m.date, "[Submission Date]");
    fill(els.preview.valid, m.validUntil, "Valid for 90 days");
    fill(els.preview.by, m.preparedBy, "[Your Name]");
    fill(els.preview.title, m.title, "[Your Title]");
    fill(els.preview.contact, m.contact, "[name@trilogydigital.com]");
    els.slugPreview.textContent = customerPaths(m).folder;
    renderEntityOverviewPreview();
    els.draftStatus.textContent = state.status === "committed" ? "Committed" : "Draft";
    els.draftStatus.classList.toggle("is-committed", state.status === "committed");
  }

  function sectionById(id) {
    return state.catalog.find((s) => s.id === id);
  }

  function renderLibrary() {
    els.library.innerHTML = "";
    state.catalog.forEach((sec) => {
      const used = state.sectionOrder.includes(sec.id);
      const li = document.createElement("li");
      li.className = "library-item" + (used ? " is-used" : "");
      li.dataset.id = sec.id;
      li.innerHTML = `<div class="sec-num">${sec.num}</div>
        <div class="sec-body"><strong>${sec.title}</strong><span>${sec.summary}${
        sec.editable ? " · editable" : ""
      }</span></div>
        <button type="button" class="library-add"${
          used ? " disabled" : ""
        } aria-label="Add ${sec.title}">${used ? "Added" : "Add"}</button>`;
      const addBtn = li.querySelector(".library-add");
      addBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (used) return;
        addSection(sec.id);
      });
      li.addEventListener("dblclick", () => {
        if (!used) addSection(sec.id);
      });
      els.library.appendChild(li);
    });
  }

  function renderOrder() {
    els.orderList.innerHTML = "";
    state.sectionOrder.forEach((id, index) => {
      const sec = sectionById(id);
      if (!sec) return;
      const displayNum = String(index + 1).padStart(2, "0");
      const li = document.createElement("li");
      li.className = "order-item";
      li.dataset.id = id;
      li.innerHTML = `<div class="sec-num">${displayNum}</div>
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

  function sectionTitleForId(id, blockHtml) {
    const sec = sectionById(id);
    if (sec?.title) return sec.title;
    const m = String(blockHtml || "").match(/<h2>([\s\S]*?)<\/h2>/);
    if (m) {
      return m[1].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim();
    }
    return id;
  }

  function buildDocumentContentsHtml(entries) {
    const rows = entries
      .map(
        (entry, i) =>
          `<tr><td>${i + 1}</td><td><a href="#${entry.id}">${escapeHtml(
            entry.title
          )}</a></td></tr>`
      )
      .join("\n                  ");
    return `<section class="proposal-page" id="document-contents">
        <div class="section-head">
          <h2>Document Contents</h2>
        </div>
        <div class="section-body">
          <div class="covers-box" id="doc-contents">
            <div class="covers-box__head">Document contents</div>
            <div class="table-wrap covers-table-wrap">
              <table class="covers-table">
                <tbody>
                  ${rows}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>`;
  }

  function renderPlaceholders() {
    const editable = state.sectionOrder
      .map(sectionById)
      .filter((s) => s && s.editable && s.placeholderKey);

    if (!editable.length) {
      els.placeholders.innerHTML =
        '<p class="hint">Add an editable section to type customer-specific content.</p>';
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
        <textarea data-key="${key}" placeholder="Type ${
        sec.placeholderLabel || sec.title
      } content…">${escapeHtml(value)}</textarea>`;
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
    const paths = customerPaths(meta);
    return {
      version: 2,
      status: state.status,
      slug: draftSlug(meta),
      clientSlug: clientSlug(meta),
      docSlug: docTypeSlug(meta),
      meta,
      theme: { ...state.theme },
      palette: [...state.palette],
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
      paths,
    };
  }

  function autosaveLocal(opts = {}) {
    const { updateIndex = false } = opts;
    const meta = readMeta();
    if (!meta.clientName) return;
    const payload = draftPayload();
    localStorage.setItem(CONFIG.storagePrefix + payload.slug, JSON.stringify(payload));
    localStorage.setItem(CONFIG.storagePrefix + "working", JSON.stringify(payload));
    state.currentSlug = payload.slug;
    if (updateIndex) {
      const idx = getIndex().filter((x) => x.slug !== payload.slug);
      idx.unshift({
        slug: payload.slug,
        clientSlug: payload.clientSlug,
        docSlug: payload.docSlug,
        clientName: meta.clientName,
        documentType: meta.documentType,
        updatedAt: payload.updatedAt,
        status: payload.status,
      });
      setIndex(idx);
      refreshExistingSelect();
      els.existingSelect.value = payload.slug;
    }
  }

  function clearLocalDrafts() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k === CONFIG.indexKey || k.startsWith(CONFIG.storagePrefix))) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
    refreshExistingSelect();
    toast("Local drafts cleared");
  }

  function refreshExistingSelect() {
    const cur = els.existingSelect.value;
    els.existingSelect.innerHTML = '<option value="">Select customer document…</option>';
    getIndex().forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item.slug;
      const docLabel = item.documentType || "Document";
      opt.textContent = `${item.clientName} — ${docLabel} (${item.status})`;
      els.existingSelect.appendChild(opt);
    });
    if (cur) els.existingSelect.value = cur;
  }

  function loadDraft(slug) {
    const raw = localStorage.getItem(CONFIG.storagePrefix + slug);
    if (!raw) return toast("Draft not found locally");
    const d = JSON.parse(raw);
    Object.entries(d.meta || {}).forEach(([k, v]) => {
      if (k === "entityName") setEntityName(v || "Trilogy Digital");
      else if (k === "reference") return; // removed field
      else if (k === "documentType" && els.fields.documentType) {
        els.fields.documentType.value = v || "RFP / RFI Response";
      } else if (k === "proposalTitle" && els.fields.proposalTitle) {
        els.fields.proposalTitle.value = v || "";
      } else if (els.fields[k]) {
        els.fields[k].value = v || "";
      }
    });
    if (els.fields.documentType && !els.fields.documentType.value.trim()) {
      els.fields.documentType.value = "RFP / RFI Response";
    }
    if (!els.fields.validUntil.value.trim()) {
      els.fields.validUntil.value = "Valid for 90 days";
    }
    state.sectionOrder = d.sectionOrder || [];
    state.placeholders = d.placeholders || {};
    state.theme = {
      primary: "#61d779",
      accent: "#d5ec67",
      secondary: "#2f9e4a",
      navy: "#13202e",
      ...(d.theme || {}),
    };
    state.palette = d.palette && d.palette.length ? d.palette : [state.theme.primary, state.theme.accent, state.theme.secondary];
    state.logoDataUrl = d.logoDataUrl || "";
    state.status = d.status || "draft";
    state.currentSlug = slug;
    state.acceptance = d.acceptance || state.acceptance;
    els.fields.signerName.value = state.acceptance.signerName || "";
    els.fields.designation.value = state.acceptance.designation || "";
    els.fields.signerEmail.value = state.acceptance.signerEmail || "";
    els.acceptanceStatus.textContent = `Status: ${state.acceptance.status || "not_sent"}`;
    if (state.logoDataUrl) {
      els.logoPreview.innerHTML = `<img src="${state.logoDataUrl}" alt="Customer logo">`;
      els.coverClientLogo.src = state.logoDataUrl;
      els.coverClientLogo.hidden = false;
    } else {
      els.logoPreview.innerHTML = "<span>Logo preview + colour palette</span>";
      els.coverClientLogo.removeAttribute("src");
      els.coverClientLogo.hidden = true;
    }
    applyTheme();
    renderAll();
    toast(`Loaded: ${d.meta.clientName} — ${d.meta.documentType || "Document"}`);
  }

  function startNewDocument() {
    const keepClient = els.fields.clientName.value.trim();
    const keepLogo = state.logoDataUrl;
    const keepTheme = { ...state.theme };
    const keepPalette = [...state.palette];
    const keepEntity = getEntityName();
    const keepPreparedBy = els.fields.preparedBy.value;
    const keepTitle = els.fields.title.value;
    const keepContact = els.fields.contact.value;

    state.currentSlug = null;
    state.status = "draft";
    state.placeholders = {};
    state.sectionOrder = [
      "section-01",
      "section-02",
      "section-03",
      "section-04",
      "section-05",
    ];
    state.logoDataUrl = keepLogo;
    state.theme = keepTheme;
    state.palette = keepPalette;
    state.acceptance = {
      status: "not_sent",
      signerName: "",
      signerEmail: "",
      designation: "",
      envelopeId: "",
      sharePointPath: "",
    };

    setEntityName(keepEntity);
    els.fields.clientName.value = keepClient;
    els.fields.documentType.value = "Company Overview";
    els.fields.proposalTitle.value = "Company Overview";
    els.fields.preparedBy.value = keepPreparedBy;
    els.fields.title.value = keepTitle;
    els.fields.contact.value = keepContact;
    els.fields.signerName.value = "";
    els.fields.designation.value = "";
    els.fields.signerEmail.value = "";
    els.acceptanceStatus.textContent = "Status: not_sent";
    els.existingSelect.value = "";

    if (state.logoDataUrl) {
      els.logoPreview.innerHTML = `<img src="${state.logoDataUrl}" alt="Customer logo">`;
      els.coverClientLogo.src = state.logoDataUrl;
      els.coverClientLogo.hidden = false;
    } else {
      els.logoPreview.innerHTML = "<span>Logo preview + colour palette</span>";
      els.coverClientLogo.removeAttribute("src");
      els.coverClientLogo.hidden = true;
    }

    applyTheme();
    renderAll();
    toast(
      keepClient
        ? `New document for ${keepClient} — set type/title, then Save draft`
        : "New document — enter customer and document type, then Save draft"
    );
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

  function placeholderHtml(text) {
    const body = escapeHtml(text || "").replace(/\n/g, "<br>");
    if (!text || !text.trim()) {
      return `<div class="placeholder-block"><p class="placeholder-label">Content placeholder</p></div>`;
    }
    return `<div class="placeholder-block is-filled"><div class="prose"><p>${body}</p></div></div>`;
  }

  /** Build full proposal from master trilogydigital template */
  async function assembleFullProposal(payload, { isPreview = false } = {}) {
    await loadEntityContent();
    const base = CONFIG.templateBase;
    const res = await fetch(`${base}index.html`, { cache: "no-store" });
    if (!res.ok) throw new Error("Could not load master proposal template");
    let html = await res.text();

    html = html.replace(/href="(styles\.css[^"]*)"/, `href="${base}$1"`);
    html = html.replace(/src="(script\.js[^"]*)"/, `src="${base}$1"`);
    html = html.replace(/(src|href)="assets\//g, `$1="${base}assets/`);

    const entity = payload.meta.entityName || "Trilogy Digital";
    const clientLogo = payload.logoDataUrl
      ? `<img class="cover__client-logo" src="${payload.logoDataUrl}" alt="${escapeHtml(
          payload.meta.clientName || "Client"
        )} logo">`
      : "";

    const brand = `
        <div class="cover__brand">
          ${clientLogo}
          <span class="cover__brand-name">${escapeHtml(entity)}</span>
          <span class="cover__brand-line">A Trilogy Group Company</span>
          <img class="cover__logo" src="${base}assets/trilogy-logo.png" alt="Trilogy">
        </div>`;
    html = html.replace(/<div class="cover__brand">[\s\S]*?<\/div>\s*<div class="cover__body">/, `${brand}\n        <div class="cover__body">`);

    const replacements = [
      ["[Client Name]", payload.meta.clientName],
      ["[Submission Date]", payload.meta.dateDisplay || payload.meta.date],
      ["[Valid for 90 days]", payload.meta.validUntil || "Valid for 90 days"],
      ["[Your Name]", payload.meta.preparedBy],
      ["[Your Title]", payload.meta.title],
      ["[name@trilogydigital.com]", payload.meta.contact],
    ];
    replacements.forEach(([from, to]) => {
      if (to) html = html.split(from).join(escapeHtml(to));
    });

    // Proposal title replaces cover H1
    const proposalTitle =
      payload.meta.proposalTitle || "Customer Experience & BPO Services Proposal";
    html = html.replace(
      /(<div class="cover__body">[\s\S]*?<h1>)([\s\S]*?)(<\/h1>)/,
      `$1${escapeHtml(proposalTitle)}$3`
    );

    // Document type replaces cover badge (RFP / RFI Response, Company Overview, …)
    const documentType = payload.meta.documentType || "RFP / RFI Response";
    html = html.replace(
      /(<div class="badge">)([\s\S]*?)(<\/div>)/,
      `$1${escapeHtml(documentType)}$3`
    );

    // Drop Reference from cover meta grid (3 fields remain)
    html = html.replace(
      /<div class="meta-grid meta-grid--4">\s*<div><div class="meta-label">Prepared for<\/div><div class="meta-value">[\s\S]*?<\/div><\/div>\s*<div><div class="meta-label">Reference<\/div><div class="meta-value">[\s\S]*?<\/div><\/div>\s*<div><div class="meta-label">Date<\/div><div class="meta-value">([\s\S]*?)<\/div><\/div>\s*<div><div class="meta-label">Valid until<\/div><div class="meta-value">([\s\S]*?)<\/div><\/div>\s*<\/div>/,
      `<div class="meta-grid meta-grid--3">
          <div><div class="meta-label">Prepared for</div><div class="meta-value">${escapeHtml(
            payload.meta.clientName || "[Client Name]"
          )}</div></div>
          <div><div class="meta-label">Date</div><div class="meta-value">$1</div></div>
          <div><div class="meta-label">Valid until</div><div class="meta-value">$2</div></div>
        </div>`
    );

    // Entity-specific Company Overview
    const overviewInner = companyOverviewHtml(entity);
    if (overviewInner) {
      let replaced = false;
      html = html.replace(
        /<div class="prose" id="co-overview">[\s\S]*?<\/div>/,
        () => {
          replaced = true;
          return `<div class="prose" id="co-overview">\n            ${overviewInner}\n          </div>`;
        }
      );
      if (!replaced) {
        console.warn("Could not find #co-overview to inject entity overview");
      }
    }

    // South African Footprint — swap entity brand name
    html = html.replace(
      /(<div class="prose" id="sa-footprint-copy">)([\s\S]*?)(<\/div>)/,
      (_, open, inner, close) =>
        open +
        inner
          .replace(/Trilogy Digital's/g, `${escapeHtml(entity)}'s`)
          .replace(/Trilogy Digital/g, escapeHtml(entity)) +
        close
    );

    // JV diagram + JV partners are Digital-specific
    if (entity !== "Trilogy Digital") {
      html = html.replace(
        /<figure class="jv-diagram"[\s\S]*?<\/figure>/,
        ""
      );
      html = html.replace(
        /<!-- ENTITY_DIGITAL_ONLY_START -->[\s\S]*?<!-- ENTITY_DIGITAL_ONLY_END -->/,
        ""
      );
    }

    // Keep, reorder and renumber selected sections; add Document Contents
    const sectionBlocks = new Map();
    html = html.replace(
      /<section class="proposal-page" id="(section-\d+)">[\s\S]*?<\/section>/g,
      (block, id) => {
        sectionBlocks.set(id, block);
        return "<!--__SECTION_SLOT__-->";
      }
    );
    html = html.replace(/(?:<!--__SECTION_SLOT__-->\s*)+/g, "<!--__SECTIONS__-->");

    const orderedIds = (payload.sectionOrder || []).filter((id) =>
      sectionBlocks.has(id)
    );
    const orderedEntries = orderedIds.map((id, index) => {
      const num = String(index + 1).padStart(2, "0");
      let block = sectionBlocks.get(id);
      block = block.replace(
        /(<span class="section-num">)[\s\S]*?(<\/span>)/,
        `$1${num}$2`
      );
      return {
        id,
        num,
        title: sectionTitleForId(id, block),
        block,
      };
    });

    const assembledSections =
      (orderedEntries.length
        ? `${buildDocumentContentsHtml(orderedEntries)}\n`
        : "") + orderedEntries.map((entry) => entry.block).join("\n");

    if (html.includes("<!--__SECTIONS__-->")) {
      html = html.replace("<!--__SECTIONS__-->", assembledSections);
    } else if (assembledSections) {
      html = html.replace(
        /(<\/section>\s*)(<\/div>\s*<\/main>)/,
        `$1${assembledSections}\n      $2`
      );
    }

    // Inject editable placeholder content
    const ph = payload.placeholders || {};
    if (ph["executive-summary"] !== undefined) {
      html = html.replace(
        /(<section class="proposal-page" id="section-01">[\s\S]*?<div class="section-body">)[\s\S]*?(<\/div>\s*<\/section>)/,
        `$1\n          ${placeholderHtml(ph["executive-summary"])}\n        $2`
      );
    }
    if (ph["specific-client-experience"] !== undefined) {
      html = html.replace(
        /(<h3 id="specific-client-experience">Specific Client Experience<\/h3>\s*)<div class="placeholder-block"[\s\S]*?<\/div>/,
        `$1${placeholderHtml(ph["specific-client-experience"])}`
      );
    }
    if (ph["commercial-notes"] !== undefined) {
      html = html.replace(
        /(<section class="proposal-page" id="section-17">[\s\S]*?<div class="section-body">)/,
        `$1\n          <h3>Commercial Notes</h3>\n          ${placeholderHtml(ph["commercial-notes"])}\n`
      );
    }
    if (ph["case-studies"] !== undefined) {
      html = html.replace(
        /(<section class="proposal-page" id="section-18">[\s\S]*?<div class="section-body">)/,
        `$1\n          ${placeholderHtml(ph["case-studies"])}\n`
      );
    }
    if (ph["next-steps"] !== undefined) {
      html = html.replace(
        /(<section class="proposal-page" id="section-19">[\s\S]*?<div class="section-body">)/,
        `$1\n          ${placeholderHtml(ph["next-steps"])}\n`
      );
    }

    const themeCss = `
  <style id="rfp-client-theme">
    :root {
      --brand-green: ${payload.theme.primary} !important;
      --brand-lime: ${payload.theme.accent} !important;
    }
    .cover__client-logo {
      display: block;
      max-height: 3rem;
      width: auto;
      max-width: 12rem;
      object-fit: contain;
      background: #fff;
      border-radius: 0.4rem;
      padding: 0.35rem 0.55rem;
      margin: 0 auto 0.35rem;
    }
    .cover__brand { align-items: center !important; text-align: center !important; }
    .cover__logo { margin-left: auto; margin-right: auto; }
    .meta-label, .cover__tagline { color: ${payload.theme.secondary || payload.theme.primary} !important; }
    .badge {
      border-color: color-mix(in srgb, ${payload.theme.primary} 55%, transparent) !important;
      color: ${payload.theme.accent} !important;
      box-shadow: inset 3px 0 0 ${payload.theme.secondary || payload.theme.primary};
    }
    .section-num, .covers-table td:first-child { color: ${payload.theme.primary} !important; }
    #co-overview .co-tagline {
      font-family: var(--font-heading, Georgia, serif);
      font-size: 1.35rem;
      line-height: 1.35;
      margin: 0 0 0.65rem;
      color: var(--brand-navy, #13202e);
    }
    #co-overview .co-lead {
      font-size: 1.05rem;
      font-weight: 600;
      margin: 0 0 1rem;
    }
    #co-overview .co-bullets {
      margin: 0 0 1.1rem;
      padding-left: 1.25rem;
    }
    #co-overview .co-bullets li {
      margin: 0.35rem 0;
    }
    .placeholder-block.is-filled {
      border-style: solid;
      background: #fff;
    }
    ${
      isPreview
        ? `.rfp-preview-banner{position:sticky;top:0;z-index:99;background:#fff3cd;border-bottom:1px solid #ffe08a;color:#6b5300;padding:.65rem 1rem;text-align:center;font:600 .85rem Inter,system-ui,sans-serif}`
        : ""
    }
  </style>`;
    html = html.replace("</head>", `${themeCss}\n</head>`);
    if (isPreview) {
      html = html.replace(
        "<body>",
        `<body>\n  <div class="rfp-preview-banner">Draft preview — <strong>${escapeHtml(
          entity
        )}</strong> Company Overview · selected sections · theme · cover. Not final-committed yet.</div>`
      );
    }

    html = html.replace(
      /<title>[\s\S]*?<\/title>/,
      `<title>${escapeHtml(payload.meta.clientName || "Client")} — ${escapeHtml(
        documentType
      )} — ${escapeHtml(entity)}</title>`
    );

    // Consent line uses legal company; cover brand uses selected entity (Digital / BPO / GCC)
    html = html.replace(
      /Trilogy Digital \(Pty\) Ltd/g,
      legalEntityName(entity)
    );

    return html;
  }

  /** Extract colourful palette; skip near-black / near-white */
  function extractPaletteFromImage(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const w = (canvas.width = 96);
        const h = (canvas.height = 96);
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;
        const buckets = new Map();

        for (let i = 0; i < data.length; i += 16) {
          const a = data[i + 3];
          if (a < 200) continue;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const sat = max === 0 ? 0 : (max - min) / max;
          const light = (max + min) / 2 / 255;
          // Prefer chromatic colours (keeps yellow); drop B/W greys
          if (sat < 0.18) continue;
          if (light < 0.12 || light > 0.92) continue;
          const key = `${Math.round(r / 16) * 16},${Math.round(g / 16) * 16},${Math.round(b / 16) * 16}`;
          buckets.set(key, (buckets.get(key) || 0) + 1 + sat * 2);
        }

        const toHex = (rgb) =>
          "#" +
          rgb
            .split(",")
            .map((n) => Number(n).toString(16).padStart(2, "0"))
            .join("");

        const sorted = [...buckets.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([k]) => toHex(k));

        // Deduplicate near-duplicates
        const palette = [];
        for (const c of sorted) {
          if (palette.length >= 8) break;
          const tooClose = palette.some((p) => colorDistance(p, c) < 40);
          if (!tooClose) palette.push(c);
        }

        if (!palette.length) {
          resolve({
            palette: ensureWhiteInPalette([
              "#61d779",
              "#d5ec67",
              "#2f9e4a",
              "#e2b93b",
            ]),
            theme: {
              primary: "#61d779",
              accent: "#d5ec67",
              secondary: "#2f9e4a",
              navy: "#13202e",
            },
          });
          return;
        }

        resolve({
          palette: ensureWhiteInPalette(palette),
          theme: {
            primary: palette[0],
            accent: palette[1] || palette[0],
            secondary: palette[2] || palette[0],
            navy: "#13202e",
          },
        });
      };
      img.onerror = () =>
        resolve({
          palette: ensureWhiteInPalette([
            "#61d779",
            "#d5ec67",
            "#2f9e4a",
            "#e2b93b",
          ]),
          theme: {
            primary: "#61d779",
            accent: "#d5ec67",
            secondary: "#2f9e4a",
            navy: "#13202e",
          },
        });
      img.src = dataUrl;
    });
  }

  function colorDistance(a, b) {
    const pa = a.match(/\w\w/g).map((x) => parseInt(x, 16));
    const pb = b.match(/\w\w/g).map((x) => parseInt(x, 16));
    return Math.hypot(pa[0] - pb[0], pa[1] - pb[1], pa[2] - pb[2]);
  }

  async function openPreview() {
    const payload = draftPayload();
    if (!payload.meta.clientName) return toast("Enter a customer name first");
    if (!payload.sectionOrder.length) return toast("Add at least one section");
    try {
      toast("Building full draft preview…");
      const html = await assembleFullProposal(payload, { isPreview: true });
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener");
      setTimeout(() => URL.revokeObjectURL(url), 120_000);
      toast("Opened full draft preview");
    } catch (err) {
      console.error(err);
      toast("Preview failed — check console");
    }
  }

  // Events
  Object.values(els.fields).forEach((input) => {
    input.addEventListener("input", () => {
      state.status = "draft";
      updatePreview();
      autosaveLocal();
    });
  });
  document.querySelectorAll('input[name="entityName"]').forEach((r) => {
    r.addEventListener("change", () => {
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
      const extracted = await extractPaletteFromImage(state.logoDataUrl);
      state.palette = ensureWhiteInPalette(extracted.palette);
      state.theme = extracted.theme;
      state.selectedPaletteIndex = 0;
      state.status = "draft";
      applyTheme();
      renderOrder();
      autosaveLocal();
      toast(`Logo applied — ${state.palette.length} colours available (incl. white)`);
    };
    reader.readAsDataURL(file);
  });

  document.getElementById("btnRemoveLogo").addEventListener("click", () => {
    clearLogo();
  });

  document.getElementById("btnClearLocalDrafts").addEventListener("click", () => {
    if (!confirm("Clear all local drafts from this browser? SQL records are not deleted.")) return;
    clearLocalDrafts();
  });

  document.getElementById("btnNewDocument").addEventListener("click", () => {
    startNewDocument();
  });

  document.getElementById("btnPreviewDraft").addEventListener("click", () => openPreview());

  document.getElementById("btnExportDraft").addEventListener("click", () => {
    const payload = draftPayload();
    if (!payload.meta.clientName) return toast("Enter a customer name first");
    download(`${payload.slug}-draft.json`, JSON.stringify(payload, null, 2));
    toast("Draft JSON downloaded");
  });

  document.getElementById("btnSaveDraft").addEventListener("click", async () => {
    const payload = draftPayload();
    if (!payload.meta.clientName) return toast("Enter a customer name first");
    if (!payload.meta.documentType) return toast("Enter a document type first");
    payload.event = "saveDraft";
    autosaveLocal({ updateIndex: true });
    const res = await postWebhook(CONFIG.webhooks.saveDraft, payload);
    if (res.skipped) {
      download(`${payload.slug}-draft.json`, JSON.stringify(payload, null, 2));
      toast(`Draft saved — ${payload.paths.folder}`);
    } else if (res.ok) {
      toast(`Draft sent — ${payload.paths.folder}`);
    } else {
      toast(`Draft webhook failed (${res.status}) — kept local copy`);
    }
  });

  document.getElementById("btnFinalCommit").addEventListener("click", async () => {
    const payload = draftPayload();
    if (!payload.meta.clientName) return toast("Enter a customer name first");
    if (!payload.sectionOrder.length) return toast("Add at least one section");
    try {
      state.status = "committed";
      payload.status = "committed";
      payload.event = "finalCommit";
      payload.builtHtml = await assembleFullProposal(payload, { isPreview: false });
      autosaveLocal({ updateIndex: true });
      download(`${payload.slug}-index.html`, payload.builtHtml, "text/html");
      download(
        `${payload.slug}-draft.json`,
        JSON.stringify({ ...payload, builtHtml: undefined }, null, 2)
      );
      const res = await postWebhook(CONFIG.webhooks.finalCommit, payload);
      if (res.skipped) {
        toast(`Final HTML exported — ${payload.paths.folder}`);
      } else if (res.ok) {
        toast("Final commit sent to build flow");
      } else {
        toast(`Commit webhook failed (${res.status}) — files downloaded`);
      }
      updatePreview();
    } catch (err) {
      console.error(err);
      toast("Final commit build failed");
    }
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
      toast("Acceptance payload ready — configure DocuSign webhook next");
      download(
        `${payload.slug}-acceptance-request.json`,
        JSON.stringify(payload.acceptance, null, 2)
      );
    } else if (res.ok) {
      toast("DocuSign acceptance flow triggered");
    } else {
      toast(`Acceptance webhook failed (${res.status})`);
    }
  });

  els.existingSelect.addEventListener("change", () => {
    if (els.existingSelect.value) loadDraft(els.existingSelect.value);
  });

  fetch("sections.json")
    .then((r) => r.json())
    .then(async (data) => {
      state.catalog = data.sections || [];
      state.sectionOrder = [
        "section-01",
        "section-02",
        "section-03",
        "section-04",
        "section-05",
      ];
      try {
        await loadEntityContent();
      } catch (err) {
        console.warn(err);
      }
      renderAll();
      refreshExistingSelect();

      // Restore last working draft so hard refresh keeps saved section order
      try {
        const workingRaw = localStorage.getItem(CONFIG.storagePrefix + "working");
        if (workingRaw) {
          const working = JSON.parse(workingRaw);
          if (
            working?.slug &&
            localStorage.getItem(CONFIG.storagePrefix + working.slug)
          ) {
            els.existingSelect.value = working.slug;
            loadDraft(working.slug);
          }
        }
      } catch (err) {
        console.warn(err);
      }

      new Sortable(els.orderList, {
        group: "sections",
        animation: 150,
        onAdd: (evt) => {
          const id = evt.item.dataset.id;
          evt.item.remove();
          if (id && !state.sectionOrder.includes(id)) {
            state.sectionOrder.splice(evt.newIndex, 0, id);
            state.status = "draft";
            renderAll();
            autosaveLocal();
          } else {
            renderAll();
          }
        },
        onEnd: () => {
          state.sectionOrder = [...els.orderList.querySelectorAll(".order-item")].map(
            (li) => li.dataset.id
          );
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

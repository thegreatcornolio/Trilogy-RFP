(() => {
  const CONFIG = {
    storagePrefix: "trilogy-rfp-draft:",
    indexKey: "trilogy-rfp-index-v2",
    templateBase: "",
    entityContentUrl: "",
    webhooks: {
      saveDraft:
        "https://default77cde95f930f495e89c64d2c30f6df.21.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/12/workflows/12897ac2d1e94a149bd39340b39ac8c9/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=VqvO6vdmGXNlJj9PJIiu0J46H762ddWTxLEcL6Soa90",
      finalCommit:
        "https://default77cde95f930f495e89c64d2c30f6df.21.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/07/workflows/8db2801b2037475cb210d73b416f9682/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ZkC9WTB8WUx6tHfbihGbeb9Z-Y7Aup4-N2VAuuX5aTM",
      sendForAcceptance: "",
    },
    // Client-side gate only (static site) — change this PIN to restrict draft admin tools
    adminPin: "trilogy-admin",
    adminSessionKey: "trilogy-rfp-admin-unlocked",
    publishedKey: "trilogy-rfp-published-v1",
    pagesBase: "https://proposal.trilogybpo.com/",
  };

  // Resolve asset bases from the builder folder even when the URL has no trailing slash
  (function initPaths() {
    const href = window.location.href.split(/[?#]/)[0];
    const builderDir = href.replace(/\/index\.html$/i, "").replace(/\/?$/, "/");
    CONFIG.templateBase = new URL("../trilogydigital/", builderDir).href;
    CONFIG.entityContentUrl = new URL("entity-content.json", builderDir).href;
    CONFIG.publishedCatalogUrl = new URL("../proposals/catalog.json", builderDir).href;
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

  const DEFAULT_COMMERCIAL_ROWS = [
    { role: "Customer Service Agent", fte: 20, unit: "per FTE / month", rate: 750, model: "FTE", notes: "" },
    { role: "Senior / Specialist Agent", fte: 4, unit: "per FTE / month", rate: 900, model: "FTE", notes: "" },
    { role: "Quality Analyst", fte: 2, unit: "per FTE / month", rate: 1050, model: "FTE", notes: "1:20 QA ratio" },
    { role: "Team Leader", fte: 2, unit: "per FTE / month", rate: 1200, model: "FTE", notes: "1:12 span of control" },
  ];

  /** Short Exec Summary blurbs + cover lists used to prepopulate section-01 */
  const EXEC_SUMMARY_HIGHLIGHTS = {
    "section-02": {
      title: "Company Overview",
      intro:
        "We have included a Company Overview that introduces who Trilogy is, how we are structured as a South African CX partner, and the leadership experience behind our UK and US delivery.",
      covers: [
        "Company overview",
        "Meet the Team",
        "Our Awards, Certifications & Memberships",
        "South African Footprint",
        "Relevant UK & US Client Experience",
        "Management Journey & UK Client Experience",
        "Specific Client Experience",
        "Examples of Similar-Sized Operations",
        "Brands Our Leadership Has Delivered For",
      ],
    },
    "section-03": {
      title: "Operational Leadership & Delivery",
      intro:
        "We have included Operational Leadership & Delivery to show how accountable leadership, people strategy and culture translate into day-to-day performance.",
      covers: [
        "Leadership model",
        "Our People & Workforce",
        "Soul Impact Offering",
        "Culture and CRAFT",
      ],
    },
    "section-04": {
      title: "Our Value Proposition & Differentiators",
      intro:
        "We have included Our Value Proposition & Differentiators to set out why clients choose Trilogy and how we stand apart from traditional offshore providers.",
      covers: [
        "Our Secret Sauce",
        "Our Achievements",
        "How We Differ From Local Competitors",
        "Why Cape Town / Why South Africa",
      ],
    },
    "section-05": {
      title: "Service Offering",
      intro:
        "We have included our Service Offering so you can see the delivery paths available — BPO, GCC and AI-enabled support — and the service lines behind them.",
      covers: [
        "Outsourced Contact Centre — Trilogy BPO",
        "Capability Centres — Trilogy GCC",
        "AI Contact Centre Tools — Trilogy Ai",
        "Core Service Lines",
        "Tiered Tech Support SLAs",
        "Sector Delivery Experience",
      ],
    },
    "section-06": {
      title: "Global Capability Centres",
      intro:
        "We have included Global Capability Centres to explain our Design, Build, Innovate & Transfer (DBIT) path from outsourced delivery to a client-owned centre.",
      covers: [
        "The challenge with traditional BPO savings",
        "Flipping the incentive structure",
        "DBIT methodology",
        "Incubator roadmap",
        "Proven 36-month outcomes",
        "Flexible financial structures",
        "Risk mitigation",
      ],
    },
    "section-07": {
      title: "Trilogy Test Kitchen",
      intro:
        "We have included the Trilogy Test Kitchen to show how innovation is proven safely before it reaches live customer journeys.",
      covers: [
        "Why most innovation efforts stall",
        "The Test Kitchen difference",
        "Measurable technology outcomes",
        "Risk mitigation by design",
      ],
    },
    "section-08": {
      title: "Technology, AI & Automation Capability",
      intro:
        "We have included Technology, AI & Automation Capability to outline the platform stack, orchestration layer and AI tools that support efficient, resilient delivery.",
      covers: [
        "Technology Stack",
        "AI-Enabled Platforms",
        "Orchestration Layer",
        "Trilogy Ai",
        "Potential AI Savings",
        "CRM Integration",
        "Hosting & Resilience",
        "Cybersecurity & INFOSEC",
        "Typical Automation Levels",
      ],
    },
    "section-20": {
      title: "AI Sales Enablement",
      intro:
        "We have included AI Sales Enablement — Trilogy’s exclusive South Africa partnership with Visibilitie for AI-avatar acquisition, consented intent leads and real-time CRM delivery via Synapse™.",
      covers: [
        "Exclusive South Africa partnership",
        "Intent-based lead generation",
        "AI avatar acquisition",
        "Consented qualification",
        "Synapse™ CRM connection",
        "Performance optimisation",
        "Floor coaching and cold→hot transition",
      ],
    },
    "section-10": {
      title: "Management Information Systems (MIS)",
      intro:
        "We have included Management Information Systems to show how live, daily, weekly and monthly MI keeps performance visible and actionable.",
      covers: [
        "Analytics capabilities",
        "Real-Time (Live) Dashboard",
        "Daily MI Reporting",
        "Weekly MI Reporting",
        "Monthly Business Review (MBR)",
        "Reporting principles",
        "AI Insights under the Hood",
      ],
    },
    "section-11": {
      title: "Forecasting & Demand Management",
      intro:
        "We have included Forecasting & Demand Management to explain how workforce planning keeps staffing aligned to volume and service levels.",
      covers: [
        "WFM methodology",
        "System advantages & scalability",
        "Accuracy examples",
      ],
    },
    "section-12": {
      title: "Quality & Analytics",
      intro:
        "We have included Quality & Analytics to demonstrate how Genii interaction intelligence and continuous improvement protect customer experience.",
      covers: [
        "Workflow automation",
        "II-QA scoring methodology",
        "Genii Analytics",
        "Discover Audit",
        "Continuous improvement",
        "Customer experience programmes",
        "Operational insight & reporting",
      ],
    },
    "section-13": {
      title: "Compliance, Ethics & Risk",
      intro:
        "We have included Compliance, Ethics & Risk to confirm the accreditations, data protection and ethics standards that underpin delivery.",
      covers: [
        "Accreditations",
        "Data Protection & Residency",
        "Cross-Border Data Transfers",
        "Business Ethics & Anti-Corruption",
      ],
    },
    "section-14": {
      title: "Safety & Security",
      intro:
        "We have included Safety & Security to cover physical, personnel and information security controls across our sites.",
      covers: [
        "Security governance",
        "Physical & site security",
        "Personnel security",
        "Incident & investigation management",
        "Health, safety & risk management",
      ],
    },
    "section-15": {
      title: "Business Continuity & Disaster Recovery",
      intro:
        "We have included Business Continuity & Disaster Recovery to show how service resilience is planned, tested and maintained.",
      covers: [
        "Continuity planning",
        "Disaster recovery",
        "Resilience and failover",
      ],
    },
    "section-16": {
      title: "Transition & Implementation Methodology",
      intro:
        "We have included Transition & Implementation Methodology to set out how we mobilise safely — from scope and knowledge transfer through to go-live governance.",
      covers: [
        "Scope of services",
        "Transition & implementation",
        "Client pre-requisites",
        "Governance & meeting cadence",
        "Knowledge transfer",
        "Top transition risks & mitigations",
      ],
    },
    "section-17": {
      title: "Commercial Models & Pricing",
      intro:
        "We have included Commercial Models & Pricing to outline the commercial mechanisms available and, where completed, the proposed schedule for this opportunity.",
      covers: [
        "Pricing mechanisms",
        "Indicative monthly base FTE rates",
        "Proposed commercial schedule",
        "Commercial flexibility",
      ],
    },
    "section-18": {
      title: "Case Studies & References",
      intro:
        "We have included Case Studies & References so relevant proof points and client references can be tailored to this opportunity.",
      covers: ["Relevant case studies", "Reference clients"],
    },
    "section-19": {
      title: "Next Steps",
      intro:
        "We have included Next Steps to make the path from this proposal to discovery, commercial agreement and mobilisation clear.",
      covers: [
        "Confirm scope and volumes",
        "Discovery workshop",
        "Agree commercial model",
        "Progress to SOW",
      ],
    },
  };

  /** Curated pack for “Short Company Overview” proposal-from option */
  const SHORT_COMPANY_OVERVIEW_SECTIONS = [
    "section-01",
    "section-02",
    "section-03",
    "section-04",
    "section-05",
    "section-06",
    "section-08",
    "section-10",
    "section-11",
    "section-12",
    "section-17",
  ];

  const SHORT_EXEC_SUMMARY_HIGHLIGHTS = {
    "section-02": {
      title: "Company Overview",
      intro:
        "A concise introduction to Trilogy Digital — who we are, how we are structured, and the leadership experience behind UK and US delivery.",
      covers: [
        "Company overview",
        "Meet the Team",
        "Our Awards, Certifications & Memberships",
        "South African Footprint",
        "Management Journey & UK Client Experience",
        "Brands Our Leadership Has Delivered For",
      ],
    },
    "section-03": {
      title: "Our People & Workforce",
      intro:
        "How we attract, develop and look after people — the employee lifecycle, recruitment, EVP, wellbeing and CRAFT culture.",
      covers: [
        "Our People & Workforce",
        "Employee lifecycle & recruitment",
        "Employee Value Proposition",
        "Employee Wellbeing",
        "Our Culture — CRAFT",
      ],
    },
    "section-04": {
      title: "Our Value Proposition & Differentiators",
      intro:
        "Why clients choose Trilogy — secret sauce, achievements, competitor contrast, and Why Cape Town / Why South Africa.",
      covers: [
        "Value proposition overview",
        "Our Secret Sauce",
        "Our Achievements",
        "How We Differ From Local Competitors",
        "Why Cape Town / Why South Africa",
      ],
    },
    "section-05": {
      title: "Service Offering",
      intro:
        "The full delivery choice across outsourced BPO, capability centres and AI-enabled support.",
      covers: [
        "Trilogy BPO",
        "Trilogy GCC",
        "Trilogy Ai",
        "Core service lines",
        "SLAs and sector experience",
      ],
    },
    "section-06": {
      title: "Global Capability Centres",
      intro:
        "Our Design, Build, Innovate & Transfer path from outsourced delivery to a client-owned centre.",
      covers: [
        "DBIT methodology",
        "Incubator roadmap",
        "Proven outcomes",
        "Flexible financial structures",
      ],
    },
    "section-08": {
      title: "Technology, AI & Automation Capability",
      intro:
        "Human-led, AI-enhanced delivery — technology stack, orchestration, Trilogy Ai and the savings case.",
      covers: [
        "Introduction",
        "Technology Stack",
        "AI-Enabled Platforms",
        "Orchestration Layer",
        "Trilogy Ai",
        "Potential AI Savings",
      ],
    },
    "section-10": {
      title: "Management Information Systems (MIS)",
      intro:
        "How performance stays visible — analytics, the MI framework, live dashboards and AI Insights.",
      covers: [
        "Analytics Capabilities",
        "MI Reporting Framework",
        "Real-Time (Live) Dashboard",
        "AI Insights under the Hood",
      ],
    },
    "section-11": {
      title: "WFM Methodology",
      intro:
        "A continuous planning loop across workforce scheduling, intraday management and reporting.",
      covers: ["WFM Methodology"],
    },
    "section-12": {
      title: "Continuous Improvement",
      intro:
        "Genii-led improvement loops that turn interaction intelligence into action across CX and operations.",
      covers: [
        "Continuous Improvement",
        "Continuous Improvement Initiatives",
        "Customer Experience Programmes",
        "Operational Insight & Reporting",
      ],
    },
    "section-17": {
      title: "Commercial Models & Pricing",
      intro:
        "Commercial mechanisms and the proposed schedule for this opportunity.",
      covers: [
        "Pricing mechanisms",
        "Indicative rates",
        "Proposed commercial schedule",
        "Commercial flexibility",
      ],
    },
  };

  const DEFAULT_HOURS_PER_MONTH = 160;

  function emptyCommercialSchedule() {
    return {
      includeInProposal: true,
      currency: "GBP",
      hoursPerMonth: DEFAULT_HOURS_PER_MONTH,
      title: "Proposed Commercial Schedule",
      disclaimer:
        "Indicative rates for discussion. Final rates confirmed in the Statement of Work.",
      rows: [],
    };
  }

  function unitForModel(model) {
    switch (model) {
      case "Hour":
        return "per hour";
      case "Interaction":
        return "per interaction";
      case "Gain-share":
        return "gain-share / month";
      case "FTE":
      default:
        return "per FTE / month";
    }
  }

  const state = {
    catalog: [],
    sectionOrder: [],
    placeholders: {},
    execSummaryAutoText: "",
    commercialSchedule: emptyCommercialSchedule(),
    entityContent: ENTITY_CONTENT_FALLBACK,
    theme: {
      primary: "#61d779",
      accent: "#d5ec67",
      secondary: "#2f9e4a",
      navy: "#13202e",
    },
    palette: ["#61d779", "#d5ec67", "#2f9e4a", "#13202e", "#ffffff"],
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
    commercialBlock: document.getElementById("commercialScheduleBlock"),
    commercialEditor: document.getElementById("commercialEditor"),
    commercialLocked: document.getElementById("commercialLocked"),
    commercialReadonly: document.getElementById("commercialReadonly"),
    commercialInclude: document.getElementById("commercialInclude"),
    commercialCurrency: document.getElementById("commercialCurrency"),
    commercialHoursPerMonth: document.getElementById("commercialHoursPerMonth"),
    commercialTitle: document.getElementById("commercialTitle"),
    commercialDisclaimer: document.getElementById("commercialDisclaimer"),
    commercialRows: document.getElementById("commercialRows"),
    commercialTotal: document.getElementById("commercialTotal"),
    commercialEmpty: document.getElementById("commercialEmpty"),
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
      commercialFolder: `${base}/commercial/`,
      costingJson: `${base}/commercial/costing.json`,
      costingCsv: `${base}/commercial/costing.csv`,
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

  function isShortCompanyOverview(entity = getEntityName()) {
    return entity === "Short Company Overview";
  }

  /** Brand / narrative entity — Short Company Overview always uses Trilogy Digital copy */
  function brandEntityName(entity = getEntityName()) {
    return isShortCompanyOverview(entity) ? "Trilogy Digital" : entity;
  }

  function setEntityName(value) {
    const allowed = new Set([
      "Trilogy Digital",
      "Trilogy BPO",
      "Trilogy GCC",
      "Short Company Overview",
    ]);
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
    const profile = getEntityName();
    const brand = brandEntityName(profile);
    if (hint) {
      hint.textContent = isShortCompanyOverview(profile)
        ? "Short Company Overview uses the Trilogy Digital narrative and a curated section pack."
        : `Company Overview uses the ${profile} narrative.`;
    }
    if (!body) return;
    const html = companyOverviewHtml(brand);
    body.innerHTML = html || "<p>No overview copy loaded.</p>";
  }

  function applyShortCompanyOverviewPreset() {
    state.sectionOrder = [...SHORT_COMPANY_OVERVIEW_SECTIONS];
    if (els.fields.documentType) {
      els.fields.documentType.value = "Short Company Overview";
    }
    if (els.fields.proposalTitle) {
      els.fields.proposalTitle.value = "Short Company Overview";
    }
    if (
      state.sectionOrder.includes("section-17") &&
      isAdminUnlocked() &&
      (!state.commercialSchedule.rows || !state.commercialSchedule.rows.length)
    ) {
      state.commercialSchedule.rows = DEFAULT_COMMERCIAL_ROWS.map((r) => ({ ...r }));
    }
    maybeRefreshExecutiveSummary({ force: true });
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

  function isNearNavy(hex) {
    const h = String(hex || "").toLowerCase();
    return h === "#13202e" || h === "#0e1b2a";
  }

  /** Always keep Trilogy greens, navy and white selectable — even with a client logo */
  const TRILOGY_BRAND_COLOURS = [
    "#61d779",
    "#d5ec67",
    "#2f9e4a",
    "#13202e",
    "#ffffff",
  ];

  function ensureBrandPalette(palette) {
    const list = Array.isArray(palette) ? [...palette] : [];
    const have = new Set(list.map((c) => String(c).toLowerCase()));
    TRILOGY_BRAND_COLOURS.forEach((c) => {
      if (!have.has(c.toLowerCase())) {
        list.push(c);
        have.add(c.toLowerCase());
      }
    });
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
    state.palette = ensureBrandPalette([]);
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
    state.palette = ensureBrandPalette(state.palette);

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
        const light = isNearWhite(c);
        const navy = isNearNavy(c);
        btn.type = "button";
        btn.className =
          "swatch" +
          (state.theme[key] === c ? " is-selected" : "") +
          (light ? " swatch--light" : "") +
          (navy ? " swatch--navy" : "");
        btn.style.background = c;
        btn.setAttribute("aria-label", `${label} ${c}`);
        btn.title = light
          ? `${label} · White`
          : navy
            ? `${label} · Trilogy navy`
            : label;
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
    els.pvEntity.textContent = brandEntityName(m.entityName);
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

  /** Drop retired template sections (e.g. People merged into Operational Leadership) */
  function pruneRetiredSections() {
    const retired = new Set(["section-09"]);
    const before = state.sectionOrder.length;
    state.sectionOrder = state.sectionOrder.filter((id) => !retired.has(id));
    return state.sectionOrder.length !== before;
  }

  function renderLibrary() {
    els.library.innerHTML = "";
    const allInLibraryOrder =
      state.catalog.length > 0 &&
      state.catalog.length === state.sectionOrder.length &&
      state.catalog.every((sec, i) => state.sectionOrder[i] === sec.id);
    const addAllBtn = document.getElementById("btnAddAllSections");
    if (addAllBtn) {
      addAllBtn.disabled = allInLibraryOrder;
      addAllBtn.textContent = allInLibraryOrder ? "All added" : "Add all";
    }
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

  /** Add every library section in catalog order (then trim from Proposal order). */
  function addAllSections() {
    if (!state.catalog.length) return;
    const allIds = state.catalog.map((sec) => sec.id);
    const alreadyComplete =
      allIds.length === state.sectionOrder.length &&
      allIds.every((id, i) => state.sectionOrder[i] === id);
    if (alreadyComplete) {
      toast("All sections already added in library order");
      return;
    }
    const hadCommercial = state.sectionOrder.includes("section-17");
    state.sectionOrder = [...allIds];
    if (
      !hadCommercial &&
      state.sectionOrder.includes("section-17") &&
      isAdminUnlocked() &&
      (!state.commercialSchedule.rows || !state.commercialSchedule.rows.length)
    ) {
      state.commercialSchedule.rows = DEFAULT_COMMERCIAL_ROWS.map((r) => ({ ...r }));
    }
    state.status = "draft";
    maybeRefreshExecutiveSummary();
    renderAll();
    autosaveLocal();
    toast("All sections added in library order — remove any you don’t need from Proposal order");
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
        state.status = "draft";
        maybeRefreshExecutiveSummary();
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


  function moneySymbol(currency) {
    return ({ GBP: "£", USD: "$", EUR: "€", ZAR: "R" }[currency] || `${currency} `);
  }

  function formatMoney(amount, currency) {
    const n = Number(amount);
    if (!Number.isFinite(n)) return "—";
    try {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: currency || "GBP",
        maximumFractionDigits: 0,
      }).format(n);
    } catch {
      return `${moneySymbol(currency)}${Math.round(n).toLocaleString("en-GB")}`;
    }
  }

  function scheduleHoursPerMonth(schedule) {
    const n = Number(schedule?.hoursPerMonth);
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_HOURS_PER_MONTH;
  }

  /** Model-aware monthly: FTE = qty×rate; Hour = qty×hours×rate; Interaction/Gain-share = qty×rate */
  function rowMonthly(row, schedule = state.commercialSchedule) {
    const qty = Number(row.fte) || 0;
    const rate = Number(row.rate) || 0;
    const model = row.model || "FTE";
    if (model === "Hour") {
      return qty * scheduleHoursPerMonth(schedule) * rate;
    }
    return qty * rate;
  }

  function normalizeCommercialSchedule(raw) {
    const base = emptyCommercialSchedule();
    if (!raw || typeof raw !== "object") return base;
    const hours = Number(raw.hoursPerMonth);
    return {
      includeInProposal: raw.includeInProposal !== false,
      currency: raw.currency || "GBP",
      hoursPerMonth:
        Number.isFinite(hours) && hours > 0 ? hours : DEFAULT_HOURS_PER_MONTH,
      title: raw.title || base.title,
      disclaimer: raw.disclaimer || base.disclaimer,
      rows: Array.isArray(raw.rows)
        ? raw.rows.map((r) => {
            const model = r.model || "FTE";
            return {
              role: r.role || "",
              fte: Number(r.fte) || 0,
              unit: r.unit || unitForModel(model),
              rate: Number(r.rate) || 0,
              model,
              notes: r.notes || "",
            };
          })
        : [],
    };
  }

  function costingExportPayload() {
    const s = state.commercialSchedule;
    return {
      version: 1,
      currency: s.currency,
      hoursPerMonth: scheduleHoursPerMonth(s),
      includeInProposal: s.includeInProposal,
      title: s.title,
      disclaimer: s.disclaimer,
      calcNotes: {
        FTE: "monthly = fte × rate (rate = monthly per FTE)",
        Hour: "monthly = fte × hoursPerMonth × rate (rate = hourly)",
        Interaction: "monthly = qty × rate (qty in fte field = interactions)",
        "Gain-share": "monthly = qty × rate (estimated monthly share)",
      },
      rows: s.rows.map((r) => ({
        ...r,
        monthly: rowMonthly(r, s),
      })),
      internal: {
        _comment:
          "Never render in the proposal. Keep build-up in costing.xlsx Internal tab.",
        marginPct: null,
        fxRate: null,
        loadedCostNotes: "",
      },
    };
  }

  function commercialScheduleHtml(schedule) {
    const s = normalizeCommercialSchedule(schedule);
    if (!s.includeInProposal || !s.rows.length) return "";
    const hours = scheduleHoursPerMonth(s);
    const hasHour = s.rows.some((r) => r.model === "Hour");
    const rows = s.rows
      .map((r) => {
        const monthly = rowMonthly(r, s);
        const unit = r.unit || unitForModel(r.model);
        return `<tr>
          <td>${escapeHtml(r.role || "—")}</td>
          <td>${Number(r.fte) || 0}</td>
          <td>${escapeHtml(unit)}</td>
          <td>${formatMoney(r.rate, s.currency)}</td>
          <td>${formatMoney(monthly, s.currency)}</td>
          <td>${escapeHtml(r.model || "")}</td>
          <td>${escapeHtml(r.notes || "")}</td>
        </tr>`;
      })
      .join("");
    const total = s.rows.reduce((sum, r) => sum + rowMonthly(r, s), 0);
    const hourNote = hasHour
      ? `<p class="commercial-schedule__note">Hour model assumes <strong>${hours}</strong> paid hours per FTE per month (Monthly = FTE × hours × hourly rate).</p>`
      : "";
    return `<div class="commercial-schedule" data-commercial-schedule>
  <h3>${escapeHtml(s.title)}</h3>
  <p class="commercial-schedule__disclaimer">${escapeHtml(s.disclaimer)}</p>
  ${hourNote}
  <div class="table-wrap">
    <table class="commercial-schedule__table">
      <thead>
        <tr>
          <th>Role</th>
          <th>FTE / Qty</th>
          <th>Unit</th>
          <th>Rate</th>
          <th>Monthly</th>
          <th>Model</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr class="commercial-schedule__total">
          <td colspan="4">Total monthly</td>
          <td>${formatMoney(total, s.currency)}</td>
          <td colspan="2"></td>
        </tr>
      </tfoot>
    </table>
  </div>
</div>`;
  }

  function syncCommercialFormFromState() {
    const s = state.commercialSchedule;
    if (els.commercialInclude) els.commercialInclude.checked = !!s.includeInProposal;
    if (els.commercialCurrency) els.commercialCurrency.value = s.currency || "GBP";
    if (els.commercialHoursPerMonth) {
      els.commercialHoursPerMonth.value = scheduleHoursPerMonth(s);
    }
    if (els.commercialTitle) els.commercialTitle.value = s.title || "";
    if (els.commercialDisclaimer) els.commercialDisclaimer.value = s.disclaimer || "";
  }

  function readCommercialFormMeta() {
    if (!els.commercialInclude) return;
    state.commercialSchedule.includeInProposal = !!els.commercialInclude.checked;
    state.commercialSchedule.currency = els.commercialCurrency?.value || "GBP";
    const hours = Number(els.commercialHoursPerMonth?.value);
    state.commercialSchedule.hoursPerMonth =
      Number.isFinite(hours) && hours > 0 ? hours : DEFAULT_HOURS_PER_MONTH;
    state.commercialSchedule.title =
      els.commercialTitle?.value.trim() || "Proposed Commercial Schedule";
    state.commercialSchedule.disclaimer =
      els.commercialDisclaimer?.value.trim() ||
      emptyCommercialSchedule().disclaimer;
  }

  function renderCommercialReadonly(rows, currency, schedule) {
    if (!els.commercialReadonly) return;
    if (!rows.length) {
      els.commercialReadonly.hidden = true;
      els.commercialReadonly.innerHTML = "";
      return;
    }
    const body = rows
      .map((r) => {
        const unit = r.unit || unitForModel(r.model);
        return `<tr>
          <td>${escapeHtml(r.role || "—")}</td>
          <td>${Number(r.fte) || 0}</td>
          <td>${escapeHtml(unit)}</td>
          <td>${formatMoney(r.rate, currency)}</td>
          <td>${formatMoney(rowMonthly(r, schedule), currency)}</td>
          <td>${escapeHtml(r.model || "")}</td>
        </tr>`;
      })
      .join("");
    const total = rows.reduce((sum, r) => sum + rowMonthly(r, schedule), 0);
    els.commercialReadonly.hidden = false;
    els.commercialReadonly.innerHTML = `<div class="table-wrap"><table class="commercial-editor__table commercial-editor__table--readonly">
      <thead><tr><th>Role</th><th>FTE / Qty</th><th>Unit</th><th>Rate</th><th>Monthly</th><th>Model</th></tr></thead>
      <tbody>${body}</tbody>
      <tfoot><tr><td colspan="4"><strong>Total monthly</strong></td><td>${formatMoney(total, currency)}</td><td></td></tr></tfoot>
    </table></div>`;
  }

  function renderCommercialSchedule() {
    const show = state.sectionOrder.includes("section-17");
    if (els.commercialBlock) els.commercialBlock.hidden = !show;
    if (!show) return;

    const unlocked = isAdminUnlocked();
    const schedule = state.commercialSchedule;
    const currency = schedule.currency || "GBP";
    const rows = schedule.rows || [];

    if (els.commercialInclude) els.commercialInclude.disabled = !unlocked;
    if (els.commercialLocked) els.commercialLocked.hidden = unlocked;
    if (els.commercialEditor) els.commercialEditor.hidden = !unlocked;

    if (!unlocked) {
      renderCommercialReadonly(rows, currency, schedule);
      return;
    }

    if (!els.commercialRows) return;
    syncCommercialFormFromState();
    if (els.commercialEmpty) els.commercialEmpty.hidden = rows.length > 0;
    els.commercialRows.innerHTML = "";

    rows.forEach((row, idx) => {
      const tr = document.createElement("tr");
      const rateStep = row.model === "Hour" || row.model === "Interaction" ? "0.01" : "10";
      tr.innerHTML = `
        <td class="col-role"><input data-field="role" data-idx="${idx}" type="text" value="${escapeHtml(row.role)}" placeholder="Role name"></td>
        <td><input data-field="fte" data-idx="${idx}" type="number" min="0" step="0.5" value="${Number(row.fte) || 0}"></td>
        <td class="col-unit"><input data-field="unit" data-idx="${idx}" type="text" value="${escapeHtml(row.unit || unitForModel(row.model))}" placeholder="${escapeHtml(unitForModel(row.model))}"></td>
        <td><input data-field="rate" data-idx="${idx}" type="number" min="0" step="${rateStep}" value="${Number(row.rate) || 0}"></td>
        <td class="col-monthly">${formatMoney(rowMonthly(row, schedule), currency)}</td>
        <td class="col-model">
          <select data-field="model" data-idx="${idx}">
            <option value="FTE"${row.model === "FTE" ? " selected" : ""}>FTE</option>
            <option value="Hour"${row.model === "Hour" ? " selected" : ""}>Hour</option>
            <option value="Interaction"${row.model === "Interaction" ? " selected" : ""}>Interaction</option>
            <option value="Gain-share"${row.model === "Gain-share" ? " selected" : ""}>Gain-share</option>
          </select>
        </td>
        <td class="col-notes"><input data-field="notes" data-idx="${idx}" type="text" value="${escapeHtml(row.notes)}" placeholder="Optional"></td>
        <td><button type="button" class="btn-row-remove" data-remove-row="${idx}" aria-label="Remove row" title="Remove row">×</button></td>`;
      els.commercialRows.appendChild(tr);
    });

    const total = rows.reduce((sum, r) => sum + rowMonthly(r, schedule), 0);
    if (els.commercialTotal) els.commercialTotal.textContent = formatMoney(total, currency);
  }

  function markCommercialDirty() {
    readCommercialFormMeta();
    state.status = "draft";
    renderCommercialSchedule();
    updatePreview();
    autosaveLocal();
  }

  function buildExecutiveSummaryFromSections(order = state.sectionOrder) {
    const map = isShortCompanyOverview()
      ? SHORT_EXEC_SUMMARY_HIGHLIGHTS
      : EXEC_SUMMARY_HIGHLIGHTS;
    const ids = (order || []).filter((id) => id !== "section-01" && map[id]);
    if (!ids.length) {
      return "<p>Add proposal sections in the builder and this Executive Summary will prepopulate with a short highlight of what is included. You can edit this HTML freely.</p>";
    }
    const intro = isShortCompanyOverview()
      ? "<p>This <strong>Short Company Overview</strong> sets out the curated narrative for this opportunity — who Trilogy Digital is, how we deliver, and the commercial model proposed.</p>"
      : "<p>This Executive Summary highlights the sections included in this proposal.</p>";
    const blocks = ids.map((id) => {
      const item = map[id];
      const covers = escapeHtml((item.covers || []).join(", "));
      return `<h3>${escapeHtml(item.title)}</h3>
<p>${escapeHtml(item.intro)}</p>
<p><strong>It covers:</strong> ${covers}.</p>`;
    });
    return [intro, ...blocks].join("\n");
  }

  function maybeRefreshExecutiveSummary({ force = false } = {}) {
    if (!state.sectionOrder.includes("section-01")) return false;
    const next = buildExecutiveSummaryFromSections(state.sectionOrder);
    const key = "executive-summary";
    const current = state.placeholders[key] || "";
    const canOverwrite =
      force ||
      !current.trim() ||
      current === state.execSummaryAutoText;
    if (!canOverwrite) return false;
    state.placeholders[key] = next;
    state.execSummaryAutoText = next;
    return true;
  }

  function renderPlaceholders() {
    maybeRefreshExecutiveSummary();

    const editable = state.sectionOrder
      .map(sectionById)
      .filter((s) => s && s.editable && s.placeholderKey)
      .filter((s) => {
        // Short pack removes Specific Client Experience entirely
        if (
          isShortCompanyOverview() &&
          s.placeholderKey === "specific-client-experience"
        ) {
          return false;
        }
        return true;
      });

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
      const isExec = key === "executive-summary";
      const rebuildBtn = isExec
        ? `<button type="button" class="btn btn--ghost btn--small" data-rebuild-exec>Rebuild from sections</button>`
        : "";
      const execHint = isExec
        ? `<p class="hint placeholder-card__hint">HTML supported — use <code>&lt;h3&gt;</code>, <code>&lt;p&gt;</code>, <code>&lt;strong&gt;</code>, lists, etc. Rebuild only overwrites when you click the button (or when the text still matches the last auto draft).</p>`
        : "";
      card.innerHTML = `<div class="placeholder-card__head"><h3>${
        sec.placeholderLabel || sec.title
      }${isExec ? ' <span class="pill pill--html">HTML</span>' : ""}</h3>${rebuildBtn}</div>
        ${execHint}
        <p class="empty-hint">${value ? "" : "Content placeholder"}</p>
        <textarea data-key="${key}" class="${isExec ? "is-html" : ""}" rows="${
        isExec ? 18 : 6
      }" spellcheck="${isExec ? "false" : "true"}" placeholder="${
        isExec
          ? "HTML e.g. <h3>Company Overview</h3><p>…</p>"
          : `Type ${sec.placeholderLabel || sec.title} content…`
      }">${escapeHtml(value)}</textarea>`;
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
      card.querySelector("[data-rebuild-exec]")?.addEventListener("click", () => {
        maybeRefreshExecutiveSummary({ force: true });
        state.status = "draft";
        renderPlaceholders();
        updatePreview();
        autosaveLocal();
        toast("Executive Summary rebuilt from selected sections");
      });
      els.placeholders.appendChild(card);
    });
  }

  function renderAll() {
    renderLibrary();
    renderOrder();
    renderPlaceholders();
    renderCommercialSchedule();
    updatePreview();
    applyTheme();
  }

  function addSection(id) {
    if (state.sectionOrder.includes(id)) return;
    state.sectionOrder.push(id);
    if (
      id === "section-17" &&
      isAdminUnlocked() &&
      (!state.commercialSchedule.rows || !state.commercialSchedule.rows.length)
    ) {
      state.commercialSchedule.rows = DEFAULT_COMMERCIAL_ROWS.map((r) => ({ ...r }));
    }
    state.status = "draft";
    maybeRefreshExecutiveSummary();
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

  function publicUrlForFolder(folder) {
    const path = String(folder || "").replace(/^\/+/, "");
    return `${CONFIG.pagesBase}${path}`;
  }

  function getLocalPublished() {
    try {
      return JSON.parse(localStorage.getItem(CONFIG.publishedKey) || "[]");
    } catch {
      return [];
    }
  }

  function setLocalPublished(list) {
    localStorage.setItem(CONFIG.publishedKey, JSON.stringify(list || []));
  }

  function rememberPublished(entry) {
    if (!entry?.slug || !entry?.url) return;
    const next = getLocalPublished().filter((x) => x.slug !== entry.slug);
    next.unshift({
      slug: entry.slug,
      clientSlug: entry.clientSlug || "",
      docSlug: entry.docSlug || "",
      clientName: entry.clientName || entry.slug,
      documentType: entry.documentType || "Document",
      folder: entry.folder || "",
      url: entry.url,
      committedAt: entry.committedAt || new Date().toISOString(),
    });
    setLocalPublished(next);
  }

  function mergePublishedLists(remoteItems, localItems) {
    const map = new Map();
    [...(remoteItems || []), ...(localItems || [])].forEach((item) => {
      if (!item?.slug) return;
      const prev = map.get(item.slug);
      if (!prev) {
        map.set(item.slug, item);
        return;
      }
      const prevTime = Date.parse(prev.committedAt || prev.updatedAt || 0) || 0;
      const nextTime = Date.parse(item.committedAt || item.updatedAt || 0) || 0;
      if (nextTime >= prevTime) map.set(item.slug, { ...prev, ...item });
    });
    return [...map.values()].sort((a, b) => {
      const at = Date.parse(a.committedAt || a.updatedAt || 0) || 0;
      const bt = Date.parse(b.committedAt || b.updatedAt || 0) || 0;
      return bt - at;
    });
  }

  async function loadRemotePublishedCatalog() {
    try {
      const res = await fetch(`${CONFIG.publishedCatalogUrl}?v=${Date.now()}`, {
        cache: "no-store",
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data?.items) ? data.items : [];
    } catch {
      return [];
    }
  }

  async function renderPublishedList() {
    const host = document.getElementById("publishedList");
    if (!host) return;
    const remote = await loadRemotePublishedCatalog();
    const localCommitted = getIndex()
      .filter((item) => item.status === "committed")
      .map((item) => {
        const folder =
          item.folder ||
          `proposals/${item.clientSlug || "customer"}/${item.docSlug || "document"}/`;
        return {
          slug: item.slug,
          clientSlug: item.clientSlug,
          docSlug: item.docSlug,
          clientName: item.clientName,
          documentType: item.documentType,
          folder,
          url: item.publicUrl || publicUrlForFolder(folder),
          committedAt: item.committedAt || item.updatedAt,
        };
      });
    const items = mergePublishedLists(remote, [
      ...getLocalPublished(),
      ...localCommitted,
    ]);

    if (!items.length) {
      host.innerHTML =
        '<p class="hint">No published proposals yet. Use <strong>Final commit</strong> to publish one.</p>';
      return;
    }

    host.innerHTML = items
      .map((item) => {
        const when = item.committedAt
          ? new Date(item.committedAt).toLocaleString()
          : "—";
        const hasLocal = !!localStorage.getItem(CONFIG.storagePrefix + item.slug);
        return `<article class="published-item" data-slug="${escapeHtml(item.slug)}">
          <div>
            <strong>${escapeHtml(item.clientName || item.slug)}</strong>
            <span>${escapeHtml(item.documentType || "Document")}</span>
            <a class="published-item__url" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">${escapeHtml(item.url)}</a>
            <span class="published-item__meta">Committed ${escapeHtml(when)}</span>
          </div>
          <div class="published-item__actions">
            <a class="btn btn--primary btn--small" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">Open</a>
            ${
              hasLocal
                ? `<button type="button" class="btn btn--ghost btn--small" data-open-published="${escapeHtml(item.slug)}">Open draft</button>`
                : ""
            }
          </div>
        </article>`;
      })
      .join("");
  }

  function draftPayload() {
    const meta = readMeta();
    const paths = customerPaths(meta);
    return {
      version: 4,
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
      execSummaryAutoText: state.execSummaryAutoText || "",
      commercialSchedule: normalizeCommercialSchedule(state.commercialSchedule),
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
        folder: payload.paths.folder,
        publicUrl: publicUrlForFolder(payload.paths.folder),
        updatedAt: payload.updatedAt,
        committedAt: payload.committedAt,
        status: payload.status,
      });
      setIndex(idx);
      refreshExistingSelect();
      els.existingSelect.value = payload.slug;
      if (payload.status === "committed") {
        rememberPublished({
          slug: payload.slug,
          clientSlug: payload.clientSlug,
          docSlug: payload.docSlug,
          clientName: meta.clientName,
          documentType: meta.documentType,
          folder: payload.paths.folder,
          url: publicUrlForFolder(payload.paths.folder),
          committedAt: payload.committedAt || payload.updatedAt,
        });
        renderPublishedList();
      }
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

  function deleteLocalDraft(slug) {
    if (!slug) return;
    localStorage.removeItem(CONFIG.storagePrefix + slug);
    const next = getIndex().filter((item) => item.slug !== slug);
    setIndex(next);
    if (els.existingSelect.value === slug) els.existingSelect.value = "";
    const workingRaw = localStorage.getItem(CONFIG.storagePrefix + "working");
    if (workingRaw) {
      try {
        const working = JSON.parse(workingRaw);
        if (working.slug === slug) localStorage.removeItem(CONFIG.storagePrefix + "working");
      } catch {
        /* ignore */
      }
    }
    refreshExistingSelect();
    toast(`Removed local draft: ${slug}`);
  }

  function isAdminUnlocked() {
    try {
      return sessionStorage.getItem(CONFIG.adminSessionKey) === "1";
    } catch {
      return false;
    }
  }

  function setAdminUnlocked(on) {
    try {
      if (on) sessionStorage.setItem(CONFIG.adminSessionKey, "1");
      else sessionStorage.removeItem(CONFIG.adminSessionKey);
    } catch {
      /* ignore */
    }
  }

  function renderAdminDraftList() {
    const listEl = document.getElementById("adminDraftList");
    const countEl = document.getElementById("adminDraftCount");
    if (!listEl || !countEl) return;
    const index = getIndex();
    countEl.textContent = `${index.length} local draft${index.length === 1 ? "" : "s"}`;
    if (!index.length) {
      listEl.innerHTML = '<p class="admin-empty">No local drafts in this browser.</p>';
      return;
    }
    listEl.innerHTML = index
      .map((item) => {
        const doc = item.documentType || "Document";
        const when = item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "—";
        return `<article class="admin-draft" data-slug="${item.slug}">
          <div>
            <strong>${escapeHtml(item.clientName || item.slug)}</strong>
            <span>${escapeHtml(doc)} · ${escapeHtml(item.status || "draft")}</span>
            <span class="admin-draft__meta">${escapeHtml(item.slug)} · updated ${escapeHtml(when)}</span>
          </div>
          <button type="button" class="btn btn--danger-ghost" data-delete-draft="${escapeHtml(item.slug)}">Delete</button>
        </article>`;
      })
      .join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function syncAdminModal() {
    const lock = document.getElementById("adminLock");
    const body = document.getElementById("adminBody");
    const unlocked = isAdminUnlocked();
    if (lock) lock.hidden = unlocked;
    if (body) body.hidden = !unlocked;
    if (unlocked) {
      renderAdminDraftList();
      const clearInput = document.getElementById("adminClearConfirm");
      const clearBtn = document.getElementById("btnAdminClearAll");
      if (clearInput) clearInput.value = "";
      if (clearBtn) clearBtn.disabled = true;
    }
    // Commercial schedule edit rights follow admin unlock
    renderCommercialSchedule();
    updatePreview();
  }

  function openAdminModal() {
    const modal = document.getElementById("adminModal");
    if (!modal) return;
    modal.hidden = false;
    syncAdminModal();
    if (!isAdminUnlocked()) {
      const pin = document.getElementById("adminPinInput");
      if (pin) {
        pin.value = "";
        pin.focus();
      }
    }
  }

  function closeAdminModal() {
    const modal = document.getElementById("adminModal");
    if (modal) modal.hidden = true;
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
    pruneRetiredSections();
    state.placeholders = d.placeholders || {};
    state.execSummaryAutoText = d.execSummaryAutoText || "";
    state.commercialSchedule = normalizeCommercialSchedule(d.commercialSchedule);
    state.theme = {
      primary: "#61d779",
      accent: "#d5ec67",
      secondary: "#2f9e4a",
      navy: "#13202e",
      ...(d.theme || {}),
    };
    state.palette = ensureBrandPalette(
      d.palette && d.palette.length
        ? d.palette
        : [state.theme.primary, state.theme.accent, state.theme.secondary]
    );
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
    state.execSummaryAutoText = "";
    state.commercialSchedule = emptyCommercialSchedule();
    state.sectionOrder = [
      "section-01",
      "section-02",
      "section-03",
      "section-04",
      "section-05",
    ];
    maybeRefreshExecutiveSummary({ force: true });
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
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { ok: res.ok, status: res.status, data };
  }

  function download(filename, text, type = "application/json") {
    const blob = new Blob([text], { type });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function looksLikeHtml(text) {
    return /<\/?[a-z][\s\S]*>/i.test(String(text || ""));
  }

  function sanitizeBasicHtml(html) {
    const doc = new DOMParser().parseFromString(
      `<div id="__sanitize_root__">${html}</div>`,
      "text/html"
    );
    const root = doc.getElementById("__sanitize_root__");
    if (!root) return "";
    const allowed = new Set([
      "P",
      "BR",
      "STRONG",
      "B",
      "EM",
      "I",
      "U",
      "H2",
      "H3",
      "H4",
      "UL",
      "OL",
      "LI",
      "A",
      "SPAN",
      "DIV",
    ]);
    const walk = (node) => {
      [...node.children].forEach((child) => {
        if (!allowed.has(child.tagName)) {
          const textNode = doc.createTextNode(child.textContent || "");
          child.replaceWith(textNode);
          return;
        }
        if (child.tagName === "A") {
          const href = child.getAttribute("href") || "";
          [...child.attributes].forEach((attr) => child.removeAttribute(attr.name));
          if (/^(https?:|mailto:|#)/i.test(href)) child.setAttribute("href", href);
        } else {
          [...child.attributes].forEach((attr) => {
            if (attr.name === "id" || attr.name === "class") return;
            child.removeAttribute(attr.name);
          });
        }
        walk(child);
      });
    };
    walk(root);
    return root.innerHTML;
  }

  function placeholderHtml(text) {
    if (!text || !String(text).trim()) {
      return `<div class="placeholder-block"><p class="placeholder-label">Content placeholder</p></div>`;
    }
    if (looksLikeHtml(text)) {
      return `<div class="placeholder-block is-filled"><div class="prose">${sanitizeBasicHtml(
        text
      )}</div></div>`;
    }
    const paragraphs = String(text)
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
      .join("");
    return `<div class="placeholder-block is-filled"><div class="prose">${paragraphs}</div></div>`;
  }

  function parseSectionFragment(blockHtml) {
    const doc = new DOMParser().parseFromString(blockHtml, "text/html");
    return doc.body.firstElementChild || doc.body;
  }

  function headingLevel(el) {
    const m = /^H([1-6])$/.exec(el?.tagName || "");
    return m ? Number(m[1]) : 99;
  }

  /** Remove a heading and following siblings until a heading of same/higher level */
  function removeHeadingSubtree(startEl) {
    if (!startEl) return;
    const level = headingLevel(startEl);
    let node = startEl;
    while (node) {
      const next = node.nextElementSibling;
      const nextLevel = headingLevel(next);
      node.remove();
      if (next && nextLevel <= level) break;
      node = next;
    }
  }

  function removeFromElementUntil(startEl, stopFn) {
    if (!startEl) return;
    let node = startEl;
    while (node) {
      const next = node.nextElementSibling;
      if (next && stopFn(next)) {
        node.remove();
        break;
      }
      node.remove();
      node = next;
    }
  }

  function removeHeadingBlockById(root, id) {
    const el = root.querySelector(`#${CSS.escape(id)}`);
    if (!el) return;
    removeHeadingSubtree(el);
  }

  function findHeadingByText(root, title, tagName = "h3") {
    const normalize = (s) =>
      String(s || "")
        .replace(/[\u2013\u2014]/g, "-")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
    const target = normalize(title);
    return [...root.querySelectorAll(tagName)].find(
      (h) => normalize(h.textContent) === target
    );
  }

  function removeHeadingBlockByText(root, title, tagName = "h3") {
    const el = findHeadingByText(root, title, tagName);
    if (!el) return;
    removeHeadingSubtree(el);
  }

  function removeElementById(root, id) {
    root.querySelector(`#${CSS.escape(id)}`)?.remove();
  }

  function pruneCoversTable(root, coversId, removeHrefs) {
    const box = root.querySelector(`#${CSS.escape(coversId)}`);
    if (!box) return;
    const drop = new Set(
      (removeHrefs || []).map((h) => (h.startsWith("#") ? h : `#${h}`))
    );
    box.querySelectorAll("tbody tr").forEach((tr) => {
      const href = tr.querySelector("a[href]")?.getAttribute("href") || "";
      if (drop.has(href)) tr.remove();
    });
    [...box.querySelectorAll("tbody tr")].forEach((tr, i) => {
      const numCell = tr.querySelector("td");
      if (numCell) numCell.textContent = String(i + 1);
    });
  }

  function keepFromIdThroughEnd(root, startId) {
    const body = root.querySelector(".section-body") || root;
    const start = body.querySelector(`#${CSS.escape(startId)}`);
    if (!start) return;
    [...body.children].forEach((child) => {
      if (child === start || child.contains(start)) return;
      if (
        child.compareDocumentPosition(start) & Node.DOCUMENT_POSITION_FOLLOWING
      ) {
        child.remove();
      }
    });
  }

  function removeFromIdToEnd(root, id) {
    const el = root.querySelector(`#${CSS.escape(id)}`);
    if (!el) return;
    let node = el;
    while (node) {
      const next = node.nextElementSibling;
      node.remove();
      node = next;
    }
  }

  function promoteHeading(el, tagName) {
    if (!el || el.tagName.toLowerCase() === tagName.toLowerCase()) return el;
    const next = el.ownerDocument.createElement(tagName);
    [...el.attributes].forEach((attr) => next.setAttribute(attr.name, attr.value));
    next.innerHTML = el.innerHTML;
    el.replaceWith(next);
    return next;
  }

  /** Trim master section HTML to the Short Company Overview content pack */
  function applyShortOverviewSectionFilter(id, blockHtml) {
    const root = parseSectionFragment(blockHtml);
    if (!root) return blockHtml;

    if (id === "section-02") {
      removeHeadingBlockById(root, "uk-us-experience");
      removeHeadingBlockById(root, "specific-client-experience");
      removeHeadingBlockById(root, "similar-operations");
      pruneCoversTable(root, "covers", [
        "#uk-us-experience",
        "#specific-client-experience",
        "#similar-operations",
      ]);
    }

    if (id === "section-03") {
      removeElementById(root, "ops-covers");
      removeElementById(root, "ops-leadership-model");
      keepFromIdThroughEnd(root, "our-people-workforce");
      [
        "agent-profile",
        "training-management-structure",
        "uk-cultural-immersion",
        "tenure-attrition",
        "attraction-retention",
        "trilogy-leadership-pathway",
      ].forEach((hid) => removeHeadingBlockById(root, hid));
      removeFromIdToEnd(root, "adapting-to-your-culture");
    }

    if (id === "section-04") {
      // Why Cape Town / Why South Africa becomes a main heading; SA / Cape Town stay subheads
      const why = root.querySelector("#why-cape-town-sa");
      if (why) promoteHeading(why, "h2");
    }

    if (id === "section-08") {
      const autonomous = findHeadingByText(
        root,
        "The AI proposition — Autonomous CX",
        "h4"
      );
      if (autonomous) {
        removeFromElementUntil(autonomous, (el) => /^H[23]$/.test(el.tagName));
      }
      removeHeadingBlockByText(
        root,
        "Additional Trilogy Ai point solutions",
        "h4"
      );
      [
        "tech-crm-integration",
        "tech-hosting-resilience",
        "tech-cybersecurity",
        "tech-automation-levels",
        "tech-platform-demo",
      ].forEach((hid) => removeHeadingBlockById(root, hid));
      pruneCoversTable(root, "tech-covers", [
        "#tech-crm-integration",
        "#tech-hosting-resilience",
        "#tech-cybersecurity",
        "#tech-automation-levels",
        "#tech-platform-demo",
      ]);
    }

    if (id === "section-10") {
      [
        "Daily MI Reporting",
        "Weekly MI Reporting",
        "Monthly Business Review (MBR)",
        "Our Reporting Principles",
      ].forEach((title) => removeHeadingBlockByText(root, title));
    }

    if (id === "section-11") {
      removeHeadingBlockByText(root, "System Advantages & Scalability");
      removeHeadingBlockByText(root, "Accuracy Examples");
      const title = root.querySelector(".section-head h2");
      if (title) title.innerHTML = "WFM Methodology";
    }

    if (id === "section-12") {
      // Drop II-QA / Genii / Discover content; Continuous Improvement becomes the section
      keepFromIdThroughEnd(root, "continuous-improvement");
      const title = root.querySelector(".section-head h2");
      if (title) title.innerHTML = "Continuous Improvement";
      const ci = root.querySelector("#continuous-improvement");
      if (ci) ci.remove();
    }

    return root.outerHTML;
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

    const profile = payload.meta.entityName || "Trilogy Digital";
    const entity = brandEntityName(profile);
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
    const shortPack = isShortCompanyOverview(profile);
    const orderedEntries = orderedIds.map((id, index) => {
      const num = String(index + 1).padStart(2, "0");
      let block = sectionBlocks.get(id);
      if (shortPack) {
        block = applyShortOverviewSectionFilter(id, block);
      }
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
    
    // Inject deal-specific commercial schedule table
    const scheduleHtml = commercialScheduleHtml(payload.commercialSchedule);
    if (scheduleHtml) {
      if (html.includes("<!--__COMMERCIAL_SCHEDULE__-->")) {
        html = html.replace(
          /<!--__COMMERCIAL_SCHEDULE__-->[\s\S]*?(?=<h3>Commercial Flexibility)/,
          `${scheduleHtml}\n`
        );
      } else {
        html = html.replace(
          /(<div class="commercial-schedule commercial-schedule--placeholder"[\s\S]*?<\/div>)/,
          scheduleHtml
        );
      }
    } else if (html.includes("<!--__COMMERCIAL_SCHEDULE__-->")) {
      // Hide placeholder when no schedule included
      html = html.replace(
        /<!--__COMMERCIAL_SCHEDULE__-->[\s\S]*?(?=<h3>Commercial Flexibility)/,
        ""
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
            palette: ensureBrandPalette([
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
          palette: ensureBrandPalette(palette),
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
          palette: ensureBrandPalette([
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
      if (isShortCompanyOverview()) {
        applyShortCompanyOverviewPreset();
        renderAll();
        toast("Short Company Overview pack loaded — trim commercials as needed");
      } else {
        renderEntityOverviewPreview();
        updatePreview();
      }
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
      try {
        const extracted = await extractPaletteFromImage(state.logoDataUrl);
        state.palette = ensureBrandPalette(extracted.palette);
        state.theme = extracted.theme;
        state.selectedPaletteIndex = 0;
        toast("Logo applied — pick Primary / Accent / Secondary from logo + Trilogy colours");
      } catch (err) {
        console.error(err);
        state.palette = ensureBrandPalette(state.palette);
        toast("Logo applied — colour extraction failed; Trilogy colours remain available");
      }
      state.status = "draft";
      applyTheme();
      renderOrder();
      updatePreview();
      autosaveLocal();
    };
    reader.readAsDataURL(file);
  });

  document.getElementById("btnRemoveLogo").addEventListener("click", () => {
    clearLogo();
  });

  document.getElementById("btnAdmin").addEventListener("click", () => openAdminModal());

  document.getElementById("adminModal").addEventListener("click", (e) => {
    if (e.target.closest("[data-admin-close]")) closeAdminModal();
    const del = e.target.closest("[data-delete-draft]");
    if (del) {
      if (!isAdminUnlocked()) return;
      const slug = del.getAttribute("data-delete-draft");
      if (!slug) return;
      if (!confirm(`Delete local draft “${slug}” from this browser only?\n\nSQL / committed files are not deleted.`)) return;
      deleteLocalDraft(slug);
      renderAdminDraftList();
    }
  });

  document.getElementById("btnAdminUnlock").addEventListener("click", () => {
    const pin = (document.getElementById("adminPinInput")?.value || "").trim();
    const hint = document.getElementById("adminLockHint");
    if (pin === CONFIG.adminPin) {
      setAdminUnlocked(true);
      if (hint) hint.hidden = true;
      syncAdminModal();
      toast("Admin unlocked for this browser session");
    } else {
      if (hint) hint.hidden = false;
    }
  });

  document.getElementById("adminPinInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("btnAdminUnlock").click();
  });

  document.getElementById("btnAdminLock").addEventListener("click", () => {
    setAdminUnlocked(false);
    syncAdminModal();
    toast("Admin locked");
  });

  document.getElementById("btnAdminRefresh").addEventListener("click", () => {
    if (!isAdminUnlocked()) return;
    renderAdminDraftList();
  });

  document.getElementById("adminClearConfirm").addEventListener("input", (e) => {
    const btn = document.getElementById("btnAdminClearAll");
    if (btn) btn.disabled = e.target.value.trim().toUpperCase() !== "CLEAR";
  });

  document.getElementById("btnAdminClearAll").addEventListener("click", () => {
    if (!isAdminUnlocked()) return;
    const typed = (document.getElementById("adminClearConfirm")?.value || "").trim().toUpperCase();
    if (typed !== "CLEAR") return toast("Type CLEAR to confirm");
    if (!confirm("Clear ALL local drafts from this browser?\n\nThis cannot be undone here. SQL records and committed proposal files are not deleted.")) return;
    clearLocalDrafts();
    renderAdminDraftList();
    const clearInput = document.getElementById("adminClearConfirm");
    const clearBtn = document.getElementById("btnAdminClearAll");
    if (clearInput) clearInput.value = "";
    if (clearBtn) clearBtn.disabled = true;
  });

  document.getElementById("btnNewDocument").addEventListener("click", () => {
    startNewDocument();
  });

  document.getElementById("btnAddAllSections")?.addEventListener("click", () => {
    addAllSections();
  });

  // Commercial schedule editor (admin-only)
  const requireCommercialAdmin = () => {
    if (isAdminUnlocked()) return true;
    toast("Unlock Admin to edit commercials");
    openAdminModal();
    return false;
  };

  const onCommercialMetaChange = () => {
    if (!isAdminUnlocked()) return;
    readCommercialFormMeta();
    state.status = "draft";
    updatePreview();
    autosaveLocal();
  };
  els.commercialInclude?.addEventListener("change", onCommercialMetaChange);
  els.commercialCurrency?.addEventListener("change", () => {
    onCommercialMetaChange();
    renderCommercialSchedule();
  });
  els.commercialHoursPerMonth?.addEventListener("input", () => {
    if (!isAdminUnlocked()) return;
    readCommercialFormMeta();
    state.status = "draft";
    // Recalc Hour-model monthlies when hours/month changes
    renderCommercialSchedule();
    updatePreview();
    autosaveLocal();
  });
  els.commercialTitle?.addEventListener("input", onCommercialMetaChange);
  els.commercialDisclaimer?.addEventListener("input", onCommercialMetaChange);

  document.getElementById("btnCommercialUnlock")?.addEventListener("click", () => {
    openAdminModal();
  });

  els.commercialRows?.addEventListener("input", (e) => {
    if (!isAdminUnlocked()) return;
    const el = e.target.closest("[data-field][data-idx]");
    if (!el) return;
    const idx = Number(el.getAttribute("data-idx"));
    const field = el.getAttribute("data-field");
    const row = state.commercialSchedule.rows[idx];
    if (!row) return;
    if (field === "fte" || field === "rate") row[field] = Number(el.value) || 0;
    else row[field] = el.value;
    state.status = "draft";
    // refresh monthly cell + total without full re-render (keeps focus)
    const tr = el.closest("tr");
    const monthlyCell = tr?.querySelector(".col-monthly");
    if (monthlyCell) {
      monthlyCell.textContent = formatMoney(
        rowMonthly(row),
        state.commercialSchedule.currency
      );
    }
    const total = state.commercialSchedule.rows.reduce(
      (sum, r) => sum + rowMonthly(r),
      0
    );
    if (els.commercialTotal) {
      els.commercialTotal.textContent = formatMoney(
        total,
        state.commercialSchedule.currency
      );
    }
    updatePreview();
    autosaveLocal();
  });
  els.commercialRows?.addEventListener("change", (e) => {
    if (!isAdminUnlocked()) return;
    const el = e.target.closest("select[data-field][data-idx]");
    if (!el) return;
    const idx = Number(el.getAttribute("data-idx"));
    const row = state.commercialSchedule.rows[idx];
    if (!row) return;
    row.model = el.value;
    row.unit = unitForModel(row.model);
    state.status = "draft";
    markCommercialDirty();
    toast(
      row.model === "Hour"
        ? `Hour model: monthly = FTE × ${scheduleHoursPerMonth(state.commercialSchedule)} hrs × hourly rate`
        : `${row.model} model: monthly = qty × rate`
    );
  });
  els.commercialRows?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-remove-row]");
    if (!btn) return;
    if (!requireCommercialAdmin()) return;
    const idx = Number(btn.getAttribute("data-remove-row"));
    state.commercialSchedule.rows.splice(idx, 1);
    markCommercialDirty();
  });

  document.getElementById("btnCommercialAddRow")?.addEventListener("click", () => {
    if (!requireCommercialAdmin()) return;
    state.commercialSchedule.rows.push({
      role: "",
      fte: 1,
      unit: unitForModel("FTE"),
      rate: 0,
      model: "FTE",
      notes: "",
    });
    markCommercialDirty();
  });
  document.getElementById("btnCommercialSeed")?.addEventListener("click", () => {
    if (!requireCommercialAdmin()) return;
    state.commercialSchedule.rows = DEFAULT_COMMERCIAL_ROWS.map((r) => ({ ...r }));
    markCommercialDirty();
    toast("Starter call-centre roles loaded");
  });
  document.getElementById("btnCommercialExport")?.addEventListener("click", () => {
    if (!requireCommercialAdmin()) return;
    readCommercialFormMeta();
    const payload = draftPayload();
    const name = payload.slug
      ? `${payload.slug}-costing.json`
      : "costing.json";
    download(name, JSON.stringify(costingExportPayload(), null, 2));
    toast(`Exported — place at ${payload.paths.costingJson || "commercial/costing.json"}`);
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

      const fallbackDownloads = () => {
        download(`${payload.slug}-index.html`, payload.builtHtml, "text/html");
        download(
          `${payload.slug}-draft.json`,
          JSON.stringify({ ...payload, builtHtml: undefined }, null, 2)
        );
        download(
          `${payload.slug}-costing.json`,
          JSON.stringify(costingExportPayload(), null, 2)
        );
      };

      const res = await postWebhook(CONFIG.webhooks.finalCommit, payload);
      if (res.skipped) {
        fallbackDownloads();
        toast(`Final HTML exported — ${payload.paths.folder}`);
      } else if (res.ok) {
        const liveUrl =
          res.data?.url ||
          `https://proposal.trilogybpo.com/${payload.paths.folder}`;
        rememberPublished({
          slug: payload.slug,
          clientSlug: payload.clientSlug,
          docSlug: payload.docSlug,
          clientName: payload.meta.clientName,
          documentType: payload.meta.documentType,
          folder: payload.paths.folder,
          url: liveUrl,
          committedAt: payload.committedAt || payload.updatedAt,
        });
        renderPublishedList();
        toast(`Final commit published — ${liveUrl}`);
      } else {
        fallbackDownloads();
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
      maybeRefreshExecutiveSummary({ force: true });
      try {
        await loadEntityContent();
      } catch (err) {
        console.warn(err);
      }
      renderAll();
      refreshExistingSelect();
      renderPublishedList();

      document.getElementById("btnRefreshPublished")?.addEventListener("click", () => {
        renderPublishedList();
        toast("Published list refreshed");
      });
      document.getElementById("publishedList")?.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-open-published]");
        if (!btn) return;
        const slug = btn.getAttribute("data-open-published");
        if (!slug) return;
        els.existingSelect.value = slug;
        loadDraft(slug);
      });

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
            maybeRefreshExecutiveSummary();
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
          maybeRefreshExecutiveSummary();
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

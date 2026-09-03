document.addEventListener("DOMContentLoaded", () => {
  const actions = {
    print: () => window.print(),
    pdf: () => window.print(),
    word: () => {
      alert("Export to Word is available in the live proposal editor. Use Print / PDF for a document copy from this static version.");
    },
    edit: () => {
      alert("Edit mode is available in the live proposal template. This static HTML recreation is view-only.");
    },
  };

  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-action");
      if (actions[key]) actions[key]();
    });
  });

  // Smooth in-page jumps for covers table
  document.querySelectorAll('.covers-table a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", id);
    });
  });

  // Awards timeline: staggered reveal + growing bullet line
  const timeline = document.querySelector('[data-animate="timeline"]');
  if (timeline && "IntersectionObserver" in window) {
    const items = [...timeline.querySelectorAll(".reveal-item")];
    const updateLine = () => {
      const visible = items.filter((el) => el.classList.contains("is-visible")).length;
      const pct = items.length ? (visible / items.length) * 100 : 0;
      timeline.style.setProperty("--line-progress", `${pct}%`);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const idx = items.indexOf(el);
          window.setTimeout(() => {
            el.classList.add("is-visible");
            updateLine();
          }, Math.max(0, idx) * 120);
          io.unobserve(el);
        });
      },
      { threshold: 0.35, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach((item) => io.observe(item));
  } else if (timeline) {
    timeline.querySelectorAll(".reveal-item").forEach((el) => el.classList.add("is-visible"));
    timeline.style.setProperty("--line-progress", "100%");
  }

  // GCC savings chart: animate bars rising from 0 → cumulative savings
  const gccCharts = document.querySelectorAll('[data-animate="gcc-savings"]');
  const animateGccChart = (chart) => {
    if (chart.dataset.animated === "1") return;
    chart.dataset.animated = "1";
    chart.classList.add("is-inview");

    const delays = [0.15, 0.33, 0.51, 0.69];
    chart.querySelectorAll(".gcc-savings__col").forEach((col) => {
      const step = Number(col.getAttribute("data-step") || 0);
      const delay = delays[step] || 0.15;
      col.querySelectorAll(".gcc-savings__bar, .gcc-savings__bar-inc").forEach((bar) => {
        const y = bar.getAttribute("data-y");
        const h = bar.getAttribute("data-h");
        bar.style.transitionDelay = `${delay}s`;
        // force layout then grow
        requestAnimationFrame(() => {
          bar.setAttribute("y", y);
          bar.setAttribute("height", h);
        });
      });
      const dot = col.querySelector(".gcc-savings__dot");
      if (dot) {
        dot.style.transitionDelay = `${delay + 0.4}s`;
        requestAnimationFrame(() => {
          dot.setAttribute("r", dot.getAttribute("data-r") || "5.5");
        });
      }
      const pct = col.querySelector(".gcc-savings__pct");
      if (pct) pct.style.transitionDelay = `${delay + 0.55}s`;
    });

    const total = chart.querySelector("[data-gcc-total]");
    const pill = chart.querySelector("[data-gcc-pill]");
    const from = chart.hasAttribute("data-gcc-from")
      ? Number(chart.getAttribute("data-gcc-from"))
      : 0;
    const to = chart.hasAttribute("data-gcc-to")
      ? Number(chart.getAttribute("data-gcc-to"))
      : 61;
    const pillTpl = chart.getAttribute("data-gcc-pill-template") || "+{v}% cumulative";
    const started = performance.now();
    const duration = 1200;
    const tick = (now) => {
      const t = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(from + (to - from) * eased);
      if (total) total.innerHTML = `${val}<span>%</span>`;
      if (pill) pill.textContent = pillTpl.replace(/\{v\}/g, String(val));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (gccCharts.length && "IntersectionObserver" in window) {
    const gccIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateGccChart(entry.target);
          gccIo.unobserve(entry.target);
        });
      },
      { threshold: 0.35, rootMargin: "0px 0px -6% 0px" }
    );
    gccCharts.forEach((chart) => gccIo.observe(chart));
    window.addEventListener("beforeprint", () => {
      gccCharts.forEach((chart) => animateGccChart(chart));
    });
  } else {
    gccCharts.forEach((chart) => {
      animateGccChart(chart);
    });
  }


  // Potential AI Savings dials: fill rings + count up on scroll
  const aiSavingsBlocks = document.querySelectorAll('[data-animate="ai-savings"]');
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const finishAiDial = (ring) => {
    const target = Number(ring.getAttribute("data-pct") || 0);
    ring.style.setProperty("--pct", `${target}%`);
    const valueEl = ring.querySelector(".dial__value");
    if (valueEl) valueEl.textContent = `${target}%`;
  };

  const animateAiSavings = (root) => {
    if (root.dataset.animated === "1") return;
    root.dataset.animated = "1";
    root.classList.add("is-inview");

    const rings = [...root.querySelectorAll(".dial__ring[data-pct]")];
    if (reduceMotion) {
      rings.forEach(finishAiDial);
      return;
    }

    rings.forEach((ring, index) => {
      const target = Number(ring.getAttribute("data-pct") || 0);
      const valueEl = ring.querySelector(".dial__value");
      const delay = index * 140;
      const duration = 1100;

      window.setTimeout(() => {
        const started = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - started) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          const current = target * eased;
          ring.style.setProperty("--pct", `${current.toFixed(1)}%`);
          if (valueEl) valueEl.textContent = `${Math.round(current)}%`;
          if (t < 1) requestAnimationFrame(tick);
          else finishAiDial(ring);
        };
        requestAnimationFrame(tick);
      }, delay);
    });
  };

  if (aiSavingsBlocks.length && "IntersectionObserver" in window) {
    const aiIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateAiSavings(entry.target);
          aiIo.unobserve(entry.target);
        });
      },
      { threshold: 0.35, rootMargin: "0px 0px -6% 0px" }
    );
    aiSavingsBlocks.forEach((block) => aiIo.observe(block));
    window.addEventListener("beforeprint", () => {
      aiSavingsBlocks.forEach((block) => animateAiSavings(block));
    });
  } else {
    aiSavingsBlocks.forEach((block) => animateAiSavings(block));
  }

  // Glossary A–Z letter index
  const glossary = document.querySelector("[data-glossary]");
  if (glossary) {
    const tabs = [...glossary.querySelectorAll(".glossary__letter")];
    const panels = [...glossary.querySelectorAll(".glossary__panel")];
    const activate = (letter) => {
      tabs.forEach((tab) => {
        const on = tab.dataset.letter === letter;
        tab.classList.toggle("is-active", on);
        tab.setAttribute("aria-selected", on ? "true" : "false");
      });
      panels.forEach((panel) => {
        const on = panel.dataset.panel === letter;
        panel.classList.toggle("is-active", on);
        if (on) panel.removeAttribute("hidden");
        else panel.setAttribute("hidden", "");
      });
    };
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        if (tab.disabled) return;
        activate(tab.dataset.letter);
      });
    });
  }


  // Executive Summary savings calculator (website model)
  const savingsCalc = document.querySelector("[data-savings-calc]");
  if (savingsCalc) {
    const seatsInput = savingsCalc.querySelector("[data-seats]");
    const costInput = savingsCalc.querySelector("[data-cost]");
    const seatsLabel = savingsCalc.querySelector("[data-seats-label]");
    const costLabel = savingsCalc.querySelector("[data-cost-label]");
    const ukValue = savingsCalc.querySelector("[data-uk-value]");
    const ukMeta = savingsCalc.querySelector("[data-uk-meta]");
    const bpoValue = savingsCalc.querySelector("[data-bpo-value]");
    const gccValue = savingsCalc.querySelector("[data-gcc-value]");
    const bpoBadge = savingsCalc.querySelector(".savings-calc__badge:not(.savings-calc__badge--lime)");
    const gccBadge = savingsCalc.querySelector(".savings-calc__badge--lime");
    const gbp = new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 0,
    });
    const formatK = (n) => `£${Math.round(n / 1000).toLocaleString("en-GB")}k`;

    const update = () => {
      const seats = Number(seatsInput.value) || 0;
      const cost = Number(costInput.value) || 0;
      const uk = seats * cost * 12;
      const bpo = uk * 0.5;
      const gcc = bpo * 0.75;
      const bpoSave = 50;
      const gccSave = uk ? Math.round((1 - gcc / uk) * 100) : 0;

      if (seatsLabel) seatsLabel.textContent = String(seats);
      if (costLabel) costLabel.textContent = gbp.format(cost);
      if (ukValue) ukValue.textContent = formatK(uk);
      if (ukMeta) ukMeta.textContent = `per year · ${seats} seats`;
      if (bpoValue) bpoValue.textContent = formatK(bpo);
      if (gccValue) gccValue.textContent = formatK(gcc);
      if (bpoBadge) bpoBadge.textContent = `Save ~${bpoSave}%`;
      if (gccBadge) gccBadge.textContent = `Save ~${gccSave}% total`;
    };

    seatsInput?.addEventListener("input", update);
    costInput?.addEventListener("input", update);
    update();
  }


  // AI Sales Enablement — cycle blue highlight across qualification pillars while in view
  const spotlightBlocks = document.querySelectorAll('[data-animate="pillar-spotlight"]');
  const reduceSpotlightMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const setSpotlightIndex = (root, index) => {
    const cards = root.querySelectorAll(":scope > .pillar");
    cards.forEach((card, i) => {
      card.classList.toggle("is-spotlight", i === index);
    });
    root.dataset.spotlightIndex = String(index);
  };

  const startSpotlight = (root) => {
    if (root._spotlightTimer || reduceSpotlightMotion) return;
    const cards = root.querySelectorAll(":scope > .pillar");
    if (!cards.length) return;
    let index = Number(root.dataset.spotlightIndex || 0);
    setSpotlightIndex(root, index);
    root._spotlightTimer = window.setInterval(() => {
      index = (index + 1) % cards.length;
      setSpotlightIndex(root, index);
    }, 1800);
  };

  const stopSpotlight = (root) => {
    if (!root._spotlightTimer) return;
    window.clearInterval(root._spotlightTimer);
    root._spotlightTimer = null;
  };

  if (spotlightBlocks.length) {
    spotlightBlocks.forEach((block) => setSpotlightIndex(block, 0));

    if (!reduceSpotlightMotion && "IntersectionObserver" in window) {
      const spotlightIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) startSpotlight(entry.target);
            else stopSpotlight(entry.target);
          });
        },
        { threshold: 0.35 }
      );
      spotlightBlocks.forEach((block) => spotlightIo.observe(block));
    }
  }



  // South African Footprint — animated map pin drops
  const saMaps = document.querySelectorAll('[data-animate="sa-pins"]');
  const reduceSaMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (saMaps.length) {
    const reveal = (el) => el.classList.add("is-visible");
    if (reduceSaMotion) {
      saMaps.forEach(reveal);
    } else if ("IntersectionObserver" in window) {
      const saIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            reveal(entry.target);
            saIo.unobserve(entry.target);
          });
        },
        { threshold: 0.3 }
      );
      saMaps.forEach((el) => saIo.observe(el));
    } else {
      saMaps.forEach(reveal);
    }
  }

});

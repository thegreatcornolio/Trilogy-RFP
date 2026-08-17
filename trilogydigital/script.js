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
    const target = 61;
    const started = performance.now();
    const duration = 1200;
    const tick = (now) => {
      const t = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(target * eased);
      if (total) total.innerHTML = `${val}<span>%</span>`;
      if (pill) pill.textContent = `+${val}% cumulative`;
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
});

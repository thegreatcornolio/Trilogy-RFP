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
});

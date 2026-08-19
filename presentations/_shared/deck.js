(function () {
  const STAGE_W = 1600;
  const STAGE_H = 900;
  const slides = Array.from(document.querySelectorAll(".slide"));
  if (!slides.length) return;

  const stage = document.querySelector("[data-stage]");
  const frame = document.querySelector("[data-frame]");
  const progressLabel = document.querySelector("[data-progress-label]");
  const progressBar = document.querySelector("[data-progress-bar]");
  const prevBtn = document.querySelector("[data-prev]");
  const nextBtn = document.querySelector("[data-next]");
  let index = 0;

  function parseHash() {
    const n = parseInt(location.hash.replace(/\D/g, ""), 10);
    if (!n) return 0;
    return Math.min(slides.length, Math.max(1, n)) - 1;
  }

  function fitStage() {
    if (!stage || !frame) return;
    const rect = frame.getBoundingClientRect();
    const scale = Math.min(rect.width / STAGE_W, rect.height / STAGE_H);
    stage.style.transform = "scale(" + Math.max(scale, 0.05) + ")";
  }

  function render() {
    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === index);
    });
    const current = index + 1;
    if (progressLabel) progressLabel.textContent = current + " / " + slides.length;
    if (progressBar) progressBar.style.width = (current / slides.length) * 100 + "%";
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === slides.length - 1;
  }

  function go(next, pushHash) {
    index = Math.max(0, Math.min(slides.length - 1, next));
    render();
    if (pushHash !== false) history.replaceState(null, "", "#" + (index + 1));
  }

  function resolveLogos() {
    document.querySelectorAll("img[data-logo]").forEach((img) => {
      const name = img.getAttribute("data-logo");
      const bases = (img.getAttribute("data-logo-bases") || "")
        .split(",")
        .map((s) => s.trim().replace(/\/$/, ""))
        .filter(Boolean);
      const exts = ["svg", "png", "webp", "jpg", "jpeg"];
      const candidates = [];
      bases.forEach((base) => {
        exts.forEach((ext) => candidates.push(base + "/" + name + "." + ext));
      });

      function miss() {
        img.classList.add("is-missing");
        const fallback = document.createElement("span");
        fallback.className = "logo-fallback";
        fallback.textContent = (img.alt || name) + " logo";
        img.replaceWith(fallback);
      }

      function tryAt(i) {
        if (i >= candidates.length) {
          miss();
          return;
        }
        const probe = new Image();
        probe.onload = function () {
          img.src = candidates[i];
          img.classList.add("is-loaded");
        };
        probe.onerror = function () {
          tryAt(i + 1);
        };
        probe.src = candidates[i];
      }

      tryAt(0);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
      event.preventDefault();
      go(index + 1);
    } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
      event.preventDefault();
      go(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      go(0);
    } else if (event.key === "End") {
      event.preventDefault();
      go(slides.length - 1);
    }
  });

  if (prevBtn) prevBtn.addEventListener("click", () => go(index - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => go(index + 1));
  window.addEventListener("hashchange", () => go(parseHash(), false));
  window.addEventListener("resize", fitStage);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitStage);
  }

  index = parseHash();
  resolveLogos();
  render();
  fitStage();
})();

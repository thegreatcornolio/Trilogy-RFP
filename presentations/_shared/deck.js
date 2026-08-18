(function () {
  const slides = Array.from(document.querySelectorAll(".slide"));
  if (!slides.length) return;

  const progressLabel = document.querySelector("[data-progress-label]");
  const progressBar = document.querySelector("[data-progress-bar]");
  const prevBtn = document.querySelector("[data-prev]");
  const nextBtn = document.querySelector("[data-next]");
  const hint = document.querySelector("[data-hint]");
  let index = 0;

  function parseHash() {
    const n = parseInt(location.hash.replace(/\D/g, ""), 10);
    if (!n) return 0;
    return Math.min(slides.length, Math.max(1, n)) - 1;
  }

  function hasBuild(slide) {
    return slide && slide.hasAttribute("data-build");
  }

  function isBuilt(slide) {
    return slide && slide.classList.contains("is-built");
  }

  function defaultHint() {
    return "Arrow keys or Space to advance";
  }

  function updateHint() {
    if (!hint) return;
    const slide = slides[index];
    if (hasBuild(slide) && !isBuilt(slide)) {
      hint.textContent = slide.getAttribute("data-build-hint") || "Click or Space to play animation";
    } else {
      hint.textContent = defaultHint();
    }
  }

  function render() {
    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === index);
    });
    const current = index + 1;
    if (progressLabel) progressLabel.textContent = current + " / " + slides.length;
    if (progressBar) progressBar.style.width = (current / slides.length) * 100 + "%";
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === slides.length - 1 && (!hasBuild(slides[index]) || isBuilt(slides[index]));
    updateHint();
  }

  function go(next, pushHash) {
    next = Math.max(0, Math.min(slides.length - 1, next));
    const current = slides[index];

    if (next > index && hasBuild(current) && !isBuilt(current)) {
      current.classList.add("is-built");
      render();
      return;
    }

    const prev = index;
    index = next;
    const slide = slides[index];
    if (hasBuild(slide)) {
      if (index < prev) slide.classList.add("is-built");
      else if (index > prev) slide.classList.remove("is-built");
    }
    render();
    if (pushHash !== false) history.replaceState(null, "", "#" + (index + 1));
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

  index = parseHash();
  render();
})();

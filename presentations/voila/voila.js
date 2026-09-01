(function () {
  function layoutVoilaOrbit(root) {
    root = root || document.querySelector(".slide.is-active .voila-process") || document.querySelector(".voila-process");
    if (!root) return;
    var isDeck = document.body.classList.contains("deck");
    if (!isDeck && window.matchMedia("(max-width: 900px)").matches) return;
    var path = root.querySelector("#voila-flow-path, .voila-process__circuit path");
    var nums = root.querySelectorAll(".voila-process__num");
    var loop = root.querySelector(".voila-process__loop");
    if (!path || nums.length < 2 || !loop) return;
    if (!root.offsetWidth) {
      setTimeout(function () { layoutVoilaOrbit(root); }, 40);
      return;
    }
    var box = root.getBoundingClientRect();
    if (!box.width) return;
    var scale = box.width / root.offsetWidth || 1;
    var first = nums[0].getBoundingClientRect();
    var last = nums[nums.length - 1].getBoundingClientRect();
    var loopBox = loop.getBoundingClientRect();
    var x1 = (first.left + first.width / 2 - box.left) / scale;
    var x2 = (last.left + last.width / 2 - box.left) / scale;
    var yTop = (first.top + first.height / 2 - box.top) / scale;
    var yLoopTop = (loopBox.top - box.top) / scale;
    var yBot = (loopBox.bottom - box.top) / scale - 1;
    var xLeft = (loopBox.left - box.left) / scale + 1;
    var xRight = (loopBox.right - box.left) / scale - 1;
    var r = 14;
    var d = [
      "M", x1, yTop,
      "L", x2, yTop,
      "L", x2, yLoopTop,
      "L", xRight, yLoopTop,
      "L", xRight, yBot - r,
      "Q", xRight, yBot, xRight - r, yBot,
      "L", xLeft + r, yBot,
      "Q", xLeft, yBot, xLeft, yBot - r,
      "L", xLeft, yLoopTop,
      "L", x1, yLoopTop,
      "Z"
    ].join(" ");
    path.setAttribute("d", d);
    var motion = root.querySelector("animateMotion");
    if (motion && motion.beginElement) {
      try { motion.beginElement(); } catch (e) {}
    }
  }

  function scheduleLayout() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        layoutVoilaOrbit();
      });
    });
  }

  window.layoutVoilaOrbit = layoutVoilaOrbit;
  scheduleLayout();
  window.addEventListener("resize", scheduleLayout);
  window.addEventListener("load", scheduleLayout);
  window.addEventListener("hashchange", scheduleLayout);
  document.addEventListener("click", function (event) {
    if (event.target.closest("[data-prev], [data-next]")) scheduleLayout();
  });
  document.addEventListener("keydown", scheduleLayout);

  var slides = document.querySelectorAll(".slide");
  if (slides.length && "MutationObserver" in window) {
    var observer = new MutationObserver(scheduleLayout);
    slides.forEach(function (slide) {
      observer.observe(slide, { attributes: true, attributeFilter: ["class"] });
    });
  }
})();

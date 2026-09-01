(function () {
  function syncCoverBleed() {
    var on = !!document.querySelector(".slide.slide--cover.is-active");
    document.body.classList.toggle("voila-cover-on", on);
    var bleed = document.querySelector("[data-cover-bleed] video");
    if (bleed) {
      if (on) {
        try { bleed.play(); } catch (e) {}
      } else {
        try { bleed.pause(); } catch (e) {}
      }
    }
  }

  function layoutVoilaOrbit(root) {
    var isDeck = document.body.classList.contains("deck");
    root = root || (isDeck
      ? document.querySelector(".slide.is-active .voila-process")
      : document.querySelector(".voila-process"));
    if (!root) return;
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

    var dot = root.querySelector(".voila-process__dot");
    if (dot && path.getTotalLength) {
      if (root._voilaPath === d && root._voilaTravel) {
        /* keep the running traveller */
      } else {
        root._voilaPath = d;
        if (root._voilaStop) root._voilaStop();
        var len = 0;
        try { len = path.getTotalLength(); } catch (e) { len = 0; }
        if (len > 1) {
          var start = performance.now();
          var dur = 8000;
          var running = true;
          function tick(now) {
            if (!running) return;
            var t = ((now - start) % dur) / dur;
            var pt = path.getPointAtLength(t * len);
            dot.style.transform = "translate(" + pt.x + "px," + pt.y + "px)";
            root._voilaTravel = requestAnimationFrame(tick);
          }
          root._voilaStop = function () {
            running = false;
            if (root._voilaTravel) cancelAnimationFrame(root._voilaTravel);
            root._voilaTravel = 0;
          };
          root._voilaTravel = requestAnimationFrame(tick);
        }
      }
    }

    var motion = root.querySelector("animateMotion");
    if (motion && motion.beginElement) {
      try { motion.beginElement(); } catch (e) {}
    }
  }

  function scheduleLayout() {
    syncCoverBleed();
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

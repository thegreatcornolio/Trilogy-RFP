(function () {
  var KEY = "trilogyPresentationsUnlock";
  var HASH = "1243e7b60989608203a3598a5e452d346fc931dded6e82ee3b18c1877b2d3581";
  var root = document.documentElement;

  function unlocked() {
    try {
      return sessionStorage.getItem(KEY) === HASH;
    } catch (e) {
      return false;
    }
  }

  function lock() {
    root.classList.add("proposal-locked");
  }

  function unlock() {
    root.classList.remove("proposal-locked");
    var gate = document.getElementById("proposal-gate");
    if (gate) gate.remove();
  }

  async function digest(value) {
    var buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return Array.from(new Uint8Array(buf))
      .map(function (b) { return b.toString(16).padStart(2, "0"); })
      .join("");
  }

  function logoSrc() {
    var script = document.currentScript;
    if (script && script.src) {
      return new URL("trilogy.png", script.src).href;
    }
    return "/presentations/_shared/trilogy.png";
  }

  function renderGate() {
    if (document.getElementById("proposal-gate")) return;
    var wrap = document.createElement("div");
    wrap.id = "proposal-gate";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.setAttribute("aria-labelledby", "proposal-gate-title");
    wrap.innerHTML =
      '<div class="proposal-gate__card">' +
        '<img class="proposal-gate__logo" alt="Trilogy" src="' + logoSrc() + '">' +
        '<p class="proposal-gate__kicker">Restricted</p>' +
        '<h1 id="proposal-gate-title">Enter password</h1>' +
        '<p>This presentation is private. Enter the password to continue.</p>' +
        '<form class="proposal-gate__form" id="proposal-gate-form">' +
          '<input type="password" name="password" autocomplete="current-password" placeholder="Password" required>' +
          '<button type="submit">Open</button>' +
        '</form>' +
        '<p class="proposal-gate__error" id="proposal-gate-error" role="alert"></p>' +
      "</div>";
    document.body.appendChild(wrap);
    var input = wrap.querySelector("input");
    if (input) input.focus();
    wrap.querySelector("form").addEventListener("submit", async function (event) {
      event.preventDefault();
      var error = document.getElementById("proposal-gate-error");
      var password = String(new FormData(event.target).get("password") || "");
      try {
        var next = await digest(password);
        if (next !== HASH) {
          error.textContent = "That password is not correct.";
          return;
        }
        sessionStorage.setItem(KEY, HASH);
        unlock();
      } catch (err) {
        error.textContent = "Unable to verify the password in this browser.";
      }
    });
  }

  if (unlocked()) {
    unlock();
    return;
  }

  lock();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderGate);
  } else {
    renderGate();
  }
})();

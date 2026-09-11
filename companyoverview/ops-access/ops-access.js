/* Operational Overview access request + corporate-email verification UI */
(function () {
  var metaApi = document.querySelector("meta[name='trilogy-ops-api']");
  var CONFIG = {
    /* Power Automate / Cloudflare Worker HTTP endpoint */
    apiUrl: (metaApi && metaApi.getAttribute("content")) || "",
    unlockKey: "trilogyOpsOverviewUnlock",
    unlockHash: "74de07c4e919534b1b460e3465bb216ce0cc2bd458e42abaf0f22448da08d063",
    opsPath: new URL("operations.html", window.location.href).href,
    verifyPath: new URL("ops-verify.html", window.location.href).href,
    fromLabel: "Trilogy Digital"
  };

  function $(sel, root) { return (root || document).querySelector(sel); }

  function emailDomain(email) {
    var parts = String(email || "").trim().toLowerCase().split("@");
    return parts.length === 2 ? parts[1] : "";
  }

  function isFreeEmail(email) {
    var domain = emailDomain(email);
    if (!domain) return true;
    var list = window.TRILOGY_FREE_EMAIL_DOMAINS || [];
    if (list.indexOf(domain) !== -1) return true;
    /* Catch regional variants like outlook.co.uk already listed; also block subdomains of free hosts rarely used */
    return list.some(function (d) {
      return domain === d || domain.endsWith("." + d);
    });
  }

  function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || "").trim());
  }

  function ensureModal() {
    if ($("#ops-access-modal")) return $("#ops-access-modal");
    var wrap = document.createElement("div");
    wrap.id = "ops-access-modal";
    wrap.className = "ops-access";
    wrap.hidden = true;
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.setAttribute("aria-labelledby", "ops-access-title");
    wrap.innerHTML =
      '<div class="ops-access__backdrop" data-ops-close="1"></div>' +
      '<div class="ops-access__card">' +
        '<button type="button" class="ops-access__close" data-ops-close="1" aria-label="Close">&times;</button>' +
        '<p class="ops-access__kicker">Restricted</p>' +
        '<h2 id="ops-access-title">Request Operational Overview</h2>' +
        '<p class="ops-access__lead">Enter your work details. We will email a verification link to your <strong>corporate</strong> address. Personal inboxes (Gmail, Outlook.com, Hotmail, Yahoo, etc.) are not accepted.</p>' +
        '<form class="ops-access__form" id="ops-access-form" novalidate>' +
          '<label class="ops-access__field"><span>Full name</span><input name="fullName" type="text" autocomplete="name" required placeholder="Jane Smith"></label>' +
          '<label class="ops-access__field"><span>Company</span><input name="company" type="text" autocomplete="organization" required placeholder="Acme Ltd"></label>' +
          '<label class="ops-access__field"><span>Corporate email</span><input name="email" type="email" autocomplete="email" required placeholder="jane@acme.com"></label>' +
          '<button type="submit" class="ops-access__submit">Send verification email</button>' +
        '</form>' +
        '<p class="ops-access__error" id="ops-access-error" role="alert" hidden></p>' +
        '<div class="ops-access__success" id="ops-access-success" hidden>' +
          '<h3>Check your email</h3>' +
          '<p>We sent a verification link to <strong id="ops-access-sent-to"></strong>. Open it to confirm your address — we will then send you the Operational Overview link.</p>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);

    wrap.addEventListener("click", function (e) {
      if (e.target && e.target.getAttribute("data-ops-close") === "1") closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !wrap.hidden) closeModal();
    });
    $("#ops-access-form", wrap).addEventListener("submit", onSubmit);
    return wrap;
  }

  function openModal() {
    var modal = ensureModal();
    $("#ops-access-error", modal).hidden = true;
    $("#ops-access-success", modal).hidden = true;
    $("#ops-access-form", modal).hidden = false;
    $("#ops-access-form", modal).reset();
    modal.hidden = false;
    document.body.classList.add("ops-access-open");
    var first = modal.querySelector("input[name='fullName']");
    if (first) first.focus();
  }

  function closeModal() {
    var modal = $("#ops-access-modal");
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove("ops-access-open");
  }

  function setError(msg) {
    var el = $("#ops-access-error");
    if (!el) return;
    el.textContent = msg || "";
    el.hidden = !msg;
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    var form = event.target;
    var btn = form.querySelector("button[type='submit']");
    var data = Object.fromEntries(new FormData(form).entries());
    var fullName = String(data.fullName || "").trim();
    var company = String(data.company || "").trim();
    var email = String(data.email || "").trim().toLowerCase();

    if (!fullName || fullName.length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!company || company.length < 2) {
      setError("Please enter your company name.");
      return;
    }
    if (!validEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (isFreeEmail(email)) {
      setError("Please use your corporate email address. Free / personal inboxes (Gmail, Hotmail, Outlook.com, Yahoo, iCloud, etc.) are not accepted.");
      return;
    }
    if (!CONFIG.apiUrl) {
      /* Local/dev convenience: show verify link when running on localhost */
      var host = location.hostname;
      if (host === "localhost" || host === "127.0.0.1") {
        var demoToken = btoa(JSON.stringify({
          email: email, fullName: fullName, company: company, exp: Date.now() + 86400000, demo: true
        }));
        var demoUrl = CONFIG.verifyPath + "?token=" + encodeURIComponent("demo." + demoToken);
        form.hidden = true;
        $("#ops-access-success").hidden = false;
        $("#ops-access-sent-to").textContent = email;
        $("#ops-access-success").insertAdjacentHTML(
          "beforeend",
          '<p style="margin-top:0.75rem;font-size:0.85rem;word-break:break-all"><strong>Dev only:</strong> API not wired — <a href="' + demoUrl + '" style="color:#d5ec67">open demo verify link</a></p>'
        );
        return;
      }
      setError("Access requests are not connected yet. Please email sales@trilogybpo.com and we will send the Operational Overview.");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Sending…";
    try {
      var res = await fetch(CONFIG.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          action: "request",
          fullName: fullName,
          company: company,
          email: email,
          origin: window.location.origin,
          verifyUrlBase: CONFIG.verifyPath,
          opsUrl: CONFIG.opsPath,
          page: "companyoverview-operations",
          requestedAt: new Date().toISOString()
        })
      });
      var payload = null;
      try { payload = await res.json(); } catch (e) { payload = null; }
      if (!res.ok || (payload && payload.ok === false)) {
        throw new Error((payload && (payload.error || payload.message)) || ("Request failed (" + res.status + ")"));
      }
      form.hidden = true;
      $("#ops-access-success").hidden = false;
      $("#ops-access-sent-to").textContent = email;
    } catch (err) {
      setError(err && err.message ? err.message : "Unable to send verification email. Please try again or contact sales@trilogybpo.com.");
      btn.disabled = false;
      btn.textContent = "Send verification email";
      return;
    }
    btn.disabled = false;
    btn.textContent = "Send verification email";
  }

  function bindTriggers() {
    document.querySelectorAll("[data-ops-request], a[href$='operations.html'], a[href*='operations.html']").forEach(function (el) {
      /* Only intercept explicit request CTAs and remaining ops deep-links we convert */
      var isCta = el.hasAttribute("data-ops-request") || /Open Operational Overview/i.test(el.textContent || "");
      if (!isCta) return;
      el.setAttribute("href", "#ops-access");
      el.addEventListener("click", function (e) {
        e.preventDefault();
        openModal();
      });
    });
  }

  /* Expose for verify page */
  window.TrilogyOpsAccess = {
    config: CONFIG,
    isFreeEmail: isFreeEmail,
    open: openModal,
    unlockSession: function () {
      try {
        sessionStorage.setItem(CONFIG.unlockKey, CONFIG.unlockHash);
      } catch (e) {}
    },
    isUnlocked: function () {
      try {
        return sessionStorage.getItem(CONFIG.unlockKey) === CONFIG.unlockHash;
      } catch (e) {
        return false;
      }
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindTriggers);
  } else {
    bindTriggers();
  }
})();

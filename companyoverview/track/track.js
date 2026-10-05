/* Company Overview share-link + engagement tracker */
(function () {
  var meta = document.querySelector('meta[name="trilogy-track-api"]');
  var ENDPOINT = (meta && meta.getAttribute("content") || "").trim();
  var params = new URLSearchParams(location.search);
  var shareId = (params.get("s") || params.get("share") || "").trim();
  var who = (params.get("who") || params.get("to") || "").trim();
  var by = (params.get("by") || params.get("from") || "").trim();

  function sid() {
    try {
      var k = "trilogyOverviewTrackSid";
      var v = sessionStorage.getItem(k);
      if (v) return v;
      v = "s_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      sessionStorage.setItem(k, v);
      return v;
    } catch (e) {
      return "anon";
    }
  }

  function basePayload(event, extra) {
    var payload = {
      event: event,
      ts: new Date().toISOString(),
      shareId: shareId,
      who: who,
      by: by,
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      path: location.pathname,
      hash: location.hash || "",
      href: location.href.split("#")[0],
      sessionId: sid(),
      ua: navigator.userAgent || "",
      lang: navigator.language || "",
      tz: (Intl.DateTimeFormat().resolvedOptions().timeZone || ""),
      screen: (screen.width || 0) + "x" + (screen.height || 0),
      viewport: (window.innerWidth || 0) + "x" + (window.innerHeight || 0),
      referrer: document.referrer || ""
    };
    if (extra) {
      Object.keys(extra).forEach(function (k) { payload[k] = extra[k]; });
    }
    return payload;
  }

  function send(event, extra) {
    var payload = basePayload(event, extra);
    try {
      var q = [];
      Object.keys(payload).forEach(function (k) {
        if (payload[k] === "" || payload[k] == null) return;
        q.push(encodeURIComponent(k) + "=" + encodeURIComponent(String(payload[k])));
      });
      var qs = q.join("&");

      if (ENDPOINT) {
        var url = ENDPOINT + (ENDPOINT.indexOf("?") >= 0 ? "&" : "?") + qs;
        // Image pixel is the most reliable for Apps Script / no-CORS endpoints
        var img = new Image();
        img.referrerPolicy = "no-referrer";
        img.src = url;
      } else if (window.console && console.debug) {
        console.debug("[trilogy-track]", payload);
      }
    } catch (e) {}
    return payload;
  }

  window.TrilogyTrack = {
    send: send,
    shareId: shareId,
    who: who,
    by: by
  };

  // Always record the click-through / page open (even before password)
  send("open");

  // Unlock (password success)
  function watchUnlock() {
    var KEY = "trilogyCompanyOverviewUnlock";
    var HASH = "1e602740ceb46223485e29e830c741cf9cc8530886bcaa7bf77cd8293e6a81a6";
    var fired = false;
    function check() {
      if (fired) return;
      try {
        if (sessionStorage.getItem(KEY) === HASH) {
          fired = true;
          send("unlock");
        }
      } catch (e) {}
    }
    check();
    var obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    window.setInterval(check, 1000);
  }
  watchUnlock();

  // Reading depth buttons
  document.addEventListener("click", function (ev) {
    var btn = ev.target && ev.target.closest ? ev.target.closest("[data-read]") : null;
    if (!btn) return;
    var mode = btn.getAttribute("data-read");
    if (mode === "light") send("read_light", { mode: "light" });
    if (mode === "detailed") send("read_detailed", { mode: "detailed" });
  }, true);

  // Light engagement signals
  var engaged = false;
  function markEngaged() {
    if (engaged) return;
    engaged = true;
    send("engaged", { seconds: 30 });
  }
  window.setTimeout(markEngaged, 30000);
})();

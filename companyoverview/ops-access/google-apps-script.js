/**
 * Google Apps Script alternative backend (Deploy → New deployment → Web app → Anyone).
 * Paste into script.google.com, then put the Web App URL into:
 *   <meta name="trilogy-ops-api" content="YOUR_WEB_APP_URL">
 *
 * Uses the Google account's Gmail to send verification + access emails.
 */
var FREE = {
  "gmail.com":1,"googlemail.com":1,"yahoo.com":1,"yahoo.co.uk":1,"hotmail.com":1,
  "outlook.com":1,"live.com":1,"msn.com":1,"icloud.com":1,"me.com":1,"aol.com":1,
  "proton.me":1,"protonmail.com":1,"zoho.com":1,"gmx.com":1,"mail.com":1,
  "yandex.com":1,"mailinator.com":1,"guerrillamail.com":1,"yopmail.com":1
};

function doPost(e) {
  var body = {};
  try { body = JSON.parse(e.postData.contents || "{}"); } catch (err) { body = {}; }
  var out;
  try {
    out = body.action === "verify" ? handleVerify(body) : handleRequest(body);
  } catch (err) {
    out = { ok: false, error: String(err && err.message || err) };
  }
  return ContentService
    .createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

function doOptions() {
  return ContentService.createTextOutput("");
}

function domainOf(email) {
  var parts = String(email || "").toLowerCase().split("@");
  return parts.length === 2 ? parts[1] : "";
}

function isFree(email) {
  var d = domainOf(email);
  return !d || !!FREE[d];
}

function handleRequest(body) {
  var email = String(body.email || "").trim().toLowerCase();
  var fullName = String(body.fullName || "").trim();
  var company = String(body.company || "").trim();
  if (!email || !fullName || !company) return { ok: false, error: "Full name, company and corporate email are required." };
  if (isFree(email)) return { ok: false, error: "Please use your corporate email address. Personal inboxes are not accepted." };

  var token = Utilities.getUuid();
  var store = PropertiesService.getScriptProperties();
  store.setProperty("ops_" + token, JSON.stringify({
    email: email,
    fullName: fullName,
    company: company,
    exp: Date.now() + 86400000,
    used: false
  }));

  var verifyUrl = String(body.verifyUrlBase || "").replace(/\/?$/, "") + "?token=" + encodeURIComponent(token);
  MailApp.sendEmail({
    to: email,
    subject: "Verify your email — Trilogy Operational Overview",
    htmlBody:
      "<p>Hi " + fullName + ",</p>" +
      "<p>Please verify your corporate email to receive the Trilogy Digital Operational Overview.</p>" +
      "<p><a href=\"" + verifyUrl + "\">Verify email</a></p>" +
      "<p>This link expires in 24 hours.</p><p>— Trilogy Digital</p>"
  });
  return { ok: true };
}

function handleVerify(body) {
  var token = String(body.token || "");
  var store = PropertiesService.getScriptProperties();
  var raw = store.getProperty("ops_" + token);
  if (!raw) return { ok: false, error: "This verification link is invalid." };
  var row = JSON.parse(raw);
  if (row.used) return { ok: false, error: "This verification link has already been used." };
  if (Date.now() > Number(row.exp)) return { ok: false, error: "This verification link has expired. Please request access again." };
  row.used = true;
  store.setProperty("ops_" + token, JSON.stringify(row));

  var opsUrl = String(body.opsUrl || "https://proposal.trilogybpo.com/companyoverview/operations.html");
  MailApp.sendEmail({
    to: row.email,
    subject: "Your Trilogy Operational Overview link",
    htmlBody:
      "<p>Hi " + row.fullName + ",</p>" +
      "<p>Your email is verified. Open the Operational Overview here:</p>" +
      "<p><a href=\"" + opsUrl + "\">Open Operational Overview</a></p>" +
      "<p>— Trilogy Digital</p>"
  });

  return {
    ok: true,
    unlockKey: "trilogyOpsOverviewUnlock",
    unlockHash: "74de07c4e919534b1b460e3465bb216ce0cc2bd458e42abaf0f22448da08d063",
    opsUrl: opsUrl,
    email: row.email,
    fullName: row.fullName,
    company: row.company
  };
}

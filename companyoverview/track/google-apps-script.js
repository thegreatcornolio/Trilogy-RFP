/**
 * Company Overview click tracker → Google Sheet
 *
 * Setup:
 * 1. Create a Google Sheet with a tab named "Events"
 * 2. Row 1 headers (exact):
 *    Timestamp | Event | Share ID | Who | By | UTM Source | UTM Medium | UTM Campaign |
 *    Path | Hash | Mode | Session | UA | Lang | TZ | Screen | Viewport | Referrer | IP
 * 3. Extensions → Apps Script → paste this file
 * 4. In the script, set SHEET_ID to your spreadsheet ID (from the Sheet URL)
 * 5. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the Web App URL into companyoverview/index.html:
 *    <meta name="trilogy-track-api" content="YOUR_WEB_APP_URL">
 *
 * Share links:
 *   https://proposal.trilogybpo.com/companyoverview/?s=acme&who=jane@acme.com&by=curtis
 */
var SHEET_ID = "PASTE_SPREADSHEET_ID_HERE";
var TAB_NAME = "Events";

function doGet(e) {
  return handle(e && e.parameter ? e.parameter : {});
}

function doPost(e) {
  var body = {};
  try {
    if (e.postData && e.postData.contents) body = JSON.parse(e.postData.contents);
  } catch (err) {
    body = (e && e.parameter) || {};
  }
  return handle(body);
}

function handle(p) {
  try {
    appendRow(p);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message || err) });
  }
}

function appendRow(p) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(TAB_NAME) || ss.insertSheet(TAB_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow([
      "Timestamp", "Event", "Share ID", "Who", "By",
      "UTM Source", "UTM Medium", "UTM Campaign",
      "Path", "Hash", "Mode", "Session",
      "UA", "Lang", "TZ", "Screen", "Viewport", "Referrer", "IP"
    ]);
  }
  sh.appendRow([
    p.ts || new Date().toISOString(),
    p.event || "",
    p.shareId || "",
    p.who || "",
    p.by || "",
    p.utm_source || "",
    p.utm_medium || "",
    p.utm_campaign || "",
    p.path || "",
    p.hash || "",
    p.mode || "",
    p.sessionId || "",
    p.ua || "",
    p.lang || "",
    p.tz || "",
    p.screen || "",
    p.viewport || "",
    p.referrer || "",
    "" // IP not available via Apps Script web app
  ]);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

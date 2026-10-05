# Final Commit — Power Automate build guide

Build this flow first. When it works, paste the HTTP URL into `rfp-builder/app.js` → `CONFIG.webhooks.finalCommit`.

Mirror the existing **saveDraft** flow pattern (same environment / GitHub connection).

---

## Goal

When the builder clicks **Final commit**, Power Automate should:

1. Receive the JSON payload (includes pre-built HTML)
2. Write these GitHub files on branch `main`:
   - `proposals/{clientSlug}/{docSlug}/index.html` ← publishable proposal
   - `proposals/{clientSlug}/{docSlug}/draft.json` ← committed snapshot
   - `proposals/{clientSlug}/{docSlug}/commercial/costing.json` ← if commercials present
3. Return a live URL the builder can show

Live URL shape:

```text
https://proposal.trilogybpo.com/proposals/{clientSlug}/{docSlug}/
```

---

## 1) Create the flow

1. Power Automate → **Create** → **Instant cloud flow**
2. Name: `RFP Builder — Final Commit`
3. Trigger: **When an HTTP request is received**

### Trigger JSON schema

Paste this as the request body schema:

```json
{
  "type": "object",
  "properties": {
    "event": { "type": "string" },
    "version": { "type": "integer" },
    "status": { "type": "string" },
    "slug": { "type": "string" },
    "clientSlug": { "type": "string" },
    "docSlug": { "type": "string" },
    "updatedAt": { "type": "string" },
    "committedAt": { "type": "string" },
    "builtHtml": { "type": "string" },
    "meta": {
      "type": "object",
      "properties": {
        "entityName": { "type": "string" },
        "clientName": { "type": "string" },
        "documentType": { "type": "string" },
        "proposalTitle": { "type": "string" },
        "date": { "type": "string" },
        "dateDisplay": { "type": "string" },
        "validUntil": { "type": "string" },
        "preparedBy": { "type": "string" },
        "title": { "type": "string" },
        "contact": { "type": "string" }
      }
    },
    "paths": {
      "type": "object",
      "properties": {
        "folder": { "type": "string" },
        "final": { "type": "string" },
        "draft": { "type": "string" },
        "costingJson": { "type": "string" },
        "commercialFolder": { "type": "string" },
        "logo": { "type": "string" },
        "acceptance": { "type": "string" }
      }
    },
    "commercialSchedule": { "type": "object" },
    "sectionOrder": {
      "type": "array",
      "items": { "type": "string" }
    },
    "placeholders": { "type": "object" },
    "theme": { "type": "object" },
    "palette": {
      "type": "array",
      "items": { "type": "string" }
    },
    "logoDataUrl": { "type": "string" },
    "acceptance": { "type": "object" }
  }
}
```

Method: **POST**  
Who can trigger: **Anyone** (same as saveDraft) — security is the signed URL.

Save once so Power Automate generates the **HTTP POST URL**. Keep that URL for wiring later.

---

## 2) Compose paths + public URL

Add a **Compose** (or **Initialize variable**) step:

| Name | Expression / value |
| --- | --- |
| `RepoOwner` | `thegreatcornolio` |
| `RepoName` | `Trilogy-RFP` |
| `Branch` | `main` |
| `HtmlPath` | `triggerBody()?['paths']?['final']` |
| `DraftPath` | `triggerBody()?['paths']?['draft']` |
| `CostingPath` | `triggerBody()?['paths']?['costingJson']` |
| `PublicUrl` | `concat('https://proposal.trilogybpo.com/', triggerBody()?['paths']?['folder'])` |

Fallback if `paths` missing:

```text
proposals/{clientSlug}/{docSlug}/index.html
```

---

## 3) Write `index.html` to GitHub

Use the **GitHub** connector (same connection as saveDraft).

Preferred action: **Create or update file contents** (if available in your connector).

| Field | Value |
| --- | --- |
| Repository Owner | `thegreatcornolio` |
| Repository Name | `Trilogy-RFP` |
| File Path | `@{triggerBody()?['paths']?['final']}` |
| Branch | `main` |
| Commit message | `Final commit: @{triggerBody()?['meta']?['clientName']} — @{triggerBody()?['meta']?['documentType']}` |
| File Content | `@{triggerBody()?['builtHtml']}` |

### If you only have Create file / Update file

1. **Get file content** for `paths.final` (configure run after → also succeed on 404)
2. **Condition**: file exists?
   - **Yes** → **Update file** (pass SHA from Get file)
   - **No** → **Create file**

---

## 4) Write `draft.json` (without giant `builtHtml`)

Add **Compose** named `DraftJsonForRepo`:

```text
Remove builtHtml from the payload so draft.json stays small.
```

Expression approach:

1. Compose object from trigger body fields you care about, **omit** `builtHtml`
2. Or use:

```text
setProperty(triggerBody(), 'builtHtml', null)
```

Then GitHub create/update:

| Field | Value |
| --- | --- |
| File Path | `@{triggerBody()?['paths']?['draft']}` |
| File Content | `@{string(outputs('DraftJsonForRepo'))}` |
| Commit message | `Save committed draft: @{triggerBody()?['slug']}` |

---

## 5) Write `commercial/costing.json` (optional)

**Condition:** `commercialSchedule` has rows.

Expression:

```text
greater(length(triggerBody()?['commercialSchedule']?['rows']), 0)
```

If true → GitHub create/update:

| Field | Value |
| --- | --- |
| File Path | `@{triggerBody()?['paths']?['costingJson']}` |
| File Content | JSON of `commercialSchedule` (+ currency / hoursPerMonth / title / disclaimer) |
| Commit message | `Commercial schedule: @{triggerBody()?['slug']}` |

Minimal costing body example:

```json
{
  "version": 1,
  "currency": "GBP",
  "hoursPerMonth": 160,
  "includeInProposal": true,
  "title": "Proposed Commercial Schedule",
  "disclaimer": "Indicative rates for discussion. Final rates confirmed in the Statement of Work.",
  "rows": []
}
```

---

## 6) Optional — Teams / email notify

**Post message in a chat or channel**:

```text
Final proposal committed
Client: @{triggerBody()?['meta']?['clientName']}
Doc: @{triggerBody()?['meta']?['documentType']}
URL: @{variables('PublicUrl')}
```

---

## 7) Response to the builder

Add **Response** action:

- Status: `200`
- Headers: `Content-Type` = `application/json`
- Body:

```json
{
  "ok": true,
  "event": "finalCommit",
  "slug": "@{triggerBody()?['slug']}",
  "path": "@{triggerBody()?['paths']?['final']}",
  "url": "@{variables('PublicUrl')}"
}
```

---

## 8) Test the flow (before wiring the builder)

Use Postman / Bruno / curl with a tiny payload first:

```bash
curl -X POST "$FINAL_COMMIT_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "finalCommit",
    "slug": "test-client__short-company-overview",
    "clientSlug": "test-client",
    "docSlug": "short-company-overview",
    "status": "committed",
    "meta": {
      "clientName": "Test Client",
      "documentType": "Short Company Overview",
      "proposalTitle": "Short Company Overview",
      "entityName": "Short Company Overview"
    },
    "paths": {
      "folder": "proposals/test-client/short-company-overview/",
      "final": "proposals/test-client/short-company-overview/index.html",
      "draft": "proposals/test-client/short-company-overview/draft.json",
      "costingJson": "proposals/test-client/short-company-overview/commercial/costing.json"
    },
    "builtHtml": "<!doctype html><html><body><h1>Test final commit</h1></body></html>",
    "commercialSchedule": { "rows": [] }
  }'
```

Checks:

1. Flow run succeeds  
2. File appears on GitHub `main`  
3. After Pages rebuild:  
   `https://proposal.trilogybpo.com/proposals/test-client/short-company-overview/`

Then delete the test folder if you want.

---

## 9) Wire into the builder (after PA works)

In `rfp-builder/app.js`:

```js
webhooks: {
  saveDraft: "...existing...",
  finalCommit: "PASTE_HTTP_POST_URL_HERE",
  sendForAcceptance: "",
},
```

Commit + push `main`. Hard-refresh the builder.

Expected behaviour after wiring:

- Final commit POSTs to PA  
- Toast: success / published URL  
- Local download becomes fallback only if the webhook is empty or fails  

---

## Payload size notes

`builtHtml` can be large (especially with an embedded logo data-URL).

If the HTTP trigger rejects the body:

1. Confirm flow is in the same Power Platform environment as saveDraft  
2. Temporarily commit without logo to validate the path  
3. Later improvement: upload logo as `proposals/{client}/logo.png` and rewrite `<img src="data:...">` to that relative path before GitHub write  

---

## Checklist

- [ ] Flow created: `RFP Builder — Final Commit`
- [ ] HTTP trigger schema pasted
- [ ] GitHub create/update `paths.final` from `builtHtml`
- [ ] GitHub create/update `paths.draft` (no `builtHtml`)
- [ ] Optional costing.json when rows exist
- [ ] Response returns `{ ok, url, path }`
- [ ] Tiny curl test succeeds + Pages URL loads
- [ ] Paste URL into `CONFIG.webhooks.finalCommit`
- [ ] Real Final commit from builder tested

# Operational Overview access (corporate email verification)

## What shipped on the site

1. **Ops nav links removed** from `/companyoverview` and `/companyoverview2`  
2. **Open Operational Overview →** opens a form: full name, company, corporate email  
3. **Free / personal inboxes blocked** (Gmail, Hotmail, Outlook.com, Yahoo, iCloud, Proton, …)  
4. **`operations.html` is separately gated** — the company-overview password no longer unlocks it  
   - Staff bypass password: `operations`  
5. After verification, prospect gets an email with the ops link and this browser session unlocks

Static GitHub Pages cannot send mail by itself. Point the form at a webhook (Power Automate or Cloudflare Worker).

## Wire email in ~10 minutes (Power Automate — recommended)

You already call Power Automate from the browser (DocuSign). Same pattern:

1. **Create** → Instant cloud flow → trigger **When an HTTP request is received**  
2. Request body JSON schema:

```json
{
  "type": "object",
  "properties": {
    "action": { "type": "string" },
    "fullName": { "type": "string" },
    "company": { "type": "string" },
    "email": { "type": "string" },
    "token": { "type": "string" },
    "verifyUrlBase": { "type": "string" },
    "opsUrl": { "type": "string" },
    "origin": { "type": "string" }
  }
}
```

3. **Condition** on `action`:

### `action` = `request`
- Reject if email domain is in the free-mail list (or call a Filter)  
- Create a GUID token; store in a SharePoint list (`Token`, `Email`, `Name`, `Company`, `Expiry`, `Used`)  
- **Send an email (V2)** to `email`:

Subject: `Verify your email — Trilogy Operational Overview`  

Body link: `@{verifyUrlBase}?token=@{guid}`  
(example base: `https://proposal.trilogybpo.com/companyoverview/ops-verify.html`)

- **Response** JSON: `{ "ok": true }`

### `action` = `verify`
- Look up token; ensure not used / not expired; mark used  
- **Send an email (V2)** with the ops link (`opsUrl`)  
- **Response** JSON:

```json
{
  "ok": true,
  "unlockKey": "trilogyOpsOverviewUnlock",
  "unlockHash": "74de07c4e919534b1b460e3465bb216ce0cc2bd458e42abaf0f22448da08d063",
  "opsUrl": "https://proposal.trilogybpo.com/companyoverview/operations.html"
}
```

4. Paste the HTTP POST URL into `companyoverview/index.html`:

```html
<meta name="trilogy-ops-api" content="https://prod-....logic.azure.com:443/workflows/...">
```

(and the same meta on `companyoverview2/index.html` if you use the short page CTA)

5. Hard-refresh the overview and test with a work email.

## Alternative: Cloudflare Worker + Resend

See `worker.js` + `wrangler.toml`. Deploy, set secrets (`RESEND_API_KEY`, `TOKEN_SECRET`, `FROM_EMAIL`, `UNLOCK_HASH`), put the worker URL in the same `trilogy-ops-api` meta tag.

## Files

| File | Role |
| --- | --- |
| `ops-access.js` / `ops-access.css` | Modal form + validation |
| `free-email-domains.js` | Personal mailbox blocklist |
| `../ops-verify.html` | Opens from verification email |
| `worker.js` | Optional Cloudflare API |
| `google-apps-script.js` | Optional Gmail-based backend (CORS can be awkward) |

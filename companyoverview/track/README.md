# Company Overview click tracking

Yes — you can track when someone opens the link you send them.

## One share URL

Send only:

**https://proposal.trilogybpo.com/companyoverview/**

Password: `companyoverview`

Optional tracked params:

| Param | Purpose | Example |
|-------|---------|---------|
| `s` | Share / account id (required for useful tracking) | `acme` or `acme-jane` |
| `who` | Who you sent it to (you encode this) | `jane@acme.com` |
| `by` | Who on your team sent it | `curtis` |
| `utm_source` / `utm_medium` / `utm_campaign` | Optional campaign tags | `email` / `sales` / `q2` |

### Example tracked link

```text
https://proposal.trilogybpo.com/companyoverview/?s=acme&who=jane@acme.com&by=curtis
```

Use the helper: [/companyoverview/share.html](https://proposal.trilogybpo.com/companyoverview/share.html) (same password).

## What we can grab when they click through

### You already know (because you put it in the link)
- **Who you intended** (`who`)
- **Which account / deal** (`s`)
- **Which teammate sent it** (`by`)

### We can detect automatically
- **That they opened the link** (`open`) — even if they bounce at the password screen
- **That they entered the password** (`unlock`)
- **Whether they chose Lite Reading or More detailed** (`read_light` / `read_detailed`)
- **Rough engagement** (`engaged` after ~30 seconds on the page)
- **When** (timestamp)
- **Browser / device hints**: user agent, language, timezone, screen + viewport size
- **Referrer** (often blank for email / WhatsApp / Slack)

### We cannot reliably get from a click alone
- Their real identity, unless **you** put it in the URL (`who=…`)
- Their email inbox contents
- Exact GPS location
- Whether they forwarded the link (unless you give each person a unique `s` / `who`)

Tip: give **each recipient a unique `s` or `who`** so opens map to a person.

## Turn on logging (Google Sheet)

1. Create a Sheet with a tab `Events` (headers are auto-created if empty).
2. Paste `google-apps-script.js` into Apps Script, set `SHEET_ID`.
3. Deploy as Web app → **Anyone**.
4. Put the Web App URL into `companyoverview/index.html`:

```html
<meta name="trilogy-track-api" content="YOUR_WEB_APP_URL">
```

Until that meta tag is set, events only show in the browser console (`[trilogy-track]`).

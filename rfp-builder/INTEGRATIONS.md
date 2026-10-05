# Power Automate + DocuSign + SharePoint hooks

Configure the three webhook URLs in `app.js` → `CONFIG.webhooks`.

| Event | Status | Detail |
| --- | --- | --- |
| `saveDraft` | Wired | Existing PA HTTP URL in `app.js` |
| `finalCommit` | **Wired** | HTTP URL in `app.js`; see [`FINAL-COMMIT-POWER-AUTOMATE.md`](./FINAL-COMMIT-POWER-AUTOMATE.md) |
| `sendForAcceptance` | Not wired | DocuSign envelope flow (below) |

Sample payload: `proposals/_schema/final-commit.example.json`

---

## 1) saveDraft

**Trigger:** HTTP request (POST JSON)

**Actions (suggested):**
1. Parse `slug`, `meta`, `sectionOrder`, `placeholders`, `logoDataUrl`
2. Compose GitHub path `proposals/{clientSlug}/{docSlug}/draft.json` (see `paths.draft`)
3. GitHub connector — Create or update file
4. Optional: decode logo → `proposals/{clientSlug}/logo.png`
5. Optional: upsert SQL row `Proposals(Slug, ClientName, Status, UpdatedAt, DraftJson)`

---

## 2) finalCommit

**Build guide:** [`FINAL-COMMIT-POWER-AUTOMATE.md`](./FINAL-COMMIT-POWER-AUTOMATE.md)

**Trigger:** HTTP request (POST JSON including `builtHtml`)

**Actions:**
1. Write `paths.final` → `proposals/{client}/{doc}/index.html` from `builtHtml`
2. Write `paths.draft` → `draft.json` (**without** `builtHtml`)
3. Optional: write `paths.costingJson` when commercial rows exist
4. Return `{ ok: true, url, path }`
5. Optional: Teams notification with  
   `https://proposal.trilogybpo.com/proposals/{client}/{doc}/`

Until the webhook fails or is removed, successful Final commits publish via Power Automate and no longer download files locally. Downloads remain as a fallback only.

---

## 3) sendForAcceptance

**Trigger:** HTTP request with signer fields

**Actions:**
1. DocuSign — create envelope from template  
   Tabs: Full name, Designation, Signature, Date  
   Email subject: `Trilogy Digital proposal acceptance — {clientName}`
2. On DocuSign completed (separate flow):
   - Save signed PDF to SharePoint: `/Customers/{clientName}/RFP/Signed/`
   - Update `proposals/{slug}/acceptance.json`
   - SQL status = `accepted`

## Sample acceptance.json

```json
{
  "status": "accepted",
  "signerName": "Jane Client",
  "designation": "Head of CX",
  "signerEmail": "jane@client.com",
  "envelopeId": "docusign-envelope-id",
  "sharePointPath": "/Customers/Client/RFP/Signed/proposal-signed.pdf",
  "completedAt": "2026-08-12T16:00:00Z"
}
```

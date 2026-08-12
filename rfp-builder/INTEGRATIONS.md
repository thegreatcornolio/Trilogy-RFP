# Power Automate + DocuSign + SharePoint hooks

Configure the three webhook URLs in `app.js` → `CONFIG.webhooks`.

## 1) saveDraft

**Trigger:** HTTP request (POST JSON)

**Actions (suggested):**
1. Parse `slug`, `meta`, `sectionOrder`, `placeholders`, `logoDataUrl`
2. Compose GitHub path `proposals/{slug}/draft.json`
3. GitHub connector — Create or update file
4. Optional: decode logo → `proposals/{slug}/logo.png`
5. Optional: upsert SQL row `Proposals(Slug, ClientName, Status, UpdatedAt, DraftJson)`

## 2) finalCommit

**Trigger:** HTTP request (POST JSON including optional `builtHtml`)

**Actions:**
1. Write `proposals/{slug}/index.html` (from `builtHtml` or your own HTML assembly)
2. Update SQL status = `committed`
3. Teams notification with Pages URL  
   `https://proposal.trilogybpo.com/proposals/{slug}/`

> Later enhancement: server-side merge of full `trilogydigital` section HTML instead of scaffold placeholders.

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

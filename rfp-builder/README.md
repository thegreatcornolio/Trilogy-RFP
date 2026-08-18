# RFP Builder

Interactive scaffold for assembling customer-specific Trilogy proposals from the `trilogydigital/` master template.

## Flow

1. **Capture cover** — client name, reference, dates, prepared-by fields, customer logo
2. **Theme** — primary colours are sampled from the customer logo and applied to the draft preview
3. **Assemble** — drag sections from the library into the proposal order
4. **Edit placeholders** — sections like *Specific Client Experience* are typed in the builder
5. **Save draft** — stored under `proposals/{customer-slug}/draft.json` (via Power Automate / GitHub Action). Local drafts also persist in the browser so you can keep editing
6. **Final commit** — builds `proposals/{customer-slug}/index.html` (publishable presentation)
7. **Acceptance** — DocuSign envelope for name / designation / signature, then archive to SharePoint

Drafts stay editable until **Final commit**. After that you can still reopen the customer, edit, and re-commit.

## Folder layout (target)

```text
proposals/
  {client-slug}/
    logo.png                 # shared customer logo
    {doc-slug}/
      draft.json             # editable working state
      index.html             # final built presentation (after commit)
      acceptance.json        # DocuSign / sign-off metadata
      commercial/            # deal-specific costing
        costing.json         # client schedule (builder import/export)
        costing.csv          # optional spreadsheet export
        costing.xlsx         # optional full workbook (internal tab never published)
```

See `proposals/_templates/commercial/README.md` for the commercial sheet conventions.

## Integrations you can wire (SQL / Power Automate / DocuSign / SharePoint)

The builder posts JSON payloads to webhook URLs you configure in `app.js` (`CONFIG.webhooks`).

| Event | Suggested Power Automate flow |
| --- | --- |
| `saveDraft` | Receive JSON + logo → create/update GitHub folder `proposals/{slug}/` OR write SQL row + blob |
| `finalCommit` | Build/commit `index.html` to GitHub Pages path; notify Teams |
| `sendForAcceptance` | Create DocuSign envelope from template; on completed → save PDF + fields to SharePoint + SQL |

### Example webhook payload (`saveDraft`)

```json
{
  "event": "saveDraft",
  "slug": "virgin-gifts",
  "meta": { "clientName": "Virgin Gifts", "reference": "RFP-001" },
  "theme": { "primary": "#61d779", "secondary": "#13202e" },
  "sectionOrder": ["section-01", "section-02"],
  "placeholders": { "specific-client-experience": "..." },
  "logoDataUrl": "data:image/png;base64,...",
  "updatedAt": "2026-08-12T15:00:00Z"
}
```

### DocuSign

Use your existing DocuSign business license via Power Automate’s DocuSign connector:
1. Builder calls `sendForAcceptance` with signer name, email, designation
2. Flow creates envelope (tabs: name, designation, signature, date)
3. On completion webhook → store signed PDF in SharePoint customer folder + mark `acceptance.json`

## Local use (no webhooks yet)

- Drafts autosave to `localStorage` in the current browser only
- **Export draft JSON** / **Export built HTML** download files you can drop into `proposals/{slug}/`
- Point `CONFIG.webhooks.*` at your Power Automate HTTP trigger URLs when ready
- **Admin** (bottom-left) is PIN-gated draft management: delete individual local drafts or clear all. This never deletes SQL / SharePoint / committed proposal files. Change `CONFIG.adminPin` in `app.js` (default `trilogy-admin`).

## Live

`/rfp-builder/`

# Commercial costing (per opportunity)

Copy this folder into each deal:

```text
proposals/{client-slug}/{doc-slug}/commercial/
  costing.json     # normalised schedule the RFP builder reads / exports
  costing.csv      # optional spreadsheet-friendly Client Schedule
  costing.xlsx     # optional full workbook (Client Schedule + Internal Build-up)
```

## Rules

1. **Client Schedule** columns only appear in the proposal table: role, FTE, unit, rate, monthly, model, notes.
2. **Internal Build-up** (salary, benefits, facilities, tech, margin, FX) must never be exported into the proposal HTML.
3. Edit the schedule in the RFP builder (Commercial schedule panel) or update `costing.json` / CSV and re-import later.
4. Monthly totals = `fte × rate` for FTE models.

## Proposal output

When Commercial Models & Pricing is included and `includeInProposal` is true, the builder injects **Proposed Commercial Schedule** as a table under the static pricing examples.

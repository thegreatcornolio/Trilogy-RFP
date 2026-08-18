# Commercial costing (per opportunity)

Copy this folder into each deal:

```text
proposals/{client-slug}/{doc-slug}/commercial/
  costing.json     # normalised schedule the RFP builder reads / exports
  costing.csv      # optional spreadsheet-friendly Client Schedule
  costing.xlsx     # optional full workbook (Client Schedule + Internal Build-up)
```

## Rules

1. **Client Schedule** columns only appear in the proposal table: role, FTE/Qty, unit, rate, monthly, model, notes.
2. **Internal Build-up** (salary, benefits, facilities, tech, margin, FX) must never be exported into the proposal HTML.
3. Edit the schedule in the RFP builder (Commercial schedule panel) **after Admin unlock** — commercials are owner-only.
4. Monthly totals depend on **Model**:
   - **FTE** — `fte × rate` (rate = monthly per FTE). Unit: `per FTE / month`.
   - **Hour** — `fte × hoursPerMonth × rate` (rate = hourly). Default `hoursPerMonth` = 160. Unit: `per hour`.
   - **Interaction** — `qty × rate` (qty stored in the FTE column = interactions). Unit: `per interaction`.
   - **Gain-share** — `qty × rate` (estimated monthly share). Unit: `gain-share / month`.

## Proposal output

When Commercial Models & Pricing is included and `includeInProposal` is true, the builder injects **Proposed Commercial Schedule** as a table under the static pricing examples.

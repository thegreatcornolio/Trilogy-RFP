# Trilogy presentations

Drop a source file here. It is converted into a branded HTML deck and published on GitHub Pages.

**Live index:** [proposal.trilogybpo.com/presentations/](https://proposal.trilogybpo.com/presentations/)

## Drop a file

Put the source at **`presentations/`** (this folder) or **`presentations/_inbox/`**.

Supported: `.pptx`, `.ppt`, `.pdf`, `.key`, exported slide images, or markdown outlines.

Do not edit `_shared/`, `_template/`, `index.html`, or `catalog.json` by hand unless you are changing the pipeline itself.

## After conversion

Each source becomes one published deck:

| Path | Purpose |
| --- | --- |
| `presentations/<slug>/index.html` | HTML deck (the page you present) |
| `presentations/<slug>/theme.json` | Extracted source colours + Trilogy blend |
| `presentations/<slug>/assets/` | Images, logos, and other media from the source |
| `presentations/<slug>/source/` | Original upload, kept as-is |
| `presentations/catalog.json` | Gallery listing |
| `presentations/index.html` | Gallery on GitHub Pages |

**URL:** `https://proposal.trilogybpo.com/presentations/<slug>/`

The raw upload is moved out of the drop zone once the deck exists.

## Folder layout

```
presentations/
  README.md                 this file
  index.html                gallery (GitHub Pages)
  catalog.json              published decks
  _inbox/                   optional drop zone
  _shared/                  deck chrome (CSS, JS, logos)
  _template/                HTML skeleton copied for each new deck
  <slug>/
    index.html
    theme.json
    assets/
    source/
```

`<slug>` is a lowercase kebab-case name from the file (client, topic, date when present).

## Colour blend

Every deck keeps Trilogy chrome and mixes in colours taken from the source.

**Trilogy anchors**

| Role | Hex |
| --- | --- |
| Primary green | `#61d779` |
| Accent lime | `#d5ec67` |
| Secondary green | `#2f9e4a` |
| Navy | `#13202e` |
| White | `#ffffff` |

**Blend rules**

1. Extract 3–6 dominant colours from the source (theme, logos, large fills).
2. Classify them as dark, primary, accent, and light.
3. Mix into CSS variables used by `_shared/deck.css`:

| Token | Mix |
| --- | --- |
| `--blend-navy` | 85% Trilogy navy + 15% source dark |
| `--blend-primary` | 55% Trilogy green + 45% source primary |
| `--blend-accent` | 50% Trilogy lime + 50% source accent |
| `--blend-secondary` | 60% Trilogy secondary + 40% source secondary |
| `--source-brand` | strongest source brand colour, unmixed (logos / callouts) |

Navy stays the presentation background. White stays white. Exact hex values are stored in `theme.json` and inlined on the deck page.

## Pipeline (agent)

On each new upload:

1. Detect the file in `presentations/` or `_inbox/` (ignore README, catalog, HTML, and `_` folders).
2. Derive `<slug>` and create `presentations/<slug>/`.
3. Move the original into `presentations/<slug>/source/`.
4. Preserve slide/section order, headings, bullets, notes, and media.
5. Extract colours, write `theme.json`, apply the blend.
6. Build `index.html` from `_template/` + `_shared/deck.css` / `deck.js`.
7. Register the deck in `catalog.json` and refresh the gallery.
8. Commit and publish via GitHub Pages.

Conversion is agent-driven so the HTML can be polished, not a raw PPTX dump.

## Presenting a deck

- **Next / previous:** arrow keys, Space, or on-screen controls
- **Jump:** `Home` / `End`, or hash `#3`
- **Print / PDF:** browser print (one slide per page)

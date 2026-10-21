#!/usr/bin/env python3
"""Trilogy-branded CX Summary Update PDF — 21 Oct 2026 (full, tighter)."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import Color, white
from reportlab.pdfgen import canvas
import os

OUT = "/workspace/GCC/Trilogy-CX-Summary-Update-21-Oct-2026.pdf"
LOGO = "/workspace/presentations/_shared/logos/trilogy.png"

NAVY = Color(0x13 / 255, 0x20 / 255, 0x2E / 255)
GREEN = Color(0x61 / 255, 0xD7 / 255, 0x79 / 255)
LIME = Color(0xD5 / 255, 0xEC / 255, 0x67 / 255)
MUTED = Color(0x6B / 255, 0x76 / 255, 0x82 / 255)
LIGHT = Color(0xF4 / 255, 0xF6 / 255, 0xF8 / 255)
BORDER = Color(0xD5 / 255, 0xDB / 255, 0xE3 / 255)

W, H = A4
M = 12 * mm


def draw_header(c, page_title, page_num, total_pages):
    c.setFillColor(NAVY)
    c.rect(0, H - 16 * mm, W, 16 * mm, fill=1, stroke=0)
    c.setFillColor(GREEN)
    c.rect(0, H - 16.6 * mm, W * 0.62, 0.6 * mm, fill=1, stroke=0)
    c.setFillColor(LIME)
    c.rect(W * 0.62, H - 16.6 * mm, W * 0.38, 0.6 * mm, fill=1, stroke=0)

    if os.path.exists(LOGO):
        logo_h = 6.5 * mm
        c.drawImage(LOGO, M, H - 12.2 * mm, width=logo_h * 4.65, height=logo_h, mask="auto", preserveAspectRatio=True)

    c.setFillColor(white)
    c.setFont("Helvetica", 7)
    c.drawRightString(W - M, H - 6.5 * mm, "Trilogy CX  ·  Commercial-in-confidence")
    c.setFillColor(LIME)
    c.setFont("Helvetica-Bold", 7)
    c.drawRightString(W - M, H - 11 * mm, "21 October 2026")

    c.setFillColor(LIGHT)
    c.rect(0, H - 24.5 * mm, W, 7.9 * mm, fill=1, stroke=0)
    c.setFillColor(GREEN)
    c.rect(M, H - 22.2 * mm, 1.8 * mm, 3.6 * mm, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(M + 4 * mm, H - 21.5 * mm, page_title)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7)
    c.drawRightString(W - M, H - 21.5 * mm, f"{page_num} / {total_pages}")


def draw_footer(c):
    c.setFillColor(NAVY)
    c.rect(0, 0, W, 7.5 * mm, fill=1, stroke=0)
    c.setFillColor(GREEN)
    c.rect(0, 7.5 * mm, W * 0.62, 0.55 * mm, fill=1, stroke=0)
    c.setFillColor(LIME)
    c.rect(W * 0.62, 7.5 * mm, W * 0.38, 0.55 * mm, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Helvetica", 6.5)
    c.drawString(M, 2.6 * mm, "trilogybpo.com")
    c.drawRightString(W - M, 2.6 * mm, "Trilogy CX (Pty) Ltd")


def section(c, x, y, text, accent=GREEN):
    c.setFillColor(accent)
    c.rect(x, y - 0.6 * mm, 1.6 * mm, 3.4 * mm, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 9.5)
    c.drawString(x + 3.2 * mm, y, text)
    return y - 4.2 * mm


def card(c, x, y, w, h, fill=LIGHT):
    c.setFillColor(fill)
    c.roundRect(x, y - h, w, h, 2 * mm, fill=1, stroke=0)


def wrap(c, text, x, y, max_w, font="Helvetica", size=8, leading=10, color=NAVY):
    c.setFont(font, size)
    c.setFillColor(color)
    words, lines, line = text.split(), [], ""
    for w in words:
        trial = (line + " " + w).strip()
        if c.stringWidth(trial, font, size) <= max_w:
            line = trial
        else:
            if line:
                lines.append(line)
            line = w
    if line:
        lines.append(line)
    for i, ln in enumerate(lines):
        c.drawString(x, y - i * leading, ln)
    return y - len(lines) * leading


def fit(c, text, max_w, font, size):
    if c.stringWidth(text, font, size) <= max_w:
        return text
    while text and c.stringWidth(text + "…", font, size) > max_w:
        text = text[:-1]
    return (text + "…") if text else ""


def table(c, x, y, col_widths, rows, font_size=6.8, row_h=4.8 * mm):
    total_w = sum(col_widths)
    c.setFillColor(NAVY)
    c.rect(x, y - row_h, total_w, row_h, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", font_size)
    cx = x
    for i, w in enumerate(col_widths):
        c.drawString(cx + 1 * mm, y - row_h + 1.4 * mm, fit(c, str(rows[0][i]), w - 1.8 * mm, "Helvetica-Bold", font_size))
        cx += w
    y -= row_h
    for r_i, row in enumerate(rows[1:]):
        is_total = str(row[0]).upper() in ("TOTAL", "YTD", "TOTAL RUN-RATE")
        c.setFillColor(Color(0xE8 / 255, 0xF8 / 255, 0xEC / 255) if is_total else (LIGHT if r_i % 2 == 0 else white))
        c.rect(x, y - row_h, total_w, row_h, fill=1, stroke=0)
        c.setStrokeColor(BORDER)
        c.setLineWidth(0.25)
        c.rect(x, y - row_h, total_w, row_h, fill=0, stroke=1)
        cx = x
        for i, w in enumerate(col_widths):
            txt = str(row[i]) if i < len(row) else ""
            c.setFont("Helvetica-Bold" if is_total else "Helvetica", font_size)
            c.setFillColor(NAVY)
            if i > 0 and any(ch.isdigit() for ch in txt):
                c.drawRightString(cx + w - 1 * mm, y - row_h + 1.4 * mm, fit(c, txt, w - 1.8 * mm, c._fontname, font_size))
            else:
                c.drawString(cx + 1 * mm, y - row_h + 1.4 * mm, fit(c, txt, w - 1.8 * mm, c._fontname, font_size))
            cx += w
        y -= row_h
    return y


def fill_rest(c, y, blocks):
    """Use remaining page space with a visible navy panel so bottoms aren't empty white."""
    footer_top = 11 * mm
    h = y - footer_top
    if h < 10 * mm:
        return
    # Visible brand panel (not near-white) so leftover space reads as intentional
    card(c, M, y, W - 2 * M, h, NAVY)
    c.setFillColor(GREEN)
    c.rect(M, y - 1.2 * mm, W - 2 * M, 1.2 * mm, fill=1, stroke=0)
    c.setFillColor(LIME)
    c.rect(M, y - h, W - 2 * M, 1.2 * mm, fill=1, stroke=0)

    # Distribute blocks evenly through the panel height
    n = max(len(blocks), 1)
    usable = h - 8 * mm
    slot = usable / n
    for i, (title, body) in enumerate(blocks):
        yy = y - 5 * mm - i * slot
        c.setFillColor(LIME)
        c.setFont("Helvetica-Bold", 7)
        c.drawString(M + 3.5 * mm, yy, title.upper())
        wrap(c, body, M + 3.5 * mm, yy - 5 * mm, W - 2 * M - 7 * mm, size=7.2, leading=9.2, color=white)


def build():
    c = canvas.Canvas(OUT, pagesize=A4)
    total = 3

    # ========== PAGE 1 ==========
    draw_header(c, "Overview, Strategy, Deals & Pipeline", 1, total)
    draw_footer(c)
    y = H - 28 * mm

    card(c, M, y, W - 2 * M, 10 * mm, NAVY)
    c.setFillColor(LIME); c.setFont("Helvetica-Bold", 6.5)
    c.drawString(M + 3 * mm, y - 3.5 * mm, "TRILOGY CX SUMMARY")
    c.setFillColor(white); c.setFont("Helvetica-Bold", 10.5)
    c.drawString(M + 3 * mm, y - 7.8 * mm, "Board / Leadership Update")
    c.setFillColor(GREEN); c.setFont("Helvetica", 6.8)
    c.drawRightString(W - M - 3 * mm, y - 7.8 * mm, "Primary: GCC  ·  Secondary: BPO & AI  ·  21 Oct 2026")
    y -= 12.5 * mm

    kpis = [("R3m", "Bank"), ("3", "New clients"), ("323", "Pipeline FTEs"), ("R141m", "Pipeline ACV"), ("R3m", "Build CAPEX")]
    kw = (W - 2 * M - 8 * mm) / 5
    for i, (val, label) in enumerate(kpis):
        x = M + i * (kw + 2 * mm)
        card(c, x, y, kw, 9.5 * mm, GREEN if i % 2 == 0 else LIME)
        c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(x + kw / 2, y - 4.2 * mm, val)
        c.setFont("Helvetica", 5.6); c.drawCentredString(x + kw / 2, y - 8 * mm, label)
    y -= 12 * mm

    y = section(c, M, y, "Overview", GREEN)
    cw = (W - 2 * M - 3 * mm) / 2
    card(c, M, y, cw, 12 * mm, LIGHT); card(c, M + cw + 3 * mm, y, cw, 12 * mm, LIGHT)
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 6.5)
    c.drawString(M + 2.5 * mm, y - 3.8 * mm, "BPO SALES")
    wrap(c, "Slower than anticipated due to delay in UK sales resources (John Devlin & Alain Meric).", M + 2.5 * mm, y - 7.5 * mm, cw - 5 * mm, size=6.6, leading=8.2)
    c.setFont("Helvetica-Bold", 6.5); c.setFillColor(NAVY)
    c.drawString(M + cw + 5.5 * mm, y - 3.8 * mm, "GCC DEMAND")
    wrap(c, "Demand for GCC Professional Services — clear market shift toward capability centres.", M + cw + 5.5 * mm, y - 7.5 * mm, cw - 5 * mm, size=6.6, leading=8.2)
    y -= 14.5 * mm

    y = section(c, M, y, "Strategic positioning", LIME)
    card(c, M, y, W - 2 * M, 8 * mm, NAVY)
    wrap(c, "Pivot slightly to primary focus on GCC and secondary on BPO and AI — following the demand cycle and differentiation.", M + 3 * mm, y - 3.2 * mm, W - 2 * M - 6 * mm, size=6.8, leading=8.5, color=white)
    y -= 10 * mm
    bullets = [
        "AI confusion is slowing BPO decisions.",
        "GCC is in demand.",
        "Trilogy team experience is well positioned for this.",
        "BPO competitors don’t want to do GCC — not core for them.",
        "Following the demand cycle and differentiation.",
    ]
    bw = (W - 2 * M - 4 * mm) / 2
    for i, b in enumerate(bullets):
        col, row = i % 2, i // 2
        x = M + col * (bw + 4 * mm); yy = y - row * 4.8 * mm
        c.setFillColor(GREEN if col == 0 else LIME)
        c.circle(x + 1.1 * mm, yy + 0.9 * mm, 0.9 * mm, fill=1, stroke=0)
        c.setFillColor(NAVY); c.setFont("Helvetica", 6.5); c.drawString(x + 3.8 * mm, yy, b)
    y -= 15.5 * mm

    y = section(c, M, y, "New deals — last 3 months", GREEN)
    deals = [
        ["Client", "Type", "Start", "Term", "Est. revenue", "Est. GM", "Comments"],
        ["Ventrica — UK", "GCC", "01/10/26", "18–36 mo", "—", "—", "Growing 35 → 150 seats over 18 months"],
        ["Medscheme", "GCC", "01/10/26", "12 mo", "R6.5m p.a.", "R3.5m p.a.", "Opportunity to outsource Shared Services"],
        ["NADClinic", "BPO", "01/08/26", "24 mo", "R100k p.m.", "R50k p.m.", "Small UK campaign; limited growth estimate"],
    ]
    y = table(c, M, y, [28 * mm, 12 * mm, 15 * mm, 15 * mm, 22 * mm, 20 * mm, 60 * mm], deals, font_size=6.2, row_h=4.4 * mm)
    y -= 3 * mm

    y = section(c, M, y, "Pipeline", LIME)
    pipeline = [
        ["Deal name", "FTE", "ACV (ZAR)"],
        ["Evri", "60", "R25,200,000"], ["Popsa", "11", "R4,620,000"],
        ["Lightning Fibre", "8", "R3,360,000"], ["ITS", "25", "R10,500,000"],
        ["Synamedia", "14", "R11,433,612"], ["Karen Prodgers Consulting", "30", "R12,600,000"],
        ["Leyland SDM", "15", "R6,300,000"], ["Seraph Property Management", "8", "R3,360,000"],
        ["The Very Group", "150", "R63,000,000"], ["Rebel Therapies", "2", "R840,000"],
        ["TOTAL", "323", "R141,213,612"],
    ]
    left = 108 * mm; y0 = y
    y = table(c, M, y, [68 * mm, 14 * mm, 26 * mm], pipeline, font_size=6.0, row_h=4.0 * mm)
    sx = M + left + 3 * mm; sw = W - M - sx
    card(c, sx, y0, sw, 14 * mm, NAVY)
    c.setFillColor(LIME); c.setFont("Helvetica-Bold", 5.8); c.drawString(sx + 2.5 * mm, y0 - 3.8 * mm, "PIPELINE TOTAL")
    c.setFillColor(white); c.setFont("Helvetica-Bold", 11); c.drawString(sx + 2.5 * mm, y0 - 8.8 * mm, "R141.2m")
    c.setFillColor(GREEN); c.setFont("Helvetica", 5.8); c.drawString(sx + 2.5 * mm, y0 - 12.2 * mm, "323 FTEs · 10 deals")
    card(c, sx, y0 - 16 * mm, sw, 12 * mm, GREEN)
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 5.8); c.drawString(sx + 2.5 * mm, y0 - 19.8 * mm, "GCC WINS LIVE")
    c.setFont("Helvetica-Bold", 7.5); c.drawString(sx + 2.5 * mm, y0 - 24 * mm, "Ventrica + Medscheme")
    c.setFont("Helvetica", 5.8); c.drawString(sx + 2.5 * mm, y0 - 27.2 * mm, "Both start 01 Oct 2026")
    card(c, sx, y0 - 30.5 * mm, sw, 12 * mm, LIME)
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 5.8); c.drawString(sx + 2.5 * mm, y0 - 34.3 * mm, "LARGEST DEAL")
    c.setFont("Helvetica-Bold", 7.5); c.drawString(sx + 2.5 * mm, y0 - 38.5 * mm, "The Very Group")
    c.setFont("Helvetica", 5.8); c.drawString(sx + 2.5 * mm, y0 - 41.7 * mm, "150 FTEs · R63.0m ACV")

    y = min(y, y0 - 45 * mm) - 2 * mm
    fill_rest(c, y, [
        ("Context", "BPO offshoring growth estimates are behind plan. Cash remains at R3m. Near-term revenue is underpinned by Ventrica, Medscheme and (from Jan’27) Synamedia. Strategic response: lean into GCC demand, fix UK sales/contracting via partnerships, and stand up Woodstock capacity."),
    ])
    c.showPage()

    # ========== PAGE 2 ==========
    draw_header(c, "Cash Flow, Budget & New Revenues", 2, total)
    draw_footer(c)
    y = H - 28 * mm

    y = section(c, M, y, "Cash flow highlights", GREEN)
    card(c, M, y, 38 * mm, 11 * mm, GREEN)
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 5.8); c.drawString(M + 2.5 * mm, y - 3.8 * mm, "BANK BALANCE")
    c.setFont("Helvetica-Bold", 11); c.drawString(M + 2.5 * mm, y - 8.8 * mm, "R3.0m")
    card(c, M + 41 * mm, y, W - M - (M + 41 * mm), 11 * mm, LIGHT)
    wrap(c, "YTD behind original BPO growth estimates. Actuals hold a flat revenue run-rate while projected ramp assumed faster UK BPO conversion. Overall YTD variance still positive vs plan.", M + 44 * mm, y - 4 * mm, W - M - (M + 44 * mm) - 3 * mm, size=6.5, leading=8)
    y -= 13.5 * mm

    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "YTD"]
    label_w = 16 * mm; mw = (W - 2 * M - label_w) / 10; cols = [label_w] + [mw] * 10

    y = section(c, M, y, "Budget variance — Projected (R millions)", LIME)
    proj = [
        ["", *months],
        ["Revenue", "0.43", "1.23", "2.02", "2.04", "2.09", "2.95", "3.77", "3.77", "4.11", "22.40"],
        ["Costs", "(0.10)", "(2.49)", "(2.50)", "(1.15)", "(1.13)", "(3.00)", "(3.26)", "(1.91)", "(2.00)", "(17.54)"],
        ["GM", "0.33", "(1.26)", "(0.49)", "0.89", "0.97", "(0.05)", "0.51", "1.86", "2.11", "4.86"],
        ["Overheads", "(2.03)", "(1.42)", "(1.59)", "(1.49)", "(1.49)", "(1.62)", "(2.54)", "(1.90)", "(1.97)", "(16.06)"],
        ["EBITDA", "(1.69)", "(2.68)", "(2.08)", "(0.60)", "(0.53)", "(1.67)", "(2.03)", "(0.04)", "0.14", "(11.20)"],
    ]
    y = table(c, M, y, cols, proj, font_size=5.9, row_h=4.0 * mm)
    y -= 3 * mm

    y = section(c, M, y, "Budget variance — Actuals (R millions)", GREEN)
    c.setFillColor(MUTED); c.setFont("Helvetica", 5.5)
    c.drawString(M, y + 0.2 * mm, "Variance = Actual EBITDA vs Projected EBITDA")
    y -= 1 * mm
    act = [
        ["", *months],
        ["Revenue", "0.59", "0.59", "0.59", "0.59", "0.59", "0.59", "0.59", "0.59", "0.59", "5.29"],
        ["GM", "0.59", "0.59", "0.59", "0.59", "0.59", "0.59", "0.59", "0.59", "0.59", "5.29"],
        ["Overheads", "1.33", "1.33", "1.33", "1.33", "1.33", "1.33", "1.33", "1.33", "1.33", "12.00"],
        ["EBITDA", "(0.75)", "(0.75)", "(0.75)", "(0.75)", "(0.75)", "(0.75)", "(0.75)", "(0.75)", "(0.75)", "(6.71)"],
        ["Variance", "0.95", "1.94", "1.34", "(0.14)", "(0.22)", "0.93", "1.29", "(0.70)", "(0.89)", "4.49"],
    ]
    y = table(c, M, y, cols, act, font_size=5.9, row_h=4.0 * mm)
    y -= 3 * mm

    hw = (W - 2 * M - 3 * mm) / 2
    card(c, M, y, hw, 10 * mm, NAVY)
    c.setFillColor(LIME); c.setFont("Helvetica-Bold", 5.8); c.drawString(M + 2.5 * mm, y - 3.5 * mm, "YTD VARIANCE")
    c.setFillColor(white); c.setFont("Helvetica-Bold", 10); c.drawString(M + 2.5 * mm, y - 8 * mm, "+R4.49m")
    c.setFillColor(GREEN); c.setFont("Helvetica", 5.8); c.drawString(M + 26 * mm, y - 8 * mm, "vs projected EBITDA")
    card(c, M + hw + 3 * mm, y, hw, 10 * mm, LIGHT)
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 5.8); c.drawString(M + hw + 5.5 * mm, y - 3.5 * mm, "YTD ACTUAL EBITDA")
    c.setFont("Helvetica-Bold", 10); c.drawString(M + hw + 5.5 * mm, y - 8 * mm, "(R6.71m)")
    c.setFillColor(MUTED); c.setFont("Helvetica", 5.8); c.drawString(M + hw + 32 * mm, y - 8 * mm, "Projected (R11.20m)")
    y -= 13 * mm

    y = section(c, M, y, "New revenues coming online (Oct-26 → Jun-27, R thousands)", LIME)
    rev_months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    newrev = [
        ["", *rev_months],
        ["Ventrica", "450", "450", "450", "450", "450", "450", "450", "450", "450"],
        ["Synamedia", "—", "—", "—", "295", "295", "295", "295", "295", "295"],
        ["Medscheme Local", "195", "195", "195", "—", "—", "—", "—", "—", "—"],
        ["Medscheme Intl", "246", "246", "246", "82", "82", "82", "82", "82", "82"],
        ["TOTAL", "891", "891", "891", "827", "827", "827", "827", "827", "827"],
    ]
    lw = 28 * mm; mw2 = (W - 2 * M - lw) / 9
    y = table(c, M, y, [lw] + [mw2] * 9, newrev, font_size=5.9, row_h=4.0 * mm)
    y -= 2.5 * mm
    fill_rest(c, y, [
        ("Near-term run-rate", "Oct–Dec 2026: ~R891k / month.  Jan–Jun 2027: ~R827k / month as Medscheme mix shifts and Synamedia comes online from January."),
        ("Read-through", "Actual EBITDA is steadier than the aggressive projected ramp, which is why YTD variance is +R4.49m even while absolute EBITDA remains negative at (R6.71m). Closing the UK sales and contracting gaps is what unlocks the projected upside."),
    ])
    c.showPage()

    # ========== PAGE 3 ==========
    draw_header(c, "Risks, Facilities & Strategic Options", 3, total)
    draw_footer(c)
    y = H - 28 * mm

    y = section(c, M, y, "Risks & reasons for YTD revenue gap", GREEN)
    c.setFillColor(MUTED); c.setFont("Helvetica", 6)
    c.drawString(M, y + 0.2 * mm, "Three fundamental challenges to meeting original growth estimates for BPO offshoring services")
    y -= 1.5 * mm
    risks = [
        ("01", "UK sales onboarding delays",
         "Delays onboarding John Devlin & Alain Meric due to trade-restraint legal situations.",
         "Kobus meeting other sales resources and the CEO of UK BPO iQX (week of 27 Oct) to establish a wholesale/retail pricing partnership leveraging their sales and contracting capability."),
        ("02", "Start-up perception",
         "Seen as a start-up with limited balance sheet, scale and client references.",
         "Finalising a JV (SPV) with DSG South Africa for a joint go-to-market strategy to strengthen procurement credentials (not in all cases)."),
        ("03", "UK contracting preference",
         "Cyber-security diligence is pushing UK buyers to contract with a UK entity, not directly with an SA company.",
         "Meetings with Ventrica and iQX (week of 27 Oct) to establish a UK contracting partnership — similar early-warning signals over the past 6 months."),
    ]
    rw = (W - 2 * M - 6 * mm) / 3
    for i, (num, title, problem, mit) in enumerate(risks):
        x = M + i * (rw + 3 * mm)
        card(c, x, y, rw, 42 * mm, LIGHT)
        c.setFillColor(GREEN if i != 1 else LIME)
        c.setFont("Helvetica-Bold", 8); c.drawString(x + 2.2 * mm, y - 4.5 * mm, num)
        c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 6.8)
        wrap(c, title, x + 10 * mm, y - 4.3 * mm, rw - 12.5 * mm, font="Helvetica-Bold", size=6.8, leading=8)
        wrap(c, problem, x + 2.2 * mm, y - 13 * mm, rw - 4.5 * mm, size=6.2, leading=7.6)
        c.setFillColor(GREEN); c.setFont("Helvetica-Bold", 5.5)
        c.drawString(x + 2.2 * mm, y - 26 * mm, "MITIGATION")
        wrap(c, mit, x + 2.2 * mm, y - 30 * mm, rw - 4.5 * mm, size=6.0, leading=7.4, color=MUTED)
    y -= 45 * mm

    y = section(c, M, y, "Facilities & CAPEX", LIME)
    cw = (W - 2 * M - 3 * mm) / 2
    card(c, M, y, cw, 16 * mm, LIGHT)
    card(c, M + cw + 3 * mm, y, cw, 16 * mm, NAVY)
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 6.5)
    c.drawString(M + 2.5 * mm, y - 4 * mm, "CURRENT")
    wrap(c, "Renting shared office space at Old Mutual Park, Pinelands.", M + 2.5 * mm, y - 8.5 * mm, cw - 5 * mm, size=6.6, leading=8.2)
    c.setFillColor(LIME); c.setFont("Helvetica-Bold", 6.5)
    c.drawString(M + cw + 5.5 * mm, y - 4 * mm, "NEXT — BUILD-OUT")
    wrap(c, "First CC/back office at Boulevard Office Park, Woodstock — contracts + HQ.", M + cw + 5.5 * mm, y - 8.5 * mm, cw - 5 * mm, size=6.6, leading=8.2, color=white)
    y -= 18.5 * mm

    card(c, M, y, W - 2 * M, 11 * mm, GREEN)
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 12); c.drawString(M + 3 * mm, y - 7.5 * mm, "R3.0m")
    c.setFont("Helvetica-Bold", 7); c.drawString(M + 24 * mm, y - 4 * mm, "Estimated CAPEX")
    wrap(c, "Build-out starts 1 November 2026 — dependent on Medscheme (sub-lease) and Redefine (long lease).", M + 24 * mm, y - 8 * mm, W - 2 * M - 28 * mm, size=6.6, leading=8)
    y -= 14 * mm

    y = section(c, M, y, "Strategic options / discussions", GREEN)
    options = [
        ("01", "GCC focus", "Build 2,000 seats over 3 years. 10,000 m². Profit ~R2,000/seat/month. ~75% EBIT. Needs a BUILD partner such as Navigator."),
        ("02", "Mango 5 acquisition", "R8m for ~R3m/month revenues & ~R1.2m/month GP. Value after 18 months circa R25m."),
        ("03", "iQX UK partnership", "GCC for them and a UK/SA pricing model (Ascensos-like) — sales reach and UK contracting in one move."),
    ]
    for num, title, body in options:
        accent = GREEN if num != "02" else LIME
        card(c, M, y, W - 2 * M, 12.5 * mm, LIGHT)
        c.setFillColor(accent)
        c.roundRect(M + 2.2 * mm, y - 9.5 * mm, 7 * mm, 7 * mm, 1.2 * mm, fill=1, stroke=0)
        c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 7)
        c.drawCentredString(M + 5.7 * mm, y - 7 * mm, num)
        c.setFont("Helvetica-Bold", 7.5); c.drawString(M + 12.5 * mm, y - 4 * mm, title)
        wrap(c, body, M + 12.5 * mm, y - 8 * mm, W - 2 * M - 16 * mm, size=6.5, leading=8, color=MUTED)
        y -= 14 * mm

    card(c, M, y, W - 2 * M, 9 * mm, NAVY)
    c.setFillColor(LIME); c.setFont("Helvetica-Bold", 6)
    c.drawString(M + 3 * mm, y - 3.3 * mm, "NEXT ACTIONS")
    c.setFillColor(white); c.setFont("Helvetica", 6.6)
    c.drawString(M + 3 * mm, y - 7 * mm, "iQX / Ventrica talks (w/c 27 Oct)  ·  DSG JV finalisation  ·  Woodstock build-out from 1 Nov 2026")
    y -= 11.5 * mm

    fill_rest(c, y, [
        ("Executive summary", "Lean into GCC demand — Ventrica and Medscheme are live from 1 Oct. Close UK sales and contracting gaps via iQX/Ventrica partnerships and the DSG JV. Protect cash (R3m) while standing up Woodstock capacity (R3m CAPEX from 1 Nov). Keep optionality on GCC scale-up (Navigator), Mango 5, and the iQX UK model."),
    ])

    c.save()
    print("Saved", OUT, __import__('os').path.getsize(OUT))


if __name__ == "__main__":
    build()

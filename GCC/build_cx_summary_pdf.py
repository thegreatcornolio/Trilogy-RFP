#!/usr/bin/env python3
"""Trilogy-branded CX Summary Update PDF — 21 Oct 2026 (short)."""

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
    c.rect(0, H - 18 * mm, W, 18 * mm, fill=1, stroke=0)
    c.setFillColor(GREEN)
    c.rect(0, H - 18.7 * mm, W * 0.62, 0.7 * mm, fill=1, stroke=0)
    c.setFillColor(LIME)
    c.rect(W * 0.62, H - 18.7 * mm, W * 0.38, 0.7 * mm, fill=1, stroke=0)

    if os.path.exists(LOGO):
        logo_h = 7 * mm
        c.drawImage(LOGO, M, H - 13.5 * mm, width=logo_h * 4.65, height=logo_h, mask="auto", preserveAspectRatio=True)

    c.setFillColor(white)
    c.setFont("Helvetica", 7.5)
    c.drawRightString(W - M, H - 7.5 * mm, "Trilogy CX  ·  Commercial-in-confidence")
    c.setFillColor(LIME)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawRightString(W - M, H - 12.5 * mm, "21 October 2026")

    c.setFillColor(LIGHT)
    c.rect(0, H - 28 * mm, W, 9 * mm, fill=1, stroke=0)
    c.setFillColor(GREEN)
    c.rect(M, H - 25.2 * mm, 2 * mm, 4.2 * mm, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(M + 4.5 * mm, H - 24.5 * mm, page_title)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawRightString(W - M, H - 24.5 * mm, f"{page_num} / {total_pages}")


def draw_footer(c):
    c.setFillColor(NAVY)
    c.rect(0, 0, W, 8 * mm, fill=1, stroke=0)
    c.setFillColor(GREEN)
    c.rect(0, 8 * mm, W * 0.62, 0.6 * mm, fill=1, stroke=0)
    c.setFillColor(LIME)
    c.rect(W * 0.62, 8 * mm, W * 0.38, 0.6 * mm, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Helvetica", 7)
    c.drawString(M, 3 * mm, "trilogybpo.com")
    c.drawRightString(W - M, 3 * mm, "Trilogy CX (Pty) Ltd")


def section(c, x, y, text, accent=GREEN):
    c.setFillColor(accent)
    c.rect(x, y - 0.8 * mm, 1.8 * mm, 3.8 * mm, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(x + 3.5 * mm, y, text)
    return y - 5 * mm


def card(c, x, y, w, h, fill=LIGHT):
    c.setFillColor(fill)
    c.roundRect(x, y - h, w, h, 2.5 * mm, fill=1, stroke=0)


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


def table(c, x, y, col_widths, rows, font_size=7, row_h=5.4 * mm):
    total_w = sum(col_widths)
    c.setFillColor(NAVY)
    c.rect(x, y - row_h, total_w, row_h, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", font_size)
    cx = x
    for i, w in enumerate(col_widths):
        c.drawString(cx + 1.2 * mm, y - row_h + 1.7 * mm, fit(c, str(rows[0][i]), w - 2 * mm, "Helvetica-Bold", font_size))
        cx += w
    y -= row_h
    for r_i, row in enumerate(rows[1:]):
        is_total = str(row[0]).upper() == "TOTAL"
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
                c.drawRightString(cx + w - 1.2 * mm, y - row_h + 1.7 * mm, fit(c, txt, w - 2 * mm, c._fontname, font_size))
            else:
                c.drawString(cx + 1.2 * mm, y - row_h + 1.7 * mm, fit(c, txt, w - 2 * mm, c._fontname, font_size))
            cx += w
        y -= row_h
    return y


def build():
    c = canvas.Canvas(OUT, pagesize=A4)
    total = 2

    # ===================== PAGE 1 =====================
    draw_header(c, "Quick Update — Strategy, Deals & Pipeline", 1, total)
    draw_footer(c)
    y = H - 34 * mm

    # Hero
    card(c, M, y, W - 2 * M, 18 * mm, NAVY)
    c.setFillColor(LIME)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(M + 4 * mm, y - 5.5 * mm, "TRILOGY CX SUMMARY")
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(M + 4 * mm, y - 11.5 * mm, "Board / Leadership Update")
    c.setFillColor(GREEN)
    c.setFont("Helvetica", 8)
    c.drawString(M + 4 * mm, y - 16 * mm, "Primary focus: GCC  ·  Secondary: BPO & AI  ·  21 October 2026")
    y -= 22 * mm

    # KPIs
    kpis = [("R3m", "Bank"), ("3", "New clients"), ("323", "Pipeline FTEs"), ("R141m", "Pipeline ACV"), ("R3m", "Build CAPEX")]
    kw = (W - 2 * M - 8 * mm) / 5
    for i, (val, label) in enumerate(kpis):
        x = M + i * (kw + 2 * mm)
        card(c, x, y, kw, 14 * mm, GREEN if i % 2 == 0 else LIME)
        c.setFillColor(NAVY)
        c.setFont("Helvetica-Bold", 11)
        c.drawCentredString(x + kw / 2, y - 7 * mm, val)
        c.setFont("Helvetica", 6.5)
        c.drawCentredString(x + kw / 2, y - 11.5 * mm, label)
    y -= 18 * mm

    y = section(c, M, y, "Overview & strategic pivot", GREEN)
    # two cards + strategy banner
    cw = (W - 2 * M - 3 * mm) / 2
    card(c, M, y, cw, 18 * mm, LIGHT)
    card(c, M + cw + 3 * mm, y, cw, 18 * mm, LIGHT)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(M + 3 * mm, y - 5 * mm, "BPO SALES")
    wrap(c, "Slower than anticipated — UK sales onboarding delayed (John Devlin & Alain Meric).", M + 3 * mm, y - 10 * mm, cw - 6 * mm, size=7.5, leading=9.5)
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColor(NAVY)
    c.drawString(M + cw + 6 * mm, y - 5 * mm, "GCC DEMAND")
    wrap(c, "Market shift to GCC Professional Services. Competitors won’t do GCC — Trilogy is well positioned.", M + cw + 6 * mm, y - 10 * mm, cw - 6 * mm, size=7.5, leading=9.5)
    y -= 21 * mm

    card(c, M, y, W - 2 * M, 12 * mm, NAVY)
    wrap(
        c,
        "Pivot: primary focus on GCC; secondary on BPO & AI. AI confusion is slowing BPO decisions while GCC demand rises.",
        M + 4 * mm,
        y - 5 * mm,
        W - 2 * M - 8 * mm,
        size=8,
        leading=10,
        color=white,
    )
    y -= 16 * mm

    y = section(c, M, y, "New deals — last 3 months", LIME)
    deals = [
        ["Client", "Type", "Start", "Term", "Revenue", "GM", "Notes"],
        ["Ventrica — UK", "GCC", "01/10/26", "18–36 mo", "—", "—", "35 → 150 seats / 18 mo"],
        ["Medscheme", "GCC", "01/10/26", "12 mo", "R6.5m p.a.", "R3.5m p.a.", "Shared Services opportunity"],
        ["NADClinic", "BPO", "01/08/26", "24 mo", "R100k p.m.", "R50k p.m.", "Small UK; limited growth"],
    ]
    y = table(c, M, y, [32 * mm, 12 * mm, 16 * mm, 16 * mm, 22 * mm, 20 * mm, 54 * mm], deals, font_size=6.8, row_h=5.2 * mm)
    y -= 5 * mm

    y = section(c, M, y, "Pipeline", GREEN)
    # compact pipeline: left table of top deals + totals card
    pipe = [
        ["Deal", "FTE", "ACV"],
        ["The Very Group", "150", "R63.0m"],
        ["Evri", "60", "R25.2m"],
        ["Karen Prodgers Consulting", "30", "R12.6m"],
        ["Synamedia", "14", "R11.4m"],
        ["ITS", "25", "R10.5m"],
        ["Leyland SDM", "15", "R6.3m"],
        ["Popsa", "11", "R4.6m"],
        ["Lightning Fibre / Seraph", "16", "R6.7m"],
        ["Rebel Therapies", "2", "R0.8m"],
        ["TOTAL", "323", "R141.2m"],
    ]
    left = 105 * mm
    y0 = y
    y = table(c, M, y, [58 * mm, 14 * mm, 28 * mm], pipe, font_size=6.8, row_h=4.8 * mm)

    sx = M + left + 4 * mm
    sw = W - M - sx
    card(c, sx, y0, sw, 22 * mm, NAVY)
    c.setFillColor(LIME)
    c.setFont("Helvetica-Bold", 7)
    c.drawString(sx + 3 * mm, y0 - 6 * mm, "PIPELINE TOTAL")
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(sx + 3 * mm, y0 - 14 * mm, "R141.2m")
    c.setFillColor(GREEN)
    c.setFont("Helvetica", 7)
    c.drawString(sx + 3 * mm, y0 - 19 * mm, "323 FTEs · 10 deals")

    card(c, sx, y0 - 26 * mm, sw, 20 * mm, GREEN)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 7)
    c.drawString(sx + 3 * mm, y0 - 32 * mm, "GCC WINS LIVE")
    c.setFont("Helvetica-Bold", 10)
    c.drawString(sx + 3 * mm, y0 - 39 * mm, "Ventrica + Medscheme")
    c.setFont("Helvetica", 7)
    c.drawString(sx + 3 * mm, y0 - 44 * mm, "Both start 01 Oct 2026")

    card(c, sx, y0 - 50 * mm, sw, 20 * mm, LIME)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 7)
    c.drawString(sx + 3 * mm, y0 - 56 * mm, "LARGEST DEAL")
    c.setFont("Helvetica-Bold", 10)
    c.drawString(sx + 3 * mm, y0 - 63 * mm, "The Very Group")
    c.setFont("Helvetica", 7)
    c.drawString(sx + 3 * mm, y0 - 68 * mm, "150 FTEs · R63.0m ACV")

    c.showPage()

    # ===================== PAGE 2 =====================
    draw_header(c, "Finance, Risks, Facilities & Options", 2, total)
    draw_footer(c)
    y = H - 34 * mm

    y = section(c, M, y, "Cash flow & budget (YTD highlights)", GREEN)
    # 4 metric cards instead of full monthly grids
    metrics = [
        (GREEN, "BANK", "R3.0m", "Current balance"),
        (LIME, "YTD VARIANCE", "+R4.49m", "Actual vs projected EBITDA"),
        (NAVY, "YTD ACTUAL EBITDA", "(R6.71m)", "Flat ~R0.59m rev / month"),
        (LIGHT, "YTD PROJECTED EBITDA", "(R11.20m)", "Assumed faster BPO ramp"),
    ]
    mw = (W - 2 * M - 9 * mm) / 4
    for i, (fill, label, val, sub) in enumerate(metrics):
        x = M + i * (mw + 3 * mm)
        card(c, x, y, mw, 22 * mm, fill)
        tc = white if fill == NAVY else NAVY
        sc = GREEN if fill == NAVY else MUTED
        c.setFillColor(LIME if fill == NAVY else (NAVY if fill in (GREEN, LIME) else MUTED))
        c.setFont("Helvetica-Bold", 6.5)
        c.setFillColor(LIME if fill == NAVY else NAVY)
        c.drawString(x + 2.5 * mm, y - 5.5 * mm, label)
        c.setFillColor(tc)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(x + 2.5 * mm, y - 12.5 * mm, val)
        c.setFillColor(sc if fill == NAVY else MUTED)
        c.setFont("Helvetica", 6.5)
        wrap(c, sub, x + 2.5 * mm, y - 17.5 * mm, mw - 5 * mm, size=6.5, leading=8, color=(GREEN if fill == NAVY else MUTED))
    y -= 26 * mm

    y = section(c, M, y, "New revenues coming online", LIME)
    newrev = [
        ["", "Oct–Dec’26", "Jan–Jun’27"],
        ["Ventrica", "R450k / mo", "R450k / mo"],
        ["Synamedia", "—", "R295k / mo"],
        ["Medscheme Local", "R195k / mo", "—"],
        ["Medscheme International", "R246k / mo", "R82k / mo"],
        ["TOTAL RUN-RATE", "~R891k / mo", "~R827k / mo"],
    ]
    y = table(c, M, y, [50 * mm, 55 * mm, 55 * mm], newrev, font_size=7.2, row_h=5 * mm)
    y -= 5 * mm

    y = section(c, M, y, "Risks & mitigations", GREEN)
    risks = [
        ("01", "UK sales delay", "Trade restraints delayed Devlin & Meric.", "Meet iQX CEO + other sales (w/c 27 Oct) for wholesale/retail partnership."),
        ("02", "Start-up perception", "Limited balance sheet, scale & references.", "Finalise DSG SA JV (SPV) for joint GTM / procurement strength."),
        ("03", "UK contracting", "Buyers prefer UK entity for cyber diligence.", "Partner talks with Ventrica & iQX (w/c 27 Oct) for UK contracting."),
    ]
    rw = (W - 2 * M - 6 * mm) / 3
    for i, (num, title, problem, mit) in enumerate(risks):
        x = M + i * (rw + 3 * mm)
        card(c, x, y, rw, 38 * mm, LIGHT)
        c.setFillColor(GREEN if i != 1 else LIME)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(x + 3 * mm, y - 7 * mm, num)
        c.setFillColor(NAVY)
        c.setFont("Helvetica-Bold", 8)
        c.drawString(x + 12 * mm, y - 6.5 * mm, title)
        wrap(c, problem, x + 3 * mm, y - 13 * mm, rw - 6 * mm, size=7, leading=9)
        c.setFillColor(GREEN)
        c.setFont("Helvetica-Bold", 6.5)
        c.drawString(x + 3 * mm, y - 24 * mm, "MITIGATION")
        wrap(c, mit, x + 3 * mm, y - 29 * mm, rw - 6 * mm, size=6.8, leading=8.5, color=MUTED)
    y -= 42 * mm

    y = section(c, M, y, "Facilities & CAPEX", LIME)
    cw = (W - 2 * M - 3 * mm) / 2
    card(c, M, y, cw, 20 * mm, LIGHT)
    card(c, M + cw + 3 * mm, y, cw, 20 * mm, GREEN)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(M + 3 * mm, y - 5.5 * mm, "CURRENT → NEXT")
    wrap(c, "Shared space at Old Mutual Park, Pinelands → first CC/back office at Boulevard Office Park, Woodstock (contracts + HQ).", M + 3 * mm, y - 11 * mm, cw - 6 * mm, size=7.2, leading=9)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(M + cw + 6 * mm, y - 5.5 * mm, "BUILD-OUT CAPEX")
    c.setFont("Helvetica-Bold", 14)
    c.drawString(M + cw + 6 * mm, y - 12.5 * mm, "R3.0m")
    c.setFont("Helvetica", 7)
    wrap(c, "Starts 1 Nov 2026 — subject to Medscheme sub-lease & Redefine long lease.", M + cw + 6 * mm, y - 16.5 * mm, cw - 6 * mm, size=6.8, leading=8.5)
    y -= 24 * mm

    y = section(c, M, y, "Strategic options", GREEN)
    opts = [
        ("GCC focus", "2,000 seats / 3 yrs · 10,000 m² · ~R2k profit/seat/mo · ~75% EBIT · needs BUILD partner (e.g. Navigator)"),
        ("Mango 5", "R8m for ~R3m/mo rev & ~R1.2m/mo GP · value ~R25m after 18 months"),
        ("iQX UK partnership", "GCC for them + UK/SA pricing (Ascensos-like) — sales reach & UK contracting in one move"),
    ]
    for i, (title, body) in enumerate(opts):
        accent = GREEN if i != 1 else LIME
        card(c, M, y, W - 2 * M, 13 * mm, LIGHT)
        c.setFillColor(accent)
        c.roundRect(M + 2.5 * mm, y - 10.5 * mm, 8 * mm, 8 * mm, 1.5 * mm, fill=1, stroke=0)
        c.setFillColor(NAVY)
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(M + 6.5 * mm, y - 7.8 * mm, f"0{i+1}")
        c.setFont("Helvetica-Bold", 8.5)
        c.drawString(M + 14 * mm, y - 5 * mm, title)
        wrap(c, body, M + 14 * mm, y - 10 * mm, W - 2 * M - 18 * mm, size=7, leading=9, color=MUTED)
        y -= 15 * mm

    card(c, M, y, W - 2 * M, 12 * mm, NAVY)
    c.setFillColor(LIME)
    c.setFont("Helvetica-Bold", 7)
    c.drawString(M + 4 * mm, y - 4.5 * mm, "NEXT ACTIONS")
    c.setFillColor(white)
    c.setFont("Helvetica", 7.5)
    c.drawString(M + 4 * mm, y - 9.5 * mm, "iQX / Ventrica talks (w/c 27 Oct)  ·  DSG JV finalisation  ·  Woodstock build-out from 1 Nov")

    c.save()
    print("Saved", OUT, os.path.getsize(OUT))


if __name__ == "__main__":
    build()

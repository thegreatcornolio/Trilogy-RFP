#!/usr/bin/env python3
"""Trilogy-branded CX Summary Update PDF — 21 Oct 2026."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import Color, white, black
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

OUT = "/workspace/GCC/Trilogy-CX-Summary-Update-21-Oct-2026.pdf"
LOGO = "/workspace/presentations/_shared/logos/trilogy.png"

# Brand
NAVY = Color(0x13 / 255, 0x20 / 255, 0x2E / 255)
NAVY_DEEP = Color(0x0C / 255, 0x19 / 255, 0x26 / 255)
GREEN = Color(0x61 / 255, 0xD7 / 255, 0x79 / 255)
LIME = Color(0xD5 / 255, 0xEC / 255, 0x67 / 255)
CARD = Color(0x1B / 255, 0x2A / 255, 0x3A / 255)
MUTED = Color(0x6B / 255, 0x76 / 255, 0x82 / 255)
LIGHT = Color(0xF4 / 255, 0xF6 / 255, 0xF8 / 255)
ROW_ALT = Color(0xEE / 255, 0xF2 / 255, 0xF5 / 255)
RED_SOFT = Color(0xE8 / 255, 0x5D / 255, 0x5D / 255)
BORDER = Color(0xD5 / 255, 0xDB / 255, 0xE3 / 255)

W, H = A4
M = 14 * mm


def draw_header(c, page_title, page_num, total_pages):
    # top navy bar
    c.setFillColor(NAVY)
    c.rect(0, H - 22 * mm, W, 22 * mm, fill=1, stroke=0)
    c.setFillColor(GREEN)
    c.rect(0, H - 22.8 * mm, W * 0.62, 0.8 * mm, fill=1, stroke=0)
    c.setFillColor(LIME)
    c.rect(W * 0.62, H - 22.8 * mm, W * 0.38, 0.8 * mm, fill=1, stroke=0)

    if os.path.exists(LOGO):
        # Wordmark is ~4.65:1 — keep readable on navy header
        logo_h = 8 * mm
        logo_w = logo_h * 4.65
        c.drawImage(
            LOGO,
            M,
            H - 15.5 * mm,
            width=logo_w,
            height=logo_h,
            mask="auto",
            preserveAspectRatio=True,
            anchor="c",
        )

    c.setFillColor(white)
    c.setFont("Helvetica", 8)
    c.drawRightString(W - M, H - 9 * mm, "Trilogy CX  ·  Commercial-in-confidence")
    c.setFillColor(LIME)
    c.setFont("Helvetica-Bold", 8)
    c.drawRightString(W - M, H - 14 * mm, "21 October 2026")

    # page title strip
    c.setFillColor(LIGHT)
    c.rect(0, H - 34 * mm, W, 11 * mm, fill=1, stroke=0)
    c.setFillColor(GREEN)
    c.rect(M, H - 30.5 * mm, 2.2 * mm, 5 * mm, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(M + 5 * mm, H - 29.5 * mm, page_title)

    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8)
    c.drawRightString(W - M, H - 29.5 * mm, f"{page_num} / {total_pages}")


def draw_footer(c):
    c.setFillColor(NAVY)
    c.rect(0, 0, W, 10 * mm, fill=1, stroke=0)
    c.setFillColor(GREEN)
    c.rect(0, 10 * mm, W * 0.62, 0.7 * mm, fill=1, stroke=0)
    c.setFillColor(LIME)
    c.rect(W * 0.62, 10 * mm, W * 0.38, 0.7 * mm, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Helvetica", 7)
    c.drawString(M, 4 * mm, "trilogybpo.com")
    c.drawRightString(W - M, 4 * mm, "Trilogy CX (Pty) Ltd")


def section_label(c, x, y, text, accent=GREEN):
    c.setFillColor(accent)
    c.rect(x, y - 1 * mm, 2 * mm, 4.2 * mm, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(x + 4 * mm, y, text)
    return y - 6 * mm


def card(c, x, y, w, h, fill=LIGHT):
    c.setFillColor(fill)
    c.roundRect(x, y - h, w, h, 3 * mm, fill=1, stroke=0)


def wrapped_text(c, text, x, y, max_width, font="Helvetica", size=9, leading=12, color=NAVY):
    c.setFont(font, size)
    c.setFillColor(color)
    words = text.split()
    lines, line = [], ""
    for w in words:
        trial = (line + " " + w).strip()
        if c.stringWidth(trial, font, size) <= max_width:
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


def table(c, x, y, col_widths, rows, header=True, font_size=7.5, row_h=6.2 * mm):
    """rows: list of list of cell strings. Returns y after table."""
    total_w = sum(col_widths)
    # header
    c.setFillColor(NAVY)
    c.rect(x, y - row_h, total_w, row_h, fill=1, stroke=0)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", font_size)
    cx = x
    for i, w in enumerate(col_widths):
        txt = str(rows[0][i]) if rows else ""
        c.drawString(cx + 1.5 * mm, y - row_h + 2 * mm, _fit(c, txt, w - 2.5 * mm, "Helvetica-Bold", font_size))
        cx += w
    y -= row_h

    for r_i, row in enumerate(rows[1:]):
        bg = LIGHT if r_i % 2 == 0 else white
        # total row highlight
        if str(row[0]).upper() in ("TOTAL", "TOTALS", "YTD"):
            bg = Color(0xE8 / 255, 0xF8 / 255, 0xEC / 255)
        c.setFillColor(bg)
        c.rect(x, y - row_h, total_w, row_h, fill=1, stroke=0)
        c.setStrokeColor(BORDER)
        c.setLineWidth(0.3)
        c.rect(x, y - row_h, total_w, row_h, fill=0, stroke=1)

        cx = x
        for i, w in enumerate(col_widths):
            txt = str(row[i]) if i < len(row) else ""
            is_total = str(row[0]).upper() in ("TOTAL", "TOTALS", "YTD")
            c.setFont("Helvetica-Bold" if is_total else "Helvetica", font_size)
            c.setFillColor(NAVY)
            # right-align numeric-ish cols (not first)
            if i > 0 and _looks_num(txt):
                c.drawRightString(cx + w - 1.5 * mm, y - row_h + 2 * mm, _fit(c, txt, w - 2.5 * mm, c._fontname, font_size))
            else:
                c.drawString(cx + 1.5 * mm, y - row_h + 2 * mm, _fit(c, txt, w - 2.5 * mm, c._fontname, font_size))
            cx += w
        y -= row_h
    return y


def _looks_num(t):
    t = t.replace(" ", "").replace(",", "").replace(".", "").replace("R", "").replace("(", "").replace(")", "").replace("-", "")
    return t.isdigit() and len(t) > 0


def _fit(c, text, max_w, font, size):
    if c.stringWidth(text, font, size) <= max_w:
        return text
    while text and c.stringWidth(text + "…", font, size) > max_w:
        text = text[:-1]
    return text + "…" if text else ""


def build():
    c = canvas.Canvas(OUT, pagesize=A4)
    total_pages = 5

    # ========== PAGE 1: Overview + Strategy ==========
    draw_header(c, "Quick Update — Overview & Strategy", 1, total_pages)
    draw_footer(c)
    y = H - 42 * mm

    # Hero strip
    card(c, M, y, W - 2 * M, 28 * mm, NAVY)
    c.setFillColor(LIME)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(M + 5 * mm, y - 7 * mm, "TRILOGY CX SUMMARY")
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(M + 5 * mm, y - 15 * mm, "Board / Leadership Update")
    c.setFillColor(GREEN)
    c.setFont("Helvetica", 9)
    c.drawString(M + 5 * mm, y - 22 * mm, "Primary focus: GCC  ·  Secondary: BPO & AI  ·  21 October 2026")
    y -= 34 * mm

    y = section_label(c, M, y, "Overview", GREEN)
    cw = (W - 2 * M - 4 * mm) / 2
    card(c, M, y, cw, 28 * mm, LIGHT)
    card(c, M + cw + 4 * mm, y, cw, 28 * mm, LIGHT)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(M + 4 * mm, y - 6 * mm, "BPO SALES")
    wrapped_text(
        c,
        "Slower than anticipated due to delay in UK sales resources (John Devlin & Alain Meric).",
        M + 4 * mm,
        y - 12 * mm,
        cw - 8 * mm,
        size=8.5,
        leading=11,
        color=NAVY,
    )
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(M + cw + 8 * mm, y - 6 * mm, "GCC DEMAND")
    wrapped_text(
        c,
        "Demand for GCC Professional Services — clear market shift toward capability centres.",
        M + cw + 8 * mm,
        y - 12 * mm,
        cw - 8 * mm,
        size=8.5,
        leading=11,
        color=NAVY,
    )
    y -= 34 * mm

    y = section_label(c, M, y, "Strategic positioning", LIME)
    card(c, M, y, W - 2 * M, 18 * mm, NAVY)
    c.setFillColor(white)
    c.setFont("Helvetica", 9)
    wrapped_text(
        c,
        "Pivot slightly to primary focus on GCC (Global Capability Centres) and secondary on BPO and AI — following the demand cycle and differentiation.",
        M + 5 * mm,
        y - 7 * mm,
        W - 2 * M - 10 * mm,
        size=9,
        leading=12,
        color=white,
    )
    y -= 24 * mm

    bullets = [
        "AI confusion is slowing BPO decisions.",
        "GCC is in demand.",
        "Trilogy team experience is well positioned for this.",
        "BPO competitors don’t want to do GCC — not core for them.",
        "Following the demand cycle and differentiation.",
    ]
    bw = (W - 2 * M - 8 * mm) / 2
    for i, b in enumerate(bullets):
        col = i % 2
        row = i // 2
        x = M + col * (bw + 8 * mm)
        yy = y - row * 12 * mm
        c.setFillColor(GREEN if col == 0 else LIME)
        c.circle(x + 2 * mm, yy + 1.5 * mm, 1.4 * mm, fill=1, stroke=0)
        c.setFillColor(NAVY)
        c.setFont("Helvetica", 8.5)
        c.drawString(x + 6 * mm, yy, b)
    y -= 40 * mm

    # KPI strip
    y = section_label(c, M, y, "At a glance", GREEN)
    kpis = [
        ("R3m", "Bank balance"),
        ("3", "New clients won"),
        ("323", "Pipeline FTEs"),
        ("R141m", "Pipeline ACV"),
        ("R3m", "Facilities CAPEX"),
    ]
    kw = (W - 2 * M - 4 * 3 * mm) / 5
    for i, (val, label) in enumerate(kpis):
        x = M + i * (kw + 3 * mm)
        fill = GREEN if i % 2 == 0 else LIME
        card(c, x, y, kw, 22 * mm, fill)
        c.setFillColor(NAVY)
        c.setFont("Helvetica-Bold", 14)
        c.drawCentredString(x + kw / 2, y - 10 * mm, val)
        c.setFont("Helvetica", 7)
        c.drawCentredString(x + kw / 2, y - 17 * mm, label)

    c.showPage()

    # ========== PAGE 2: New deals + Pipeline ==========
    draw_header(c, "New Deals & Pipeline", 2, total_pages)
    draw_footer(c)
    y = H - 42 * mm

    y = section_label(c, M, y, "New deals — last 3 months", GREEN)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8)
    c.drawString(M, y + 2 * mm, "Trilogy won the following new clients over the past 3 months.")
    y -= 2 * mm

    deals = [
        ["Client", "Type", "Start", "Term", "Est. revenue", "Est. GM", "Comments"],
        ["Ventrica — UK", "GCC", "01/10/26", "18–36 mo", "—", "—", "35 → 150 seats over 18 months"],
        ["Medscheme", "GCC", "01/10/26", "12 mo", "R6.5m p.a.", "R3.5m p.a.", "Shared Services outsourcing opportunity"],
        ["NADClinic", "BPO", "01/08/26", "24 mo", "R100k p.m.", "R50k p.m.", "Small UK campaign; limited growth"],
    ]
    cols = [32 * mm, 14 * mm, 18 * mm, 18 * mm, 24 * mm, 22 * mm, 54 * mm]
    y = table(c, M, y, cols, deals, font_size=7.2, row_h=7.5 * mm)
    y -= 8 * mm

    y = section_label(c, M, y, "Pipeline", LIME)
    pipeline = [
        ["Deal name", "FTE", "ACV (ZAR)"],
        ["Evri", "60", "R25,200,000"],
        ["Popsa", "11", "R4,620,000"],
        ["Lightning Fibre", "8", "R3,360,000"],
        ["ITS", "25", "R10,500,000"],
        ["Synamedia", "14", "R11,433,612"],
        ["Karen Prodgers Consulting", "30", "R12,600,000"],
        ["Leyland SDM", "15", "R6,300,000"],
        ["Seraph Property Management", "8", "R3,360,000"],
        ["The Very Group", "150", "R63,000,000"],
        ["Rebel Therapies", "2", "R840,000"],
        ["TOTAL", "323", "R141,213,612"],
    ]
    # two-column visual: table + highlight cards
    left_w = 110 * mm
    y_table_start = y
    y = table(c, M, y, [70 * mm, 16 * mm, 24 * mm], pipeline, font_size=7.5, row_h=5.8 * mm)

    # side cards
    sx = M + left_w + 6 * mm
    sy = y_table_start
    card(c, sx, sy, W - M - sx, 28 * mm, NAVY)
    c.setFillColor(LIME)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(sx + 4 * mm, sy - 7 * mm, "PIPELINE TOTAL")
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(sx + 4 * mm, sy - 16 * mm, "R141.2m")
    c.setFillColor(GREEN)
    c.setFont("Helvetica", 8)
    c.drawString(sx + 4 * mm, sy - 23 * mm, "323 FTEs across 10 opportunities")

    card(c, sx, sy - 34 * mm, W - M - sx, 28 * mm, GREEN)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(sx + 4 * mm, sy - 41 * mm, "LARGEST DEAL")
    c.setFont("Helvetica-Bold", 14)
    c.drawString(sx + 4 * mm, sy - 50 * mm, "The Very Group")
    c.setFont("Helvetica", 8)
    c.drawString(sx + 4 * mm, sy - 57 * mm, "150 FTEs  ·  R63.0m ACV")

    card(c, sx, sy - 68 * mm, W - M - sx, 28 * mm, LIME)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(sx + 4 * mm, sy - 75 * mm, "GCC WINS LIVE")
    c.setFont("Helvetica-Bold", 12)
    c.drawString(sx + 4 * mm, sy - 84 * mm, "Ventrica + Medscheme")
    c.setFont("Helvetica", 8)
    c.drawString(sx + 4 * mm, sy - 91 * mm, "Both starting 01 October 2026")

    c.showPage()

    # ========== PAGE 3: Cash flow + Budget ==========
    draw_header(c, "Cash Flow & Budget Variance", 3, total_pages)
    draw_footer(c)
    y = H - 42 * mm

    y = section_label(c, M, y, "Cash flow highlights", GREEN)
    card(c, M, y, 55 * mm, 20 * mm, GREEN)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(M + 4 * mm, y - 6 * mm, "BANK BALANCE")
    c.setFont("Helvetica-Bold", 18)
    c.drawString(M + 4 * mm, y - 15 * mm, "R3.0m")

    card(c, M + 60 * mm, y, W - M - (M + 60 * mm), 20 * mm, LIGHT)
    wrapped_text(
        c,
        "YTD performance is behind original BPO growth estimates. Actuals hold a flat revenue run-rate while projected ramp assumed faster UK BPO conversion. Variance remains positive overall YTD despite recent monthly pressure.",
        M + 64 * mm,
        y - 7 * mm,
        W - M - (M + 64 * mm) - 4 * mm,
        size=8,
        leading=10,
        color=NAVY,
    )
    y -= 26 * mm

    y = section_label(c, M, y, "Budget variance — Projected (Jan–Sep 2026 + YTD)", LIME)
    # Compact projected key rows
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "YTD"]
    proj = [
        ["", *months],
        ["Revenue", "0.43", "1.23", "2.02", "2.04", "2.09", "2.95", "3.77", "3.77", "4.11", "22.40"],
        ["GM", "0.33", "(1.26)", "(0.49)", "0.89", "0.97", "(0.05)", "0.51", "1.86", "2.11", "4.86"],
        ["EBITDA", "(1.69)", "(2.68)", "(2.08)", "(0.60)", "(0.53)", "(1.67)", "(2.03)", "(0.04)", "0.14", "(11.20)"],
    ]
    # widths
    label_w = 18 * mm
    mw = (W - 2 * M - label_w) / 10
    cols = [label_w] + [mw] * 10
    # note units
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7)
    c.drawString(M, y + 1 * mm, "Figures in R millions")
    y -= 1 * mm
    y = table(c, M, y, cols, proj, font_size=6.5, row_h=5.5 * mm)
    y -= 6 * mm

    y = section_label(c, M, y, "Budget variance — Actuals (Jan–Sep 2026 + YTD)", GREEN)
    act = [
        ["", *months],
        ["Revenue", "0.59", "0.59", "0.59", "0.59", "0.59", "0.59", "0.59", "0.59", "0.59", "5.29"],
        ["GM", "0.59", "0.59", "0.59", "0.59", "0.59", "0.59", "0.59", "0.59", "0.59", "5.29"],
        ["Overheads", "1.33", "1.33", "1.33", "1.33", "1.33", "1.33", "1.33", "1.33", "1.33", "12.00"],
        ["EBITDA", "(0.75)", "(0.75)", "(0.75)", "(0.75)", "(0.75)", "(0.75)", "(0.75)", "(0.75)", "(0.75)", "(6.71)"],
        ["Variance", "0.95", "1.94", "1.34", "(0.14)", "(0.22)", "0.93", "1.29", "(0.70)", "(0.89)", "4.49"],
    ]
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7)
    c.drawString(M, y + 1 * mm, "Figures in R millions  ·  Variance = Actual EBITDA vs Projected EBITDA")
    y -= 1 * mm
    y = table(c, M, y, cols, act, font_size=6.5, row_h=5.5 * mm)
    y -= 8 * mm

    # Callout cards
    card(c, M, y, (W - 2 * M - 6 * mm) / 2, 24 * mm, NAVY)
    c.setFillColor(LIME)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(M + 4 * mm, y - 7 * mm, "YTD VARIANCE")
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(M + 4 * mm, y - 16 * mm, "+R4.49m")
    c.setFillColor(GREEN)
    c.setFont("Helvetica", 8)
    c.drawString(M + 4 * mm, y - 21 * mm, "Actual EBITDA better than projected YTD")

    card(c, M + (W - 2 * M - 6 * mm) / 2 + 6 * mm, y, (W - 2 * M - 6 * mm) / 2, 24 * mm, LIGHT)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(M + (W - 2 * M - 6 * mm) / 2 + 10 * mm, y - 7 * mm, "YTD ACTUAL EBITDA")
    c.setFont("Helvetica-Bold", 16)
    c.drawString(M + (W - 2 * M - 6 * mm) / 2 + 10 * mm, y - 16 * mm, "(R6.71m)")
    c.setFont("Helvetica", 8)
    c.setFillColor(MUTED)
    c.drawString(M + (W - 2 * M - 6 * mm) / 2 + 10 * mm, y - 21 * mm, "Projected YTD EBITDA was (R11.20m)")

    c.showPage()

    # ========== PAGE 4: New revenues + Risks ==========
    draw_header(c, "New Revenues & Risk Mitigation", 4, total_pages)
    draw_footer(c)
    y = H - 42 * mm

    y = section_label(c, M, y, "New revenues coming online (Oct-26 → Jun-27)", GREEN)
    rev_months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    newrev = [
        ["", *rev_months],
        ["Ventrica", "450", "450", "450", "450", "450", "450", "450", "450", "450"],
        ["Synamedia", "—", "—", "—", "295", "295", "295", "295", "295", "295"],
        ["Medscheme Local", "195", "195", "195", "—", "—", "—", "—", "—", "—"],
        ["Medscheme Intl", "246", "246", "246", "82", "82", "82", "82", "82", "82"],
        ["TOTAL", "891", "891", "891", "827", "827", "827", "827", "827", "827"],
    ]
    label_w = 32 * mm
    mw = (W - 2 * M - label_w) / 9
    cols = [label_w] + [mw] * 9
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7)
    c.drawString(M, y + 1 * mm, "Figures in R thousands per month")
    y -= 1 * mm
    y = table(c, M, y, cols, newrev, font_size=7, row_h=6 * mm)
    y -= 8 * mm

    # highlight
    card(c, M, y, W - 2 * M, 16 * mm, LIME)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(M + 4 * mm, y - 6 * mm, "Near-term run-rate")
    c.setFont("Helvetica", 8.5)
    c.drawString(M + 4 * mm, y - 12 * mm, "Oct–Dec 2026: ~R891k / month   ·   Jan–Jun 2027: ~R827k / month as Medscheme mix shifts")
    y -= 22 * mm

    y = section_label(c, M, y, "Risks & reasons for YTD revenue gap", LIME)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8)
    wrapped_text(
        c,
        "Three fundamental challenges to meeting original growth estimates for BPO offshoring services:",
        M,
        y + 1 * mm,
        W - 2 * M,
        size=8,
        leading=10,
        color=MUTED,
    )
    y -= 4 * mm

    risks = [
        (
            "01",
            "UK sales onboarding delays",
            "Delays onboarding John Devlin & Alain Meric due to trade-restraint legal situations.",
            "Mitigation: Kobus meeting other sales resources and the CEO of UK BPO iQX (week of 27 Oct) to establish a wholesale/retail pricing partnership leveraging their sales and contracting capability.",
        ),
        (
            "02",
            "Start-up perception",
            "Seen as a start-up with limited balance sheet, scale and client references.",
            "Mitigation: Finalising a JV (SPV) with DSG South Africa for a joint go-to-market strategy to strengthen procurement credentials (not in all cases).",
        ),
        (
            "03",
            "UK contracting preference",
            "Cyber-security diligence is pushing UK buyers to contract with a UK entity, not directly with an SA company.",
            "Mitigation: Meetings with Ventrica and iQX (week of 27 Oct) to establish a UK contracting partnership — similar early-warning signals over the past 6 months.",
        ),
    ]
    for num, title, problem, mitigation in risks:
        card(c, M, y, W - 2 * M, 36 * mm, LIGHT)
        c.setFillColor(GREEN)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(M + 4 * mm, y - 9 * mm, num)
        c.setFillColor(NAVY)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(M + 14 * mm, y - 8 * mm, title)
        wrapped_text(c, problem, M + 14 * mm, y - 14 * mm, W - 2 * M - 18 * mm, size=8, leading=10, color=NAVY)
        c.setFillColor(GREEN)
        c.setFont("Helvetica-Bold", 7.5)
        c.drawString(M + 14 * mm, y - 26 * mm, "MITIGATION")
        wrapped_text(c, mitigation, M + 14 * mm, y - 31 * mm, W - 2 * M - 18 * mm, size=7.5, leading=9.5, color=MUTED)
        y -= 40 * mm

    c.showPage()

    # ========== PAGE 5: Facilities + Strategic options ==========
    draw_header(c, "Facilities & Strategic Options", 5, total_pages)
    draw_footer(c)
    y = H - 42 * mm

    y = section_label(c, M, y, "Facilities", GREEN)
    card(c, M, y, (W - 2 * M - 4 * mm) / 2, 32 * mm, LIGHT)
    card(c, M + (W - 2 * M - 4 * mm) / 2 + 4 * mm, y, (W - 2 * M - 4 * mm) / 2, 32 * mm, NAVY)
    cw = (W - 2 * M - 4 * mm) / 2
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(M + 4 * mm, y - 7 * mm, "CURRENT")
    wrapped_text(
        c,
        "Renting shared office space at Old Mutual Park, Pinelands.",
        M + 4 * mm,
        y - 14 * mm,
        cw - 8 * mm,
        size=8.5,
        leading=11,
        color=NAVY,
    )
    c.setFillColor(LIME)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(M + cw + 8 * mm, y - 7 * mm, "NEXT — BUILD-OUT")
    c.setFillColor(white)
    wrapped_text(
        c,
        "First contact centre / back office at Boulevard Office Park, Woodstock — to house new contracts and HQ.",
        M + cw + 8 * mm,
        y - 14 * mm,
        cw - 8 * mm,
        size=8.5,
        leading=11,
        color=white,
    )
    y -= 38 * mm

    y = section_label(c, M, y, "CAPEX for build-out", LIME)
    card(c, M, y, W - 2 * M, 26 * mm, GREEN)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(M + 5 * mm, y - 12 * mm, "R3.0m")
    c.setFont("Helvetica-Bold", 9)
    c.drawString(M + 35 * mm, y - 8 * mm, "Estimated CAPEX")
    c.setFont("Helvetica", 8.5)
    wrapped_text(
        c,
        "Build-out starts 1 November 2026, dependent on contract negotiations with Medscheme (sub-lease) and Redefine (long lease).",
        M + 35 * mm,
        y - 14 * mm,
        W - 2 * M - 40 * mm,
        size=8.5,
        leading=11,
        color=NAVY,
    )
    y -= 32 * mm

    y = section_label(c, M, y, "Strategic options / discussions", GREEN)
    options = [
        (
            "01",
            "GCC focus",
            "Build 2,000 seats over 3 years · 10,000 m² · Profit ~R2,000 per seat per month · ~75% EBIT. Requires a BUILD partner (e.g. Navigator).",
            GREEN,
        ),
        (
            "02",
            "Mango 5 acquisition",
            "R8m for ~R3m per month revenues & ~R1.2m per month GP. Value after 18 months circa R25m.",
            LIME,
        ),
        (
            "03",
            "Strategic partnership with iQX (UK)",
            "GCC for them plus a UK/SA pricing model — similar to Ascensos. Addresses sales reach and UK contracting barriers together.",
            GREEN,
        ),
    ]
    for num, title, body, accent in options:
        card(c, M, y, W - 2 * M, 28 * mm, LIGHT)
        c.setFillColor(accent)
        c.roundRect(M + 3 * mm, y - 22 * mm, 12 * mm, 12 * mm, 2 * mm, fill=1, stroke=0)
        c.setFillColor(NAVY)
        c.setFont("Helvetica-Bold", 10)
        c.drawCentredString(M + 9 * mm, y - 17 * mm, num)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(M + 20 * mm, y - 9 * mm, title)
        wrapped_text(c, body, M + 20 * mm, y - 16 * mm, W - 2 * M - 24 * mm, size=8.5, leading=11, color=NAVY)
        y -= 32 * mm

    # closing strip
    card(c, M, y, W - 2 * M, 20 * mm, NAVY)
    c.setFillColor(LIME)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(M + 5 * mm, y - 7 * mm, "NEXT ACTIONS")
    c.setFillColor(white)
    c.setFont("Helvetica", 8.5)
    c.drawString(M + 5 * mm, y - 14 * mm, "iQX / Ventrica partnership talks (w/c 27 Oct)  ·  DSG JV finalisation  ·  Woodstock build-out from 1 Nov")

    c.save()
    print("Saved", OUT, os.path.getsize(OUT))


if __name__ == "__main__":
    build()

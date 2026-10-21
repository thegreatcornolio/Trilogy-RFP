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


def build():
    c = canvas.Canvas(OUT, pagesize=A4)
    total = 4  # full content, packed into 4 tighter pages

    # ========== PAGE 1: Overview + Strategy + Deals ==========
    draw_header(c, "Quick Update — Overview, Strategy & New Deals", 1, total)
    draw_footer(c)
    y = H - 29 * mm

    card(c, M, y, W - 2 * M, 14 * mm, NAVY)
    c.setFillColor(LIME)
    c.setFont("Helvetica-Bold", 7)
    c.drawString(M + 3.5 * mm, y - 4.5 * mm, "TRILOGY CX SUMMARY")
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(M + 3.5 * mm, y - 9.5 * mm, "Board / Leadership Update")
    c.setFillColor(GREEN)
    c.setFont("Helvetica", 7.5)
    c.drawRightString(W - M - 3.5 * mm, y - 9.5 * mm, "Primary: GCC  ·  Secondary: BPO & AI")
    y -= 17 * mm

    # KPI strip — smaller
    kpis = [("R3m", "Bank balance"), ("3", "New clients"), ("323", "Pipeline FTEs"), ("R141m", "Pipeline ACV"), ("R3m", "Build CAPEX")]
    kw = (W - 2 * M - 8 * mm) / 5
    for i, (val, label) in enumerate(kpis):
        x = M + i * (kw + 2 * mm)
        card(c, x, y, kw, 12 * mm, GREEN if i % 2 == 0 else LIME)
        c.setFillColor(NAVY)
        c.setFont("Helvetica-Bold", 10)
        c.drawCentredString(x + kw / 2, y - 5.5 * mm, val)
        c.setFont("Helvetica", 6)
        c.drawCentredString(x + kw / 2, y - 9.8 * mm, label)
    y -= 15 * mm

    y = section(c, M, y, "Overview", GREEN)
    cw = (W - 2 * M - 3 * mm) / 2
    card(c, M, y, cw, 16 * mm, LIGHT)
    card(c, M + cw + 3 * mm, y, cw, 16 * mm, LIGHT)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 7)
    c.drawString(M + 3 * mm, y - 4.5 * mm, "BPO SALES")
    wrap(c, "Slower than anticipated due to delay in UK sales resources (John Devlin & Alain Meric).", M + 3 * mm, y - 9 * mm, cw - 6 * mm, size=7.2, leading=9)
    c.setFont("Helvetica-Bold", 7)
    c.setFillColor(NAVY)
    c.drawString(M + cw + 6 * mm, y - 4.5 * mm, "GCC DEMAND")
    wrap(c, "Demand for GCC Professional Services — clear market shift toward capability centres.", M + cw + 6 * mm, y - 9 * mm, cw - 6 * mm, size=7.2, leading=9)
    y -= 19 * mm

    y = section(c, M, y, "Strategic positioning", LIME)
    card(c, M, y, W - 2 * M, 10 * mm, NAVY)
    wrap(
        c,
        "Pivot slightly to primary focus on GCC (Global Capability Centres) and secondary on BPO and AI — following the demand cycle and differentiation.",
        M + 3.5 * mm,
        y - 4 * mm,
        W - 2 * M - 7 * mm,
        size=7.5,
        leading=9.5,
        color=white,
    )
    y -= 13 * mm

    bullets = [
        "AI confusion is slowing BPO decisions.",
        "GCC is in demand.",
        "Trilogy team experience is well positioned for this.",
        "BPO competitors don’t want to do GCC — not core for them.",
        "Following the demand cycle and differentiation.",
    ]
    bw = (W - 2 * M - 6 * mm) / 2
    for i, b in enumerate(bullets):
        col, row = i % 2, i // 2
        x = M + col * (bw + 6 * mm)
        yy = y - row * 6.5 * mm
        c.setFillColor(GREEN if col == 0 else LIME)
        c.circle(x + 1.5 * mm, yy + 1.2 * mm, 1.1 * mm, fill=1, stroke=0)
        c.setFillColor(NAVY)
        c.setFont("Helvetica", 7.5)
        c.drawString(x + 5 * mm, yy, b)
    y -= 22 * mm

    y = section(c, M, y, "New deals — last 3 months", GREEN)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7)
    c.drawString(M, y + 0.5 * mm, "Trilogy won the following new clients over the past 3 months.")
    y -= 1.5 * mm
    deals = [
        ["Client", "Type", "Start", "Term", "Est. revenue", "Est. GM", "Comments"],
        ["Ventrica — UK", "GCC", "01/10/26", "18–36 mo", "—", "—", "Growing 35 → 150 seats over 18 months"],
        ["Medscheme", "GCC", "01/10/26", "12 mo", "R6.5m p.a.", "R3.5m p.a.", "Opportunity to outsource Shared Services"],
        ["NADClinic", "BPO", "01/08/26", "24 mo", "R100k p.m.", "R50k p.m.", "Small UK campaign; limited growth estimate"],
    ]
    y = table(c, M, y, [30 * mm, 12 * mm, 16 * mm, 16 * mm, 22 * mm, 20 * mm, 56 * mm], deals, font_size=6.6, row_h=5.2 * mm)
    y -= 5 * mm

    # Fill remaining space with next-actions preview rather than empty gap
    card(c, M, y, W - 2 * M, 18 * mm, LIGHT)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(M + 3.5 * mm, y - 5 * mm, "Context")
    wrap(
        c,
        "BPO offshoring growth estimates are behind plan. Cash remains at R3m. Near-term revenue is underpinned by Ventrica, Medscheme and (from Jan’27) Synamedia. Strategic response: lean into GCC demand, fix UK sales/contracting via partnerships, and stand up Woodstock capacity.",
        M + 3.5 * mm,
        y - 10 * mm,
        W - 2 * M - 7 * mm,
        size=7.2,
        leading=9.2,
        color=MUTED,
    )

    c.showPage()

    # ========== PAGE 2: Pipeline + Cash/Budget ==========
    draw_header(c, "Pipeline & Budget Variance", 2, total)
    draw_footer(c)
    y = H - 29 * mm

    y = section(c, M, y, "Pipeline", GREEN)
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
    left = 108 * mm
    y0 = y
    y = table(c, M, y, [68 * mm, 14 * mm, 26 * mm], pipeline, font_size=6.6, row_h=4.5 * mm)

    sx = M + left + 3 * mm
    sw = W - M - sx
    card(c, sx, y0, sw, 18 * mm, NAVY)
    c.setFillColor(LIME)
    c.setFont("Helvetica-Bold", 6.5)
    c.drawString(sx + 3 * mm, y0 - 5 * mm, "PIPELINE TOTAL")
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(sx + 3 * mm, y0 - 11.5 * mm, "R141.2m")
    c.setFillColor(GREEN)
    c.setFont("Helvetica", 6.5)
    c.drawString(sx + 3 * mm, y0 - 15.5 * mm, "323 FTEs · 10 opportunities")

    card(c, sx, y0 - 21 * mm, sw, 16 * mm, GREEN)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 6.5)
    c.drawString(sx + 3 * mm, y0 - 26 * mm, "LARGEST DEAL")
    c.setFont("Helvetica-Bold", 9)
    c.drawString(sx + 3 * mm, y0 - 31.5 * mm, "The Very Group")
    c.setFont("Helvetica", 6.5)
    c.drawString(sx + 3 * mm, y0 - 35.5 * mm, "150 FTEs · R63.0m ACV")

    card(c, sx, y0 - 40 * mm, sw, 16 * mm, LIME)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 6.5)
    c.drawString(sx + 3 * mm, y0 - 45 * mm, "GCC WINS LIVE")
    c.setFont("Helvetica-Bold", 9)
    c.drawString(sx + 3 * mm, y0 - 50.5 * mm, "Ventrica + Medscheme")
    c.setFont("Helvetica", 6.5)
    c.drawString(sx + 3 * mm, y0 - 54.5 * mm, "Both starting 01 Oct 2026")

    y = min(y, y0 - 58 * mm) - 4 * mm

    y = section(c, M, y, "Cash flow highlights", LIME)
    card(c, M, y, 42 * mm, 14 * mm, GREEN)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 6.5)
    c.drawString(M + 3 * mm, y - 4.5 * mm, "BANK BALANCE")
    c.setFont("Helvetica-Bold", 13)
    c.drawString(M + 3 * mm, y - 11 * mm, "R3.0m")
    card(c, M + 45 * mm, y, W - M - (M + 45 * mm), 14 * mm, LIGHT)
    wrap(
        c,
        "YTD behind original BPO growth estimates. Actuals hold a flat revenue run-rate while projected ramp assumed faster UK BPO conversion. Overall YTD variance still positive.",
        M + 48 * mm,
        y - 5 * mm,
        W - M - (M + 48 * mm) - 4 * mm,
        size=7,
        leading=8.5,
        color=NAVY,
    )
    y -= 17 * mm

    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "YTD"]
    y = section(c, M, y, "Budget variance — Projected (R millions)", GREEN)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 6)
    c.drawString(M, y + 0.3 * mm, "Jan–Sep 2026 + YTD")
    y -= 1 * mm
    proj = [
        ["", *months],
        ["Revenue", "0.43", "1.23", "2.02", "2.04", "2.09", "2.95", "3.77", "3.77", "4.11", "22.40"],
        ["GM", "0.33", "(1.26)", "(0.49)", "0.89", "0.97", "(0.05)", "0.51", "1.86", "2.11", "4.86"],
        ["EBITDA", "(1.69)", "(2.68)", "(2.08)", "(0.60)", "(0.53)", "(1.67)", "(2.03)", "(0.04)", "0.14", "(11.20)"],
    ]
    label_w = 16 * mm
    mw = (W - 2 * M - label_w) / 10
    cols = [label_w] + [mw] * 10
    y = table(c, M, y, cols, proj, font_size=6.2, row_h=4.4 * mm)
    y -= 3.5 * mm

    y = section(c, M, y, "Budget variance — Actuals (R millions)", LIME)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 6)
    c.drawString(M, y + 0.3 * mm, "Variance = Actual EBITDA vs Projected EBITDA")
    y -= 1 * mm
    act = [
        ["", *months],
        ["Revenue", "0.59", "0.59", "0.59", "0.59", "0.59", "0.59", "0.59", "0.59", "0.59", "5.29"],
        ["GM", "0.59", "0.59", "0.59", "0.59", "0.59", "0.59", "0.59", "0.59", "0.59", "5.29"],
        ["Overheads", "1.33", "1.33", "1.33", "1.33", "1.33", "1.33", "1.33", "1.33", "1.33", "12.00"],
        ["EBITDA", "(0.75)", "(0.75)", "(0.75)", "(0.75)", "(0.75)", "(0.75)", "(0.75)", "(0.75)", "(0.75)", "(6.71)"],
        ["Variance", "0.95", "1.94", "1.34", "(0.14)", "(0.22)", "0.93", "1.29", "(0.70)", "(0.89)", "4.49"],
    ]
    y = table(c, M, y, cols, act, font_size=6.2, row_h=4.4 * mm)
    y -= 4 * mm

    hw = (W - 2 * M - 3 * mm) / 2
    card(c, M, y, hw, 14 * mm, NAVY)
    c.setFillColor(LIME)
    c.setFont("Helvetica-Bold", 6.5)
    c.drawString(M + 3 * mm, y - 4.5 * mm, "YTD VARIANCE")
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(M + 3 * mm, y - 10.5 * mm, "+R4.49m")
    c.setFillColor(GREEN)
    c.setFont("Helvetica", 6.5)
    c.drawString(M + 28 * mm, y - 10.5 * mm, "Actual EBITDA better than projected")

    card(c, M + hw + 3 * mm, y, hw, 14 * mm, LIGHT)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 6.5)
    c.drawString(M + hw + 6 * mm, y - 4.5 * mm, "YTD ACTUAL EBITDA")
    c.setFont("Helvetica-Bold", 12)
    c.drawString(M + hw + 6 * mm, y - 10.5 * mm, "(R6.71m)")
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 6.5)
    c.drawString(M + hw + 38 * mm, y - 10.5 * mm, "Projected was (R11.20m)")

    c.showPage()

    # ========== PAGE 3: New revenues + Risks (compact) ==========
    draw_header(c, "New Revenues & Risk Mitigation", 3, total)
    draw_footer(c)
    y = H - 29 * mm

    y = section(c, M, y, "New revenues coming online (Oct-26 → Jun-27)", GREEN)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 6)
    c.drawString(M, y + 0.3 * mm, "Figures in R thousands per month")
    y -= 1 * mm
    rev_months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    newrev = [
        ["", *rev_months],
        ["Ventrica", "450", "450", "450", "450", "450", "450", "450", "450", "450"],
        ["Synamedia", "—", "—", "—", "295", "295", "295", "295", "295", "295"],
        ["Medscheme Local", "195", "195", "195", "—", "—", "—", "—", "—", "—"],
        ["Medscheme Intl", "246", "246", "246", "82", "82", "82", "82", "82", "82"],
        ["TOTAL", "891", "891", "891", "827", "827", "827", "827", "827", "827"],
    ]
    label_w = 30 * mm
    mw = (W - 2 * M - label_w) / 9
    y = table(c, M, y, [label_w] + [mw] * 9, newrev, font_size=6.5, row_h=4.6 * mm)
    y -= 3.5 * mm

    card(c, M, y, W - 2 * M, 10 * mm, LIME)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(M + 3.5 * mm, y - 4 * mm, "Near-term run-rate")
    c.setFont("Helvetica", 7.2)
    c.drawString(M + 3.5 * mm, y - 8 * mm, "Oct–Dec 2026: ~R891k / month    ·    Jan–Jun 2027: ~R827k / month as Medscheme mix shifts")
    y -= 14 * mm

    y = section(c, M, y, "Risks & reasons for YTD revenue gap", LIME)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7)
    wrap(
        c,
        "Three fundamental challenges to meeting original growth estimates for BPO offshoring services:",
        M,
        y + 0.5 * mm,
        W - 2 * M,
        size=7,
        leading=9,
        color=MUTED,
    )
    y -= 2 * mm

    # Compact risk rows — not huge stacked cards
    risks = [
        (
            "01",
            "UK sales onboarding delays",
            "Delays onboarding John Devlin & Alain Meric due to trade-restraint legal situations.",
            "Kobus meeting other sales resources and the CEO of UK BPO iQX (week of 27 Oct) to establish a wholesale/retail pricing partnership leveraging their sales and contracting capability.",
        ),
        (
            "02",
            "Start-up perception",
            "Seen as a start-up with limited balance sheet, scale and client references.",
            "Finalising a JV (SPV) with DSG South Africa for a joint go-to-market strategy to strengthen procurement credentials (not in all cases).",
        ),
        (
            "03",
            "UK contracting preference",
            "Cyber-security diligence is pushing UK buyers to contract with a UK entity, not directly with an SA company.",
            "Meetings with Ventrica and iQX (week of 27 Oct) to establish a UK contracting partnership — similar early-warning signals over the past 6 months.",
        ),
    ]
    for num, title, problem, mitigation in risks:
        card(c, M, y, W - 2 * M, 28 * mm, LIGHT)
        c.setFillColor(GREEN)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(M + 3 * mm, y - 5.5 * mm, num)
        c.setFillColor(NAVY)
        c.setFont("Helvetica-Bold", 8.5)
        c.drawString(M + 12 * mm, y - 5.5 * mm, title)
        wrap(c, problem, M + 12 * mm, y - 10.5 * mm, W - 2 * M - 16 * mm, size=7.2, leading=9)
        c.setFillColor(GREEN)
        c.setFont("Helvetica-Bold", 6.5)
        c.drawString(M + 12 * mm, y - 19 * mm, "MITIGATION")
        wrap(c, mitigation, M + 12 * mm, y - 23.5 * mm, W - 2 * M - 16 * mm, size=7, leading=8.8, color=MUTED)
        y -= 30.5 * mm

    c.showPage()

    # ========== PAGE 4: Facilities + Options ==========
    draw_header(c, "Facilities & Strategic Options", 4, total)
    draw_footer(c)
    y = H - 29 * mm

    y = section(c, M, y, "Facilities", GREEN)
    cw = (W - 2 * M - 3 * mm) / 2
    card(c, M, y, cw, 22 * mm, LIGHT)
    card(c, M + cw + 3 * mm, y, cw, 22 * mm, NAVY)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(M + 3 * mm, y - 5 * mm, "CURRENT")
    wrap(c, "Renting shared office space at the Old Mutual Park building in Pinelands.", M + 3 * mm, y - 10.5 * mm, cw - 6 * mm, size=7.5, leading=9.5)
    c.setFillColor(LIME)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(M + cw + 6 * mm, y - 5 * mm, "NEXT — BUILD-OUT")
    wrap(
        c,
        "First contact centre / back office at Boulevard Office Park, Woodstock — to house the above contracts and HQ.",
        M + cw + 6 * mm,
        y - 10.5 * mm,
        cw - 6 * mm,
        size=7.5,
        leading=9.5,
        color=white,
    )
    y -= 26 * mm

    y = section(c, M, y, "CAPEX for build-out", LIME)
    card(c, M, y, W - 2 * M, 16 * mm, GREEN)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(M + 4 * mm, y - 10 * mm, "R3.0m")
    c.setFont("Helvetica-Bold", 8)
    c.drawString(M + 28 * mm, y - 5.5 * mm, "Estimated CAPEX")
    wrap(
        c,
        "Build-out starts 1 November 2026, dependent on contract negotiations with Medscheme (sub-lease) and Redefine (long lease).",
        M + 28 * mm,
        y - 10.5 * mm,
        W - 2 * M - 32 * mm,
        size=7.5,
        leading=9.5,
        color=NAVY,
    )
    y -= 20 * mm

    y = section(c, M, y, "Strategic options / discussions", GREEN)
    options = [
        ("01", "GCC focus", "Require building 2,000 seats over 3 years. 10,000 m². Profit of R2,000 per seat per month. 75% EBIT. Require a BUILD partner such as Navigator."),
        ("02", "Mango 5 acquisition", "R8m for R3m per month revenues & R1.2m per month GP. Value after 18 months circa R25m."),
        ("03", "Strategic partnership / deal with iQX in UK", "GCC for them and a UK/SA pricing model. Similar to Ascensos — addresses sales reach and UK contracting together."),
    ]
    for num, title, body in options:
        accent = GREEN if num != "02" else LIME
        card(c, M, y, W - 2 * M, 18 * mm, LIGHT)
        c.setFillColor(accent)
        c.roundRect(M + 2.5 * mm, y - 13.5 * mm, 9 * mm, 9 * mm, 1.5 * mm, fill=1, stroke=0)
        c.setFillColor(NAVY)
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(M + 7 * mm, y - 10.2 * mm, num)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(M + 15 * mm, y - 5.5 * mm, title)
        wrap(c, body, M + 15 * mm, y - 10.5 * mm, W - 2 * M - 19 * mm, size=7.5, leading=9.5, color=MUTED)
        y -= 20 * mm

    y -= 2 * mm
    card(c, M, y, W - 2 * M, 14 * mm, NAVY)
    c.setFillColor(LIME)
    c.setFont("Helvetica-Bold", 7)
    c.drawString(M + 3.5 * mm, y - 4.5 * mm, "NEXT ACTIONS")
    c.setFillColor(white)
    c.setFont("Helvetica", 7.5)
    wrap(
        c,
        "iQX / Ventrica partnership talks (w/c 27 Oct)  ·  DSG JV finalisation  ·  Woodstock build-out from 1 Nov 2026",
        M + 3.5 * mm,
        y - 9.5 * mm,
        W - 2 * M - 7 * mm,
        size=7.5,
        leading=9.5,
        color=white,
    )
    y -= 18 * mm

    # Fill remaining page with a compact reminder strip instead of empty gap
    card(c, M, y, W - 2 * M, 28 * mm, LIGHT)
    c.setFillColor(NAVY)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(M + 3.5 * mm, y - 5.5 * mm, "Summary")
    wrap(
        c,
        "Lean into GCC demand (Ventrica + Medscheme live). Close UK sales and contracting gaps via iQX/Ventrica partnerships and the DSG JV. Protect cash while standing up Woodstock capacity (R3m CAPEX from 1 Nov). Keep optionality on GCC scale-up (Navigator), Mango 5 and the iQX UK model.",
        M + 3.5 * mm,
        y - 11 * mm,
        W - 2 * M - 7 * mm,
        size=7.5,
        leading=9.5,
        color=MUTED,
    )

    c.save()
    print("Saved", OUT, os.path.getsize(OUT))


if __name__ == "__main__":
    build()

import { jsPDF } from "jspdf";

const MARGIN = 28;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BOTTOM_MARGIN = 35;
const MAX_Y = PAGE_HEIGHT - BOTTOM_MARGIN;
const LINE_HEIGHT = 6;
const SECTION_GAP = 16;
const ORANGE = [249, 115, 22];
const DARK = [40, 40, 40];
const GRAY = [90, 90, 90];
const LIGHT_GRAY = [130, 130, 130];
const BORDER = [220, 220, 220];

function checkPageBreak(doc, y, needed) {
  if (y + needed > MAX_Y) {
    doc.addPage();
    doc.setFontSize(8);
    doc.setTextColor(...LIGHT_GRAY);
    doc.text("LUME · Market Research Report", MARGIN, 14);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, 18, PAGE_WIDTH - MARGIN, 18);
    return 28;
  }
  return y;
}

function addSectionTitle(doc, title, y) {
  y = checkPageBreak(doc, y, 25);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...ORANGE);
  doc.text(title.toUpperCase(), MARGIN, y);
  doc.setFont("helvetica", "normal");
  doc.setDrawColor(...ORANGE);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y + 3, MARGIN + 25, y + 3);
  return y + 14;
}

function addText(doc, text, x, y, maxWidth, fontSize = 9) {
  doc.setFontSize(fontSize);
  const lines = doc.splitTextToSize(text || "", maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * LINE_HEIGHT;
}

function addLabelValue(doc, label, value, y) {
  const labelWidth = 42;
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(label + ":", MARGIN, y);
  doc.setTextColor(...DARK);
  const valueLines = doc.splitTextToSize(String(value || "—"), CONTENT_WIDTH - labelWidth - 4);
  doc.text(valueLines, MARGIN + labelWidth, y);
  return y + Math.max(LINE_HEIGHT, valueLines.length * LINE_HEIGHT) + 4;
}

function addBulletList(doc, items, y, maxWidth = CONTENT_WIDTH - 6) {
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  items.forEach((item) => {
    const lines = doc.splitTextToSize("• " + item, maxWidth);
    doc.text(lines, MARGIN + 4, y);
    y += lines.length * LINE_HEIGHT + 3;
  });
  return y + 6;
}

function addHighlightBox(doc, content, y) {
  const lines = doc.splitTextToSize(content, CONTENT_WIDTH - 16);
  const boxHeight = Math.max(20, lines.length * LINE_HEIGHT + 14);
  y = checkPageBreak(doc, y, boxHeight + 8);

  doc.setFillColor(253, 248, 243);
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.2);
  doc.rect(MARGIN, y, CONTENT_WIDTH, boxHeight, "FD");
  doc.setDrawColor(...ORANGE);
  doc.setLineWidth(1);
  doc.line(MARGIN, y, MARGIN + 4, y);
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text(lines, MARGIN + 10, y + 10);
  return y + boxHeight + 12;
}

export function exportAnalysisToPdf(data) {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const sm = data?.summary || {};
  const m = data?.market || {};
  const c = data?.competitors || {};
  const p = data?.product || {};
  const a = data?.assumptions || [];
  const leg = data?.legal || {};

  let y = 32;

  // Title block
  doc.setFillColor(15, 20, 35);
  doc.rect(0, 0, PAGE_WIDTH, 50, "F");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("LUME", MARGIN, 24);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(160, 165, 180);
  doc.text("Market Research Report", MARGIN, 32);
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  const titleLines = doc.splitTextToSize(sm.title || "Analysis", CONTENT_WIDTH);
  doc.text(titleLines, MARGIN, 43);
  y = 62;

  // Executive summary
  y = addSectionTitle(doc, "Executive Summary", y);
  y = addText(doc, sm.oneLiner || "", MARGIN, y, CONTENT_WIDTH) + 8;

  if (sm.verdict || sm.confidence) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text(`Verdict: ${sm.verdict || "—"}${sm.confidence ? ` · ${sm.confidence}% confidence` : ""}`, MARGIN, y);
    doc.setFont("helvetica", "normal");
    y += 12;
  }

  y += SECTION_GAP;

  // Market overview
  y = addSectionTitle(doc, "Market Overview", y);

  const metrics = [
    ["Global market", m.globalSize || "—"],
    ["Target market", m.targetSize || "—"],
    ["CAGR", m.cagr || "—"],
    ["Maturity", m.maturity || "—"],
  ];
  metrics.forEach(([label, val]) => {
    y = addLabelValue(doc, label, val, y);
  });
  y += 8;

  if ((m.dataPoints || []).length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text("Key data points", MARGIN, y);
    doc.setFont("helvetica", "normal");
    y += 10;
    (m.dataPoints || []).slice(0, 5).forEach((d) => {
      y = addLabelValue(doc, d.metric, d.value, y);
    });
    y += 8;
  }

  if ((m.trends || []).length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text("Trends", MARGIN, y);
    doc.setFont("helvetica", "normal");
    y += 10;
    y = addBulletList(doc, (m.trends || []).slice(0, 4).map((t) => (typeof t === "string" ? t : t.text)), y);
  }

  if ((m.risks || []).length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text("Risks", MARGIN, y);
    doc.setFont("helvetica", "normal");
    y += 10;
    y = addBulletList(doc, (m.risks || []).slice(0, 4).map((r) => (typeof r === "string" ? r : r.text)), y);
  }
  y += SECTION_GAP;

  // Competitors
  if ((c.list || []).length > 0) {
    y = addSectionTitle(doc, "Competitors", y);

    (c.list || []).forEach((x) => {
      y = checkPageBreak(doc, y, 45);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...DARK);
      doc.text(x.name, MARGIN, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...ORANGE);
      doc.text(`Threat: ${x.threat || "—"}`, MARGIN + 55, y);
      y += 8;
      doc.setFontSize(9);
      doc.setTextColor(...GRAY);
      y = addText(doc, x.desc || "", MARGIN, y, CONTENT_WIDTH) + 4;
      if (x.strengths?.length) {
        const str = (x.strengths || []).slice(0, 3).join(", ");
        y = addText(doc, "Strengths: " + str, MARGIN + 4, y, CONTENT_WIDTH - 8, 8) + 2;
      }
      if (x.weaknesses?.length) {
        const wkn = (x.weaknesses || []).slice(0, 3).join(", ");
        y = addText(doc, "Weaknesses: " + wkn, MARGIN + 4, y, CONTENT_WIDTH - 8, 8) + 2;
      }
      y += 12;
    });

    if (c.gaps?.length) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...DARK);
      doc.text("Market gaps", MARGIN, y);
      doc.setFont("helvetica", "normal");
      y += 10;
      y = addText(doc, (c.gaps || []).join(". "), MARGIN, y, CONTENT_WIDTH) + 8;
    }
    y += SECTION_GAP;
  }

  // Product
  if (p.audience || p.priceRange) {
    y = addSectionTitle(doc, "Product & GTM", y);

    const prodMetrics = [
      ["Target audience", p.audience],
      ["Audience size", p.audienceSize],
      ["Price range", p.priceRange],
      ["Suggested price", p.suggestedPrice],
    ];
    prodMetrics.forEach(([label, val]) => {
      if (val) y = addLabelValue(doc, label, val, y);
    });
    y += 8;

    if (p.painPoints?.length) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...DARK);
      doc.text("Pain points", MARGIN, y);
      doc.setFont("helvetica", "normal");
      y += 10;
      y = addBulletList(doc, (p.painPoints || []).slice(0, 5), y);
    }

    if (p.gtm?.length) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...DARK);
      doc.text("Go-to-market", MARGIN, y);
      doc.setFont("helvetica", "normal");
      y += 10;
      (p.gtm || []).slice(0, 5).forEach((s, i) => {
        doc.setFontSize(9);
        doc.setTextColor(...GRAY);
        doc.text(`${i + 1}.`, MARGIN, y);
        doc.setTextColor(...DARK);
        const lines = doc.splitTextToSize(s, CONTENT_WIDTH - 12);
        doc.text(lines, MARGIN + 10, y);
        y += lines.length * LINE_HEIGHT + 5;
      });
      y += 8;
    }
    y += SECTION_GAP;
  }

  // Assumptions
  if (a.length > 0) {
    y = addSectionTitle(doc, "Assumption Chain", y);

    a.forEach((s) => {
      y = checkPageBreak(doc, y, 55);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...ORANGE);
      doc.text(`Step ${s.step}`, MARGIN, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GRAY);
      doc.text(s.confidence || "", MARGIN + 30, y);
      y += 8;
      doc.setFontSize(9);
      doc.setTextColor(...DARK);
      y = addText(doc, "Verified: " + (s.verified || ""), MARGIN, y, CONTENT_WIDTH) + 4;
      y = addText(doc, "Assumption: " + (s.assumption || ""), MARGIN + 4, y, CONTENT_WIDTH - 4) + 12;
    });
    y += SECTION_GAP;
  }

  // Footer
  y = checkPageBreak(doc, y, 40);
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 12;
  doc.setFontSize(8);
  doc.setTextColor(...LIGHT_GRAY);
  doc.text("AI-generated content. Verify independently. Not legal advice. See lume.app/legal", MARGIN, y);
  y += 8;
  if (leg.keyTakeaway) {
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    y = addText(doc, leg.keyTakeaway, MARGIN, y, CONTENT_WIDTH);
  }

  // Page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...LIGHT_GRAY);
    doc.text(`Page ${i} of ${totalPages}`, PAGE_WIDTH / 2, PAGE_HEIGHT - 12, { align: "center" });
  }

  return doc.output("blob");
}

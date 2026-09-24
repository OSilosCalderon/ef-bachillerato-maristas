export type PlanPdfSection = { title: string; lines: string[] };
export type PlanPdfData = {
  studentName: string;
  courseLabel: string;
  group: string;
  status: string;
  capacity: string;
  sections: PlanPdfSection[];
};

type PdfItem = { kind: "section" | "text" | "session" | "exercise" | "spacer"; lines: string[]; height: number; section: number };

const PAGE_HEIGHT = 842;
const BOTTOM = 56;
const MARISTAS_LOGO_JPEG = "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";

function normalize(text: string) {
  return text.replaceAll("\u2011", "-").replaceAll("\u2013", "-").replaceAll("\u2014", "-").replaceAll("\u2192", "->").replaceAll("\u00b7", "-");
}

function winAnsiHex(text: string) {
  const extra: Record<string, number> = { "€": 128, "‚": 130, "ƒ": 131, "„": 132, "…": 133, "†": 134, "‡": 135, "ˆ": 136, "‰": 137, "Š": 138, "‹": 139, "Œ": 140, "Ž": 142, "‘": 145, "’": 146, "“": 147, "”": 148, "•": 149, "–": 150, "—": 151, "˜": 152, "™": 153, "š": 154, "›": 155, "œ": 156, "ž": 158, "Ÿ": 159 };
  return Array.from(normalize(text)).map((char) => {
    const code = extra[char] ?? char.charCodeAt(0);
    return (code <= 255 ? code : 63).toString(16).padStart(2, "0");
  }).join("");
}

function wrap(text: string, limit: number) {
  const words = normalize(text || "Sin completar").trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > limit && current) { lines.push(current); current = word; }
    else current = next;
  }
  if (current) lines.push(current);
  return lines.length ? lines : ["Sin completar"];
}

function paginate(data: PlanPdfData) {
  const source: PdfItem[] = [];
  data.sections.forEach((section, sectionIndex) => {
    source.push({ kind: "section", lines: [section.title], height: 34, section: sectionIndex });
    section.lines.forEach((paragraph) => {
      const session = paragraph.startsWith("• ");
      const exercise = /^\s*\d+\./.test(paragraph);
      const lines = wrap(paragraph.replace(/^•\s*/, ""), session ? 72 : exercise ? 78 : 86);
      const kind: PdfItem["kind"] = session ? "session" : exercise ? "exercise" : "text";
      const padding = kind === "session" ? 22 : kind === "exercise" ? 14 : 12;
      source.push({ kind, lines, height: lines.length * 13 + padding, section: sectionIndex });
    });
    source.push({ kind: "spacer", lines: [], height: 8, section: sectionIndex });
  });
  const pages: PdfItem[][] = [[]];
  let y = 618;
  for (const item of source) {
    if (y - item.height < BOTTOM) { pages.push([]); y = 738; }
    pages.at(-1)!.push(item);
    y -= item.height;
  }
  return pages;
}

export function buildPersonalPlanPdf(data: PlanPdfData) {
  const pages = paginate(data);
  const logo = atob(MARISTAS_LOGO_JPEG);
  const logoHex = Array.from(logo, (character) => character.charCodeAt(0).toString(16).padStart(2, "0")).join("");
  const pageIds = pages.map((_, index) => 7 + index * 3);
  const objects = new Map<number, string>();
  objects.set(1, "<< /Type /Catalog /Pages 2 0 R >>");
  objects.set(2, `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`);
  objects.set(3, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  objects.set(4, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  pages.forEach((items, index) => {
    const imageId = 5 + index * 3;
    const contentId = 6 + index * 3;
    const pageId = 7 + index * 3;
    objects.set(imageId, `<< /Type /XObject /Subtype /Image /Width 360 /Height 120 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter [/ASCIIHexDecode /DCTDecode] /Length ${logoHex.length + 1} >>\nstream\n${logoHex}>\nendstream`);
    let y = index === 0 ? 618 : 738;
    const commands = [
      "0.04 0.16 0.20 rg 0 756 595 86 re f",
      "0.96 0.35 0.53 rg 0 756 12 86 re f",
      "1 1 1 rg 404 780 151 50 re f",
      "q 126 0 0 42 416 784 cm /Logo Do Q",
      `BT /F2 ${index === 0 ? 24 : 16} Tf 34 ${index === 0 ? 797 : 792} Td <${winAnsiHex(index === 0 ? "PLAN PERSONAL" : "PLAN PERSONAL - CONTINUACIÓN")}> Tj ET`,
      `BT /F1 10 Tf 35 ${index === 0 ? 777 : 773} Td <${winAnsiHex(index === 0 ? "SA1 · Entrena con propósito" : `${data.studentName} · ${data.courseLabel}`)}> Tj ET`,
    ];
    if (index === 0) {
      commands.push(
        "0.96 0.97 0.98 rg 34 640 521 92 re f",
        "0.08 0.18 0.24 rg",
        `BT /F2 17 Tf 49 705 Td <${winAnsiHex(data.studentName)}> Tj ET`,
        `BT /F1 10 Tf 49 686 Td <${winAnsiHex(`${data.courseLabel} · ${data.group}`)}> Tj ET`,
        "0.90 0.95 0.94 rg 49 648 150 32 re f",
        "0.99 0.92 0.95 rg 211 648 150 32 re f",
        "0.92 0.95 0.99 rg 373 648 167 32 re f",
        "0.04 0.34 0.31 rg",
        `BT /F2 7 Tf 59 669 Td <${winAnsiHex("ESTADO")}> Tj ET`,
        `BT /F2 9 Tf 59 655 Td <${winAnsiHex(data.status)}> Tj ET`,
        "0.60 0.12 0.30 rg",
        `BT /F2 7 Tf 221 669 Td <${winAnsiHex("CAPACIDAD PRIORITARIA")}> Tj ET`,
        `BT /F2 9 Tf 221 655 Td <${winAnsiHex(data.capacity)}> Tj ET`,
        "0.12 0.28 0.48 rg",
        `BT /F2 7 Tf 383 669 Td <${winAnsiHex("DOCUMENTO")}> Tj ET`,
        `BT /F2 9 Tf 383 655 Td <${winAnsiHex("Hoja de ruta personal")}> Tj ET`,
      );
    }
    for (const item of items) {
      if (item.kind === "spacer") { y -= item.height; continue; }
      if (item.kind === "section") {
        const colors = ["0.04 0.45 0.42", "0.16 0.36 0.62", "0.91 0.31 0.49", "0.91 0.55 0.18", "0.33 0.27 0.58"];
        commands.push(`${colors[item.section % colors.length]} rg 34 ${y - 27} 521 27 re f`, "1 1 1 rg", `BT /F2 13 Tf 47 ${y - 18} Td <${winAnsiHex(item.lines[0])}> Tj ET`);
        y -= item.height;
        continue;
      }
      const boxY = y - item.height + 5;
      if (item.kind === "session") commands.push("0.91 0.97 0.95 rg", `34 ${boxY} 521 ${item.height - 4} re f`, "0.04 0.45 0.42 rg", `34 ${boxY} 6 ${item.height - 4} re f`);
      if (item.kind === "exercise") commands.push("0.94 0.96 0.99 rg", `50 ${boxY} 505 ${item.height - 4} re f`);
      const x = item.kind === "exercise" ? 61 : 48;
      const font = item.kind === "session" ? "F2" : "F1";
      const size = item.kind === "session" ? 10 : 9;
      const color = item.kind === "session" ? "0.04 0.30 0.28" : "0.10 0.16 0.20";
      commands.push(`${color} rg`);
      item.lines.forEach((line, lineIndex) => commands.push(`BT /${font} ${size} Tf ${x} ${y - 17 - lineIndex * 13} Td <${winAnsiHex(line)}> Tj ET`));
      y -= item.height;
    }
    commands.push("0.82 0.86 0.88 RG 0.8 w 34 45 m 555 45 l S", "0.36 0.42 0.45 rg", `BT /F1 8 Tf 34 28 Td <${winAnsiHex("Educación Física · Maristas Badajoz · Documento personal de trabajo")}> Tj ET`, `BT /F2 8 Tf 515 28 Td <${winAnsiHex(`${index + 1} / ${pages.length}`)}> Tj ET`);
    const stream = commands.join("\n");
    objects.set(contentId, `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    objects.set(pageId, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /XObject << /Logo ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);
  });
  const lastId = 4 + pages.length * 3;
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let id = 1; id <= lastId; id++) { offsets[id] = pdf.length; pdf += `${id} 0 obj\n${objects.get(id)}\nendobj\n`; }
  const xref = pdf.length;
  pdf += `xref\n0 ${lastId + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= lastId; id++) pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${lastId + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Uint8Array.from(pdf, (character) => character.charCodeAt(0));
}

export function downloadPersonalPlanPdf(data: PlanPdfData) {
  const bytes = buildPersonalPlanPdf(data);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeName = normalize(data.studentName).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
  link.href = url;
  link.download = `plan-personal-sa1-${safeName || "alumno"}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

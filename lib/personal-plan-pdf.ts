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
  data.sections.filter((section) => !/reflexión final/i.test(section.title)).forEach((section, sectionIndex) => {
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
      "q 142 0 0 47 405 779 cm /Logo Do Q",
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

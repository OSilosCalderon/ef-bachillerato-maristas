export type PlanPdfSection = { title: string; lines: string[] };
export type PlanPdfData = {
  studentName: string;
  courseLabel: string;
  group: string;
  status: string;
  capacity: string;
  sections: PlanPdfSection[];
};

type PdfLine = { text: string; bold?: boolean; size?: number; gap?: number };

const PAGE_HEIGHT = 842;
const TOP = 790;
const BOTTOM = 56;

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
  const source: PdfLine[] = [
    { text: "EDUCACIÓN FÍSICA - MARISTAS BADAJOZ", bold: true, size: 9, gap: 15 },
    { text: "Plan personal - SA1", bold: true, size: 22, gap: 29 },
    { text: `${data.studentName} - ${data.courseLabel}`, bold: true, size: 12, gap: 19 },
    { text: `Grupo: ${data.group}    Estado: ${data.status}    Capacidad: ${data.capacity}`, size: 9, gap: 25 },
  ];
  for (const section of data.sections) {
    source.push({ text: section.title, bold: true, size: 14, gap: 22 });
    for (const paragraph of section.lines) {
      const bullet = paragraph.startsWith("• ");
      for (const [index, line] of wrap(paragraph, bullet ? 88 : 94).entries()) source.push({ text: `${index > 0 && bullet ? "  " : ""}${line}`, size: 10, gap: 14 });
      source.push({ text: "", size: 4, gap: 5 });
    }
  }
  const pages: PdfLine[][] = [[]];
  let y = TOP;
  for (const line of source) {
    const gap = line.gap ?? 14;
    if (y - gap < BOTTOM) { pages.push([]); y = TOP; }
    pages.at(-1)!.push(line);
    y -= gap;
  }
  return pages;
}

export function buildPersonalPlanPdf(data: PlanPdfData) {
  const pages = paginate(data);
  const pageIds = pages.map((_, index) => 6 + index * 2);
  const objects = new Map<number, string>();
  objects.set(1, "<< /Type /Catalog /Pages 2 0 R >>");
  objects.set(2, `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`);
  objects.set(3, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  objects.set(4, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  pages.forEach((lines, index) => {
    const contentId = 5 + index * 2;
    const pageId = 6 + index * 2;
    let y = TOP;
    const commands = ["0.08 0.17 0.15 rg", "0.06 0.46 0.43 RG", "2 w", `48 812 m 547 812 l S`];
    for (const line of lines) {
      const size = line.size ?? 10;
      if (line.text) commands.push(`BT /${line.bold ? "F2" : "F1"} ${size} Tf 48 ${y} Td <${winAnsiHex(line.text)}> Tj ET`);
      y -= line.gap ?? 14;
    }
    commands.push(`BT /F1 8 Tf 48 30 Td <${winAnsiHex(`Página ${index + 1} de ${pages.length} - Generado desde la plataforma de Educación Física`)}> Tj ET`);
    const stream = commands.join("\n");
    objects.set(contentId, `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    objects.set(pageId, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`);
  });
  const lastId = 4 + pages.length * 2;
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (let id = 1; id <= lastId; id++) { offsets[id] = pdf.length; pdf += `${id} 0 obj\n${objects.get(id)}\nendobj\n`; }
  const xref = pdf.length;
  pdf += `xref\n0 ${lastId + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= lastId; id++) pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${lastId + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(pdf);
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


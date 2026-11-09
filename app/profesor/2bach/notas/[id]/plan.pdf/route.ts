import { loadSecondYearSavedPlan } from "@/lib/gradebook-server";
import { buildPersonalPlanPdf } from "@/lib/personal-plan-pdf";
import { savedPlanPdfData } from "@/lib/saved-plan-pdf";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const saved = await loadSecondYearSavedPlan(id);
  const cacheHeaders = { "Cache-Control": "private, no-store" };
  if (!saved) return new Response("No se ha encontrado un plan guardado.", { status: 404, headers: cacheHeaders });
  const pdf = buildPersonalPlanPdf(savedPlanPdfData(saved.plan, saved.student, 2));
  return new Response(pdf, {
    headers: {
      ...cacheHeaders,
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="plan-personal-2bach.pdf"',
    },
  });
}

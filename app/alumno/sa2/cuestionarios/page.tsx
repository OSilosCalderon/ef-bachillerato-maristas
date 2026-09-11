import { ClipboardCheck, LockKeyhole } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { QuestionnaireDemoPanel } from "@/components/questionnaire-demo-panel";
import { Sa2Layout } from "@/components/sa2-layout";
import { sa2Questionnaires } from "@/lib/sa2-demo-data";

export default function Page() {
  return <><DashboardHeader eyebrow="SA2 · Cuestionarios" title="Cuestionarios psicológicos" description="Motor genérico reutilizado de SA1 para cuestionarios que el profesorado añada posteriormente."/><Sa2Layout><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"><LockKeyhole className="mr-2 inline" size={17}/>No hay tests psicológicos reales predefinidos. Las respuestas individuales son privadas para alumno/a y profesorado autorizado.</div><div className="grid gap-4 md:grid-cols-2">{sa2Questionnaires.map((q) => <article key={q.id} className="card p-6"><ClipboardCheck className="text-[#1e6b4f]"/><h2 className="mt-4 text-lg font-extrabold">{q.title}</h2><p className="mt-2 text-sm text-slate-500">{q.description}</p><p className="mt-4 text-xs text-slate-500">{q.questionCount} preguntas · {q.opensAt} — {q.closesAt}</p></article>)}</div><QuestionnaireDemoPanel/></Sa2Layout></>;
}

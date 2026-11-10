"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Save, Send } from "lucide-react";
import { emptyReflection, reflectionFields, validateReflection, type ReflectionAnswer, type FinalPhysicalReflection } from "@/lib/final-physical-reflection";
import { secondYearWorkClosedMessage } from "@/lib/second-year-work-closure";

export function FinalPhysicalReflectionForm({ initial, readOnly = false }: { initial: FinalPhysicalReflection | null; readOnly?: boolean }) {
  const router = useRouter();
  const [answer, setAnswer] = useState<ReflectionAnswer>(initial ?? { ...emptyReflection });
  const [saved, setSaved] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const displayedAnswer = readOnly ? initial ?? emptyReflection : answer;
  const filled = reflectionFields.filter((field) => displayedAnswer[field.key].trim()).length;
  async function save(status: ReflectionAnswer["status"]) {
    if (readOnly || busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const payload = validateReflection({ ...answer, status });
      const response = await fetch("/api/reflexion-fisica-final", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "No se ha podido guardar tu reflexión.");
      const row = body.response as FinalPhysicalReflection | undefined;
      if (!row?.student_id || !row.updated_at || row.status !== status || reflectionFields.some((field) => row[field.key] !== payload[field.key])) throw new Error("No se ha podido confirmar el guardado. Vuelve a intentarlo.");
      setAnswer(row); setSaved(row); setDirty(false);
      setMessage(status === "submitted" ? "Reflexión enviada. Tu profesor ya puede consultarla." : "Borrador guardado. Puedes continuar más adelante.");
      router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "No se ha podido guardar. Tus respuestas siguen en pantalla."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={(event) => { event.preventDefault(); void save("submitted"); }} className="space-y-5">
    <section className="card p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-extrabold">De mis resultados a mi próximo paso</h2><span className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-bold text-[#164c3a]">{filled}/4 apartados · {Math.round(filled / 4 * 100)}%</span></div>
      <p className="mt-3 text-sm leading-6 text-slate-600">Al terminar la evaluación física final, revisa tus marcas y el objetivo de tu plan. No se trata solo de mejorar una cifra: explica qué has aprendido y qué te gustaría seguir haciendo.</p>
      {readOnly && <p role="status" className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">{secondYearWorkClosedMessage}</p>}
      <p className="mt-3 text-sm font-semibold text-[#164c3a]" aria-live="polite">{!readOnly && dirty ? "Cambios sin guardar" : saved?.status === "submitted" ? (readOnly ? "Reflexión enviada" : "Reflexión enviada · puedes actualizar tus respuestas") : saved ? "Borrador guardado · todavía no enviado" : (readOnly ? "Sin reflexión guardada" : "Pendiente de realizar")}</p>
      {saved && <p className="mt-1 text-xs text-slate-500">Último guardado: {new Intl.DateTimeFormat("es-ES", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Madrid" }).format(new Date(saved.updated_at))}</p>}
    </section>
    {(!readOnly || initial) && reflectionFields.map((field, index) => <section key={field.key} className="card p-5 sm:p-7">
      <label htmlFor={field.key} className="block text-lg font-extrabold"><span className="mr-2 text-[#1e6b4f]">{index + 1}.</span>{field.title}</label>
      <p id={`${field.key}-help`} className="mt-2 text-sm leading-6 text-slate-600">{field.help}</p>
      <textarea id={field.key} aria-describedby={`${field.key}-help`} rows={5} maxLength={3000} value={displayedAnswer[field.key]} readOnly={readOnly} disabled={busy} onChange={(event) => { setAnswer({ ...answer, [field.key]: event.target.value }); setDirty(true); setMessage(""); }} className="mt-4 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm leading-6 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-100" placeholder={readOnly ? "Sin respuesta guardada" : "Escribe tu reflexión con ejemplos personales…"}/>
      {!readOnly && <p className="mt-1 text-right text-xs text-slate-500">{answer[field.key].length}/3000</p>}
    </section>)}
    {!readOnly && <section className="card p-5 sm:p-7">
      {error && <p role="alert" className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
      {message && <p role="status" className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 size={18}/>{message}</p>}
      <div className="flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={() => void save("draft")} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold disabled:opacity-50"><Save size={17}/>{busy ? "Guardando…" : "Guardar borrador"}</button><button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-[#1e6b4f] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"><Send size={17}/>Enviar reflexión</button></div>
      <p className="mt-3 text-xs leading-5 text-slate-500">El borrador conserva tu trabajo. Para completar este instrumento, envía los cuatro apartados. Tus respuestas son visibles para ti y para el profesorado.</p>
    </section>}
  </form>;
}

"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { saveOlympiadAnswer } from "@/app/alumno/olimpiada-lisboa/actions";
import { OLYMPIAD_CHOICES, OLYMPIAD_GENDERS, type OlympiadResponse } from "@/lib/olympiad-lisboa";

export function OlympiadParticipationForm({ initialResponse }: { initialResponse: OlympiadResponse | null }) {
  const [participating, setParticipating] = useState<boolean | null>(initialResponse?.participating ?? null);
  const [gender, setGender] = useState(initialResponse?.gender ?? "");
  const [first, setFirst] = useState(initialResponse?.first_choice ?? "");
  const [second, setSecond] = useState(initialResponse?.second_choice ?? "");
  const [saved, setSaved] = useState(initialResponse);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const dirty = participating !== saved?.participating || (participating === true && (gender !== saved?.gender || first !== saved?.first_choice || second !== saved?.second_choice));
  const sports = [...new Set(OLYMPIAD_CHOICES.map((choice) => choice.sport))];
  const inputClass = "mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-normal focus:border-[#1e6b4f] focus:outline-none focus:ring-2 focus:ring-emerald-100";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage(""); setSaving(true);
    try {
      const response = await saveOlympiadAnswer({ participating, gender, first_choice: first, second_choice: second });
      setSaved(response); setMessage("Tu respuesta se ha guardado correctamente.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se ha podido guardar. Vuelve a intentarlo."); }
    finally { setSaving(false); }
  }
  return <section id="participacion" aria-labelledby="participation-title" className="card scroll-mt-6 border-emerald-200 p-5 sm:p-8">
    <p className="text-xs font-extrabold uppercase tracking-widest text-[#1e6b4f]">Tu decisión</p>
    <h2 id="participation-title" className="mt-2 text-2xl font-extrabold">¿Nos vamos a Lisboa?</h2>
    <p className="mt-3 text-sm leading-6 text-slate-600">Indica si deseas participar en la Olimpiada Marista. Si quieres participar, elige tus dos preferencias en orden.</p>
    {saved && !dirty && <p className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800"><CheckCircle2 size={18} aria-hidden="true"/>{saved.participating ? "Has indicado que sí deseas participar." : "Has indicado que no deseas participar."}</p>}
    <form onSubmit={(event) => void submit(event)} className="mt-6">
      <fieldset disabled={saving} className="space-y-6 disabled:opacity-60">
        <fieldset><legend className="text-sm font-extrabold">¿Deseas participar?</legend><div className="mt-3 grid gap-3 sm:grid-cols-2">{[{value:true,label:"Sí, quiero participar",text:"Elige tus modalidades favoritas."},{value:false,label:"No deseo participar",text:"Con esta respuesta termina el formulario."}].map((option) => <label key={String(option.value)} className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 ${participating === option.value ? "border-[#1e6b4f] bg-emerald-50" : "border-slate-200 bg-white"}`}><input required type="radio" name="participating" checked={participating === option.value} onChange={() => {setParticipating(option.value);setMessage("");setError("");}} className="mt-1 h-4 w-4 shrink-0 accent-emerald-700"/><span><span className="block text-sm font-extrabold">{option.label}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{option.text}</span></span></label>)}</div></fieldset>
        {participating === true && <div className="space-y-5 rounded-2xl bg-slate-50 p-4 sm:p-6">
          <label className="block text-sm font-bold">Género<select required value={gender} onChange={(event) => setGender(event.target.value as typeof gender)} className={inputClass}><option value="">Selecciona una opción</option>{OLYMPIAD_GENDERS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
          <div className="grid gap-5 md:grid-cols-2">{[{label:"Primera opción",value:first,set:setFirst,other:second},{label:"Segunda opción",value:second,set:setSecond,other:first}].map((field) => <label key={field.label} className="block text-sm font-bold">{field.label}<select required value={field.value} onChange={(event) => field.set(event.target.value as typeof first)} className={inputClass}><option value="">Elige deporte y prueba</option>{sports.map((sport) => <optgroup key={sport} label={sport}>{OLYMPIAD_CHOICES.filter((choice) => choice.sport === sport).map((choice) => <option key={choice.id} value={choice.id} disabled={choice.id === field.other}>{choice.label}</option>)}</optgroup>)}</select></label>)}</div>
          <p className="text-xs leading-5 text-slate-500">Selecciona dos opciones diferentes. En atletismo, natación y gimnasia puedes indicar la prueba concreta.</p>
        </div>}
        <button type="submit" disabled={participating === null || (saved !== null && !dirty)} className="inline-flex items-center gap-2 rounded-xl bg-[#1e6b4f] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"><Send size={17} aria-hidden="true"/>{saving ? "Guardando…" : saved ? "Actualizar mi respuesta" : "Guardar mi respuesta"}</button>
      </fieldset>
      <p className="mt-3 text-xs leading-5 text-slate-500">Puedes modificar tu respuesta. Solo tú y el profesorado podéis consultarla.</p>
      {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <p role="status" aria-live="polite" className="mt-3 text-sm font-semibold text-emerald-800">{message || (dirty && saved ? "Tienes cambios pendientes de guardar." : "")}</p>
    </form>
  </section>;
}

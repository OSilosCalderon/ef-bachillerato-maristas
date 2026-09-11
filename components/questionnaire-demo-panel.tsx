"use client";

import { useState } from "react";
import { ClipboardCheck, LockKeyhole } from "lucide-react";

export function QuestionnaireDemoPanel() {
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState({ text: "", single: "", multi: [] as string[], scale5: 3, scale7: 4, scale10: 5 });
  const toggle = (option: string) => setAnswers((a) => ({ ...a, multi: a.multi.includes(option) ? a.multi.filter((x) => x !== option) : [...a.multi, option] }));
  if (submitted) return <section className="card p-6"><ClipboardCheck className="text-[#1e6b4f]" size={28}/><h2 className="mt-4 text-xl font-extrabold">Respuesta guardada en modo demo</h2><p className="mt-2 text-sm text-slate-500">En Supabase, este intento quedará protegido para que solo tú y el profesorado autorizado podáis consultarlo.</p><button onClick={()=>setSubmitted(false)} className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold">Volver a editar</button></section>;
  return <section className="card p-6"><div className="flex items-start gap-3"><LockKeyhole className="mt-1 text-[#1e6b4f]"/><div><h2 className="text-lg font-extrabold">Demostración del motor de preguntas</h2><p className="mt-1 text-sm text-slate-500">Preguntas ficticias para comprobar los tipos de respuesta. No constituyen ningún test psicológico.</p></div></div><div className="mt-6 space-y-6">
    <Question title="1. Respuesta de texto"><textarea value={answers.text} onChange={e=>setAnswers({...answers,text:e.target.value})} rows={3} className="w-full rounded-xl border border-slate-200 p-3 text-sm" placeholder="Escribe tu respuesta…"/></Question>
    <Question title="2. Selección única"><div className="flex flex-wrap gap-3">{["Opción A","Opción B","Opción C"].map(o=><label key={o} className="flex items-center gap-2 text-sm"><input type="radio" name="single" checked={answers.single===o} onChange={()=>setAnswers({...answers,single:o})}/>{o}</label>)}</div></Question>
    <Question title="3. Selección múltiple"><div className="flex flex-wrap gap-3">{["Opción A","Opción B","Opción C"].map(o=><label key={o} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={answers.multi.includes(o)} onChange={()=>toggle(o)}/>{o}</label>)}</div></Question>
    {([["Escala 1–5","scale5",5],["Escala 1–7","scale7",7],["Escala 1–10","scale10",10]] as const).map(([title,key,max])=><Question key={key} title={title}><div className="flex flex-wrap gap-2">{Array.from({length:max},(_,i)=>i+1).map(n=><button key={n} onClick={()=>setAnswers({...answers,[key]:n})} className={`h-9 w-9 rounded-lg text-sm font-bold ${answers[key]===n?"bg-[#1e6b4f] text-white":"bg-slate-100 text-slate-600"}`}>{n}</button>)}</div></Question>)}
  </div><button onClick={()=>setSubmitted(true)} className="mt-7 rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white">Guardar respuestas demo</button></section>;
}
function Question({title,children}:{title:string;children:React.ReactNode}){return <fieldset><legend className="mb-3 text-sm font-bold text-slate-800">{title}</legend>{children}</fieldset>}

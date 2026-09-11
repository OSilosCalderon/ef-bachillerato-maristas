"use client";
import { useState } from "react";
import { Activity, BrainCircuit, ClipboardCheck, Dumbbell, HeartPulse, MessageSquareMore, Plus, Settings2, Sparkles } from "lucide-react";

const activityTypes = [
  ["physical_test","Prueba física",HeartPulse],
  ["technical_test","Prueba técnica",Dumbbell],
  ["psychological_questionnaire","Cuestionario psicológico",ClipboardCheck],
  ["theoretical_questionnaire","Cuestionario teórico",ClipboardCheck],
  ["procedural_test","Test de conocimiento procedimental",BrainCircuit],
  ["decision_activity","Actividad de toma de decisiones",BrainCircuit],
  ["self_assessment","Autoevaluación",Sparkles],
  ["rating","Valoración",MessageSquareMore],
  ["custom","Actividad personalizada",Settings2],
] as const;

export function ActivityCreator() {
  const [type,setType]=useState<string>("physical_test");
  const [saved,setSaved]=useState(false);
  return <div className="grid gap-6 xl:grid-cols-[.7fr_1.3fr]">
    <section className="card p-5"><h2 className="font-extrabold">Tipo de actividad</h2><div className="mt-4 space-y-2">{activityTypes.map(([key,label,Icon])=><button key={key} onClick={()=>{setType(key);setSaved(false)}} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm font-semibold ${type===key?"border-[#1e6b4f]/30 bg-[#e7f2ed] text-[#164c3a]":"border-slate-200 bg-white text-slate-600"}`}><Icon size={18}/>{label}</button>)}</div></section>
    <section className="card p-6">
      <div className="flex items-center gap-3"><Activity className="text-[#1e6b4f]"/><div><p className="text-xs font-bold uppercase tracking-wide text-[#1e6b4f]">Crear actividad</p><h2 className="text-xl font-extrabold">{activityTypes.find(([key])=>key===type)?.[1]}</h2></div></div>
      <p className="mt-3 text-sm leading-6 text-slate-500">Formulario genérico basado en esquema. Los campos específicos pueden añadirse desde configuración sin introducir tests predefinidos.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field id="activity-title" label="Título"/><Select id="activity-sa" label="Situación"><option>SA1</option><option>SA2</option><option>SA3</option></Select>
        <label htmlFor="activity-description" className="md:col-span-2 text-xs font-bold uppercase tracking-wide text-slate-500">Descripción<textarea id="activity-description" rows={3} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"/></label>
        <Field id="activity-open" label="Fecha de apertura" type="datetime-local"/><Field id="activity-close" label="Fecha de cierre" type="datetime-local"/>
        <Select id="activity-response" label="Tipo de respuesta inicial"><option>Texto</option><option>Selección única</option><option>Selección múltiple</option><option>Escala 1-5</option><option>Escala 1-7</option><option>Escala 1-10</option><option>Sí / No</option><option>Resultado numérico</option></Select>
        <Field id="activity-unit" label="Unidad / etiqueta opcional"/>
      </div>
      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5"><div className="flex items-center gap-2"><Plus size={17}/><strong className="text-sm">Campos y preguntas</strong></div><p className="mt-2 text-sm text-slate-500">Aquí se añadirán preguntas, opciones, escalas, puntuaciones o bloques personalizados según el tipo seleccionado.</p><button className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold">Añadir campo</button></div>
      <div className="mt-6 flex flex-wrap gap-2"><button onClick={()=>setSaved(true)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold">Guardar borrador</button><button onClick={()=>setSaved(true)} className="rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white">Guardar y publicar</button></div>
      {saved&&<p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">Actividad guardada en modo demo.</p>}
    </section>
  </div>
}
function Field({id,label,type="text"}:{id:string;label:string;type?:string}){return <label htmlFor={id} className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}<input id={id} type={type} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"/></label>}
function Select({id,label,children}:{id:string;label:string;children:React.ReactNode}){return <label htmlFor={id} className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}<select id={id} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm">{children}</select></label>}

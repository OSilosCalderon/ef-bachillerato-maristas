"use client";

import { useState } from "react";
import { BrainCircuit, CheckCircle2, ImageIcon, LockKeyhole } from "lucide-react";
import { decisionEvolution, proceduralActivities, proceduralAttempts } from "@/lib/sa2-demo-data";
import { Sa2LineChart } from "@/components/sa2-charts";

const demoAlternatives = [
  "Mantener una opción de pase segura y observar el espacio disponible.",
  "Tomar una decisión sin observar a compañeros ni oposición.",
  "Detener siempre la acción aunque exista continuidad.",
];

export function ProceduralKnowledgePanel() {
  const [answer, setAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <LockKeyhole className="mr-2 inline" size={17}/>
        Tus respuestas, puntuaciones e intentos son privados para ti y el profesorado autorizado.
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {proceduralActivities.map((activity) => (
          <article key={activity.id} className="card p-6">
            <BrainCircuit className="text-[#1e6b4f]"/>
            <h2 className="mt-4 text-lg font-extrabold">{activity.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{activity.description}</p>
            <p className="mt-4 text-xs text-slate-500">{activity.questionCount} preguntas · Hasta {activity.maxAttempts ?? "—"} intentos</p>
          </article>
        ))}
      </div>

      <section className="card p-6">
        <div className="flex items-start gap-3">
          <BrainCircuit className="mt-1 text-[#1e6b4f]"/>
          <div>
            <h2 className="text-lg font-extrabold">Demostración del motor de toma de decisiones</h2>
            <p className="mt-1 text-sm text-slate-500">Escenario ficticio para comprobar la interfaz. No es una pregunta definitiva.</p>
          </div>
        </div>
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500"><ImageIcon size={16}/>Zona preparada para imagen táctica</div>
          <div className="mt-4 grid min-h-36 place-items-center rounded-xl bg-white text-center text-sm text-slate-400">Imagen o diagrama de una situación deportiva</div>
        </div>
        <h3 className="mt-5 font-extrabold">Recibes el balón en esta situación. ¿Qué decisión sería más adecuada?</h3>
        <div className="mt-4 space-y-2">
          {demoAlternatives.map((item, index) => (
            <button key={item} onClick={() => { setAnswer(index); setSubmitted(false); }} className={`w-full rounded-xl border p-4 text-left text-sm ${answer === index ? "border-[#1e6b4f] bg-[#f3f8f5]" : "border-slate-200 bg-white"}`}>{item}</button>
          ))}
        </div>
        <button disabled={answer == null} onClick={() => setSubmitted(true)} className="mt-5 rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40">Guardar respuesta demo</button>
        {submitted && (
          <div className="mt-4 rounded-xl bg-[#f3f8f5] p-4 text-sm text-slate-600">
            <CheckCircle2 className="mr-2 inline text-[#1e6b4f]" size={17}/>
            Respuesta registrada. Aquí puede mostrarse posteriormente la explicación configurada por el profesor.
          </div>
        )}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="card p-6"><h2 className="font-extrabold">Mis intentos</h2><div className="mt-4 divide-y divide-slate-100">{proceduralAttempts.map((attempt) => <div key={attempt.id} className="flex items-center justify-between py-3 text-sm"><span>Intento {attempt.attemptNumber} · {attempt.date}</span><strong>{attempt.score}/{attempt.maxScore}</strong></div>)}</div></article>
        <article className="card p-6"><h2 className="font-extrabold">Evolución entre intentos</h2><p className="mt-1 text-xs text-slate-500">Visualización personal, sin comparaciones con compañeros.</p><Sa2LineChart data={decisionEvolution}/></article>
      </section>
    </div>
  );
}

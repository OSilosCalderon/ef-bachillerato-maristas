import { BookOpenCheck, CalendarDays, ExternalLink } from "lucide-react";
import { sa3Rubric, sa3Sessions, sa3Sources } from "@/lib/sa3-habits-curriculum";

export function Sa3SessionGuide({ review = false }: { review?: boolean }) {
  return <div className="space-y-5">
    <section className="card p-5 sm:p-7">
      <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#1e6b4f]"><CalendarDays size={16} aria-hidden="true"/> Guía de la unidad</p>
      <h2 className="mt-2 text-2xl font-black text-slate-950">Diez sesiones para construir la bitácora</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Cada sesión está pensada para 55 minutos. Las cuatro semanas permiten observar el punto de partida, probar una acción y revisar los resultados. En el aula, usa etiquetas o ejemplos preparados y reserva tiempo para practicar el hábito elegido.</p>
      <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold text-[#164c3a]">
        <span className="rounded-full bg-emerald-50 px-3 py-2">1–3 · Observar</span>
        <span className="rounded-full bg-emerald-50 px-3 py-2">4–8 · Probar y ajustar</span>
        <span className="rounded-full bg-emerald-50 px-3 py-2">9–10 · Explicar y entregar</span>
      </div>
      <div className="mt-5 divide-y divide-slate-100">
        {sa3Sessions.map((session, index) => <details key={session.title} className="py-3" open={index === 0 ? true : undefined}>
          <summary className="min-h-10 cursor-pointer py-1 font-bold text-slate-900">
            <span className="mr-2 text-sm text-[#1e6b4f]">{String(index + 1).padStart(2, "0")}</span>
            {session.title}
            <span className="ml-3 text-xs font-semibold text-slate-500">Semana {session.week}</span>
          </summary>
          <dl className="mt-2 grid gap-3 text-sm leading-6 text-slate-700 lg:grid-cols-[1fr_2fr_1fr]">
            <div className="rounded-xl bg-slate-50 p-3"><dt className="font-bold text-slate-900">Inicio · 8 min</dt><dd>{session.start}</dd></div>
            <div className="rounded-xl bg-slate-50 p-3"><dt className="font-bold text-slate-900">Práctica · 37 min</dt><dd>{session.practice}</dd></div>
            <div className="rounded-xl bg-slate-50 p-3"><dt className="font-bold text-slate-900">Cierre · 10 min</dt><dd>{session.close}</dd></div>
          </dl>
          <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-[#164c3a]"><strong>Evidencia.</strong> {session.evidence}</p>
        </details>)}
      </div>
    </section>

    <section className="card p-5 sm:p-7">
      <p className="text-xs font-black uppercase tracking-widest text-[#1e6b4f]">Evaluación · 10 puntos</p>
      <h2 className="mt-2 text-xl font-black text-slate-950">Rúbrica de la bitácora</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Valora la calidad de la observación, la planificación y las conclusiones. El caso de aula y el registro propio se evalúan con los mismos criterios.</p>
      <div className="mt-5 space-y-4">
        {sa3Rubric.map((row, index) => <article key={row.title} className="rounded-2xl border border-slate-200 p-4">
          <h3 className="font-extrabold text-slate-950">{index + 1}. {row.title}</h3>
          <dl className="mt-3 grid gap-3 text-sm leading-6 text-slate-600 md:grid-cols-3">
            <div><dt className="font-bold text-[#164c3a]">Completo · 2,5</dt><dd>{row.complete}</dd></div>
            <div><dt className="font-bold text-slate-900">En desarrollo · 1,5</dt><dd>{row.developing}</dd></div>
            <div><dt className="font-bold text-slate-900">Inicial · 0,5</dt><dd>{row.initial}</dd></div>
          </dl>
        </article>)}
      </div>
      <p className="mt-4 text-xs text-slate-600">Cada criterio sin evidencia puntúa 0. La nota se obtiene sumando los cuatro criterios.</p>
    </section>

    <section className="card p-5 sm:p-7">
      <h2 className="flex items-center gap-2 text-xl font-black text-slate-950"><BookOpenCheck size={20} aria-hidden="true"/> Fuentes para contrastar</h2>
      <ul className="mt-4 grid gap-4 md:grid-cols-2">
        {sa3Sources.map((source) => <li key={source.url} className="rounded-xl bg-slate-50 p-3">
          <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-start gap-2 text-sm font-extrabold text-[#164c3a] underline underline-offset-2">
            {source.title}<ExternalLink size={14} aria-hidden="true" className="mt-0.5 shrink-0"/>
          </a>
          <p className="mt-1 text-sm leading-6 text-slate-600">{source.use}</p>
        </li>)}
      </ul>
      {review && <details className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-[#164c3a]">
        <summary className="font-bold">Lecturas propuestas para incorporar</summary>
        <p className="mt-2 leading-6">Los EPUB de Mulet, Revenga, Moss, Ríos, Basulto, Duhigg y Sánchez García quedan pendientes de incorporar cuando estén disponibles los archivos. Esta versión se apoya en las fuentes consultables de arriba.</p>
      </details>}
    </section>
  </div>;
}

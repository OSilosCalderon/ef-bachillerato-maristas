"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Minus, TrendingUp } from "lucide-react";
import { physicalTests as initialTests } from "@/lib/sa1-demo-data";
import { evolutionLabel, physicalEvolution } from "@/lib/sa1-types";
import type { PhysicalTest } from "@/lib/sa1-types";

export function PhysicalEvolutionPanel() {
  const [tests, setTests] = useState<PhysicalTest[]>(initialTests.filter((test) => test.active));
  const update = (id: string, field: "september" | "november", raw: string) => {
    const value = raw === "" ? undefined : Number(raw);
    setTests((current) => current.map((test) => test.id === id ? { ...test, [field]: value !== undefined && Number.isFinite(value) ? value : undefined } : test));
  };
  const summary = useMemo(() => tests.map((test) => ({ test, evolution: physicalEvolution(test) })), [tests]);
  const completed = summary.filter(({ evolution }) => evolution).length;
  const improved = summary.filter(({ evolution }) => evolution?.status === "improved").length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="card p-5"><p className="text-sm text-slate-500">Pruebas comparables</p><p className="mt-2 text-3xl font-extrabold">{completed}/{tests.length}</p></article>
        <article className="card p-5"><p className="text-sm text-slate-500">Aspectos con mejora</p><p className="mt-2 text-3xl font-extrabold">{improved}</p></article>
        <article className="card p-5"><p className="text-sm text-slate-500">Momentos de registro</p><p className="mt-2 text-lg font-extrabold">Septiembre · Noviembre</p></article>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 p-5 sm:p-6">
          <h2 className="text-xl font-extrabold">Mis resultados</h2>
          <p className="mt-1 text-sm text-slate-500">Datos demo editables en esta pantalla. Al conectar Supabase, cada registro quedará asociado únicamente a tu usuario.</p>
        </div>
        <div className="divide-y divide-slate-100">
          {summary.map(({ test, evolution }) => (
            <article key={test.id} className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[1.4fr_.7fr_.7fr_1fr] xl:items-center">
              <div>
                <h3 className="font-bold text-slate-900">{test.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{test.description}</p>
                <p className="mt-2 text-xs text-slate-400">{test.instructions}</p>
              </div>
              {(["september", "november"] as const).map((period) => (
                <label key={period} className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {period === "september" ? "Septiembre" : "Noviembre"}
                  <div className="mt-2 flex items-center rounded-xl border border-slate-200 bg-white px-3">
                    <input type="number" step="any" value={test[period] ?? ""} onChange={(e) => update(test.id, period, e.target.value)} className="min-w-0 flex-1 bg-transparent py-3 text-base font-semibold text-slate-900 outline-none" />
                    <span className="text-xs font-medium text-slate-400">{test.unit}</span>
                  </div>
                </label>
              ))}
              <div className="rounded-2xl bg-slate-50 p-4">
                {evolution ? (
                  <>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      {evolution.status === "improved" ? <TrendingUp size={17} /> : evolution.status === "maintained" ? <Minus size={17} /> : <CheckCircle2 size={17} />}
                      {evolutionLabel[evolution.status]}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Diferencia: {evolution.absolute > 0 ? "+" : ""}{evolution.absolute.toFixed(2)} {test.unit}{evolution.percentage != null ? ` · ${evolution.percentage > 0 ? "+" : ""}${evolution.percentage.toFixed(1)}%` : ""}</p>
                  </>
                ) : <p className="text-sm text-slate-500">Añade ambos registros para ver tu evolución.</p>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-extrabold">Resumen visual</h2>
        <div className="mt-5 space-y-4">
          {summary.filter(({ evolution }) => evolution).map(({ test, evolution }) => {
            const magnitude = Math.min(Math.abs(evolution?.percentage ?? 0), 30) / 30 * 100;
            return <div key={test.id}><div className="mb-2 flex justify-between gap-3 text-sm"><span className="font-semibold">{test.name}</span><span className="text-slate-500">{evolution && evolutionLabel[evolution.status]}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#1e6b4f]" style={{ width: `${Math.max(8, magnitude)}%` }} /></div></div>;
          })}
        </div>
        <p className="mt-5 text-xs leading-5 text-slate-500">La longitud de cada barra representa la magnitud del cambio, no una clasificación ni una comparación con otras personas.</p>
      </section>
    </div>
  );
}

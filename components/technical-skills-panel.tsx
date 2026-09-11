"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Dumbbell, TrendingUp } from "lucide-react";
import { sports, technicalTests as seed } from "@/lib/sa2-demo-data";
import { technicalEvolution, technicalEvolutionLabel, type TechnicalTest } from "@/lib/sa2-types";

export function TechnicalSkillsPanel() {
  const [tests, setTests] = useState(seed);
  const [sportId, setSportId] = useState("all");
  const visible = useMemo(() => tests.filter((test) => sportId === "all" || test.sportId === sportId), [tests, sportId]);

  const update = (id: string, period: "january" | "march", raw: string) => {
    const value = raw === "" ? undefined : Number(raw);
    setTests((current) => current.map((test) => test.id === id ? { ...test, [period]: value } : test));
  };

  return (
    <div className="space-y-5">
      <section className="card p-5">
        <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Filtrar por deporte
          <select value={sportId} onChange={(e) => setSportId(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold sm:max-w-sm">
            <option value="all">Todos los deportes</option>
            {sports.filter((sport) => sport.active).map((sport) => <option key={sport.id} value={sport.id}>{sport.name}</option>)}
          </select>
        </label>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {visible.map((test) => {
          const evolution = technicalEvolution(test);
          const sport = sports.find((item) => item.id === test.sportId);
          return (
            <article key={test.id} className="card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{sport?.name}</span>
                  <h2 className="mt-4 text-lg font-extrabold">{test.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{test.description}</p>
                </div>
                <Dumbbell className="shrink-0 text-[#1e6b4f]" />
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500"><strong>Criterio:</strong> {test.valuationCriteria}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
                <ResultField label="Enero" value={test.january} unit={test.unit} onChange={(value) => update(test.id, "january", value)} />
                <ArrowRight className="mb-3 hidden text-slate-300 sm:block" />
                <ResultField label="Finales de marzo" value={test.march} unit={test.unit} onChange={(value) => update(test.id, "march", value)} />
              </div>
              {evolution ? (
                <div className="mt-5 rounded-2xl bg-[#f3f8f5] p-4">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-[#164c3a]"><TrendingUp size={17}/>{technicalEvolutionLabel[evolution.status]}</div>
                  <p className="mt-1 text-xs text-slate-500">
                    Diferencia: {evolution.absolute > 0 ? "+" : ""}{evolution.absolute.toFixed(2)} {test.unit}
                    {evolution.percentage != null ? ` · ${evolution.percentage > 0 ? "+" : ""}${evolution.percentage.toFixed(1)}%` : ""}
                  </p>
                </div>
              ) : <p className="mt-5 text-xs text-slate-400">Completa ambos momentos para visualizar tu evolución.</p>}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function ResultField({ label, value, unit, onChange }: { label: string; value?: number; unit: string; onChange: (value: string) => void }) {
  return (
    <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
      {label}
      <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-200 bg-white">
        <input type="number" step="any" value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="min-w-0 flex-1 p-3 text-sm font-semibold outline-none" />
        <span className="grid place-items-center border-l border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-500">{unit}</span>
      </div>
    </label>
  );
}

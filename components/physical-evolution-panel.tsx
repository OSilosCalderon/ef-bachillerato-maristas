"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Minus, Save, TrendingUp } from "lucide-react";
import { loadPhysicalTestsForCurrentStudent, savePhysicalResult } from "@/lib/sa1-physical-data";
import { evolutionLabel, physicalEvolution } from "@/lib/sa1-types";
import type { AssessmentPeriod, PhysicalTest } from "@/lib/sa1-types";

export function PhysicalEvolutionPanel() {
  const [tests, setTests] = useState<PhysicalTest[]>([]);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    loadPhysicalTestsForCurrentStudent()
      .then(({ studentId, tests }) => { setStudentId(studentId); setTests(tests); })
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudieron cargar las pruebas."))
      .finally(() => setLoading(false));
  }, []);

  const update = (id: string, period: AssessmentPeriod, raw: string) => {
    const value = raw === "" ? undefined : Number(raw);
    setTests((current) => current.map((test) => test.id === id ? { ...test, [period]: Number.isFinite(value) ? value : undefined } : test));
    setSaved(null);
  };

  const save = async (test: PhysicalTest, period: AssessmentPeriod) => {
    if (!studentId || test[period] == null) return;
    const key = `${test.id}:${period}`;
    setSaving(key);
    setError(null);
    try {
      await savePhysicalResult(studentId, test.id, period, test[period] as number);
      setSaved(key);
    } catch {
      setError("No se ha podido guardar el registro. Inténtalo de nuevo.");
    } finally {
      setSaving(null);
    }
  };

  const summary = useMemo(() => tests.map((test) => ({ test, evolution: physicalEvolution(test) })), [tests]);
  const completed = summary.filter(({ evolution }) => evolution).length;

  if (loading) return <div className="card flex items-center gap-3 p-6"><Loader2 className="animate-spin" size={20}/> Cargando pruebas físicas...</div>;
  if (error && tests.length === 0) return <div className="card border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2">
        <article className="card p-5"><p className="text-sm text-slate-500">Pruebas físicas</p><p className="mt-2 text-3xl font-extrabold">{tests.length}</p></article>
        <article className="card p-5"><p className="text-sm text-slate-500">Comparativas completas</p><p className="mt-2 text-3xl font-extrabold">{completed}/{tests.length}</p></article>
      </section>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}

      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 p-5 sm:p-6">
          <h2 className="text-xl font-extrabold">Mis resultados</h2>
          <p className="mt-1 text-sm text-slate-500">Cada prueba admite solo dos registros: uno inicial en septiembre y otro final en noviembre. Si necesitas corregir un dato, modifica el valor y vuelve a guardarlo.</p>
        </div>
        <div className="divide-y divide-slate-100">
          {summary.map(({ test, evolution }) => (
            <article key={test.id} className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[1.5fr_.8fr_.8fr_1fr] xl:items-center">
              <div>
                <h3 className="font-bold text-slate-900">{test.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{test.description}</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">{test.instructions}</p>
              </div>

              {(["september", "november"] as const).map((period) => {
                const key = `${test.id}:${period}`;
                return <div key={period}>
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {period === "september" ? "Septiembre" : "Noviembre"}
                    <div className="mt-2 flex items-center rounded-xl border border-slate-200 bg-white px-3">
                      <input type="number" min="0" step="any" inputMode="decimal" value={test[period] ?? ""} onChange={(e) => update(test.id, period, e.target.value)} className="min-w-0 flex-1 bg-transparent py-3 text-base font-semibold text-slate-900 outline-none" />
                      <span className="text-xs font-medium text-slate-400">{test.unit}</span>
                    </div>
                  </label>
                  <button type="button" disabled={test[period] == null || saving === key} onClick={() => save(test, period)} className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-[#1e6b4f] disabled:opacity-40">
                    {saving === key ? <Loader2 className="animate-spin" size={14}/> : <Save size={14}/>} {saved === key ? "Guardado" : "Guardar registro"}
                  </button>
                </div>;
              })}

              <div className="rounded-2xl bg-slate-50 p-4">
                {evolution ? <>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    {evolution.status === "improved" ? <TrendingUp size={17}/> : evolution.status === "maintained" ? <Minus size={17}/> : <CheckCircle2 size={17}/>} {evolutionLabel[evolution.status]}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Diferencia: {evolution.absolute > 0 ? "+" : ""}{evolution.absolute.toFixed(2)} {test.unit}</p>
                </> : <p className="text-sm text-slate-500">Completa los dos registros para ver tu evolución.</p>}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

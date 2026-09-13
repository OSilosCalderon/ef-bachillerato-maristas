"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Minus, Save, TrendingUp } from "lucide-react";
import {
  loadPhysicalTestsForCurrentStudent,
  saveFitnessReference,
  savePhysicalResult,
} from "@/lib/sa1-physical-data";
import {
  evolutionLabel,
  physicalBenchmark,
  physicalBenchmarkComparison,
  physicalEvolution,
} from "@/lib/sa1-types";
import type { AssessmentPeriod, FitnessReference, PhysicalTest } from "@/lib/sa1-types";

const referenceLabel: Record<FitnessReference, string> = {
  masculino: "Masculino",
  femenino: "Femenino",
};

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(".", ",");
}

function ComparisonLine({ test, value, reference }: { test: PhysicalTest; value?: number; reference: FitnessReference }) {
  const comparison = physicalBenchmarkComparison(test, value, reference);
  if (!comparison) return null;

  return (
    <div className="mt-2 rounded-xl bg-[#f5f8f6] px-3 py-2 text-xs text-slate-600">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>
          Referencia {referenceLabel[reference].toLowerCase()}: {formatNumber(comparison.benchmark)} {test.unit}
        </span>
        <strong className={comparison.delta >= 0 ? "text-[#1e6b4f]" : "text-amber-700"}>
          {comparison.index.toFixed(1)}%
        </strong>
      </div>
      <p className="mt-1">
        {comparison.label} · {comparison.delta > 0 ? "+" : ""}{comparison.delta.toFixed(1)}% respecto al promedio
      </p>
    </div>
  );
}

export function PhysicalEvolutionPanel() {
  const [tests, setTests] = useState<PhysicalTest[]>([]);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [reference, setReference] = useState<FitnessReference | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [savingReference, setSavingReference] = useState(false);

  useEffect(() => {
    loadPhysicalTestsForCurrentStudent()
      .then(({ studentId, tests, fitnessReference }) => {
        setStudentId(studentId);
        setTests(tests);
        setReference(fitnessReference);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudieron cargar las pruebas."))
      .finally(() => setLoading(false));
  }, []);

  const update = (id: string, period: AssessmentPeriod, raw: string) => {
    const value = raw === "" ? undefined : Number(raw);
    setTests((current) =>
      current.map((test) =>
        test.id === id ? { ...test, [period]: Number.isFinite(value) ? value : undefined } : test,
      ),
    );
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

  const chooseReference = async (next: FitnessReference) => {
    setSavingReference(true);
    setError(null);
    try {
      await saveFitnessReference(next);
      setReference(next);
    } catch {
      setError("No se ha podido guardar la referencia de comparación.");
    } finally {
      setSavingReference(false);
    }
  };

  const summary = useMemo(
    () => tests.map((test) => ({ test, evolution: physicalEvolution(test) })),
    [tests],
  );
  const completed = summary.filter(({ evolution }) => evolution).length;

  const globalIndex = useMemo(() => {
    if (!reference) return { september: null, december: null };

    const calculate = (period: AssessmentPeriod) => {
      const values = tests
        .map((test) => physicalBenchmarkComparison(test, test[period], reference)?.index)
        .filter((value): value is number => value != null && Number.isFinite(value));
      return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
    };

    return { september: calculate("september"), december: calculate("december") };
  }, [tests, reference]);

  if (loading) {
    return (
      <div className="card flex items-center gap-3 p-6">
        <Loader2 className="animate-spin" size={20} /> Cargando pruebas físicas...
      </div>
    );
  }

  if (error && tests.length === 0) {
    return <div className="card border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="card p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#1e6b4f]">Referencia de comparación</p>
            <h2 className="mt-1 text-lg font-extrabold">Promedios de Bachillerato</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              Elige la referencia con la que quieres comparar tus resultados. La web no la asigna automáticamente.
              El 100% representa exactamente el promedio de referencia.
            </p>
          </div>
          <div className="flex gap-2">
            {(["masculino", "femenino"] as const).map((item) => (
              <button
                key={item}
                type="button"
                disabled={savingReference}
                onClick={() => void chooseReference(item)}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  reference === item
                    ? "bg-[#1e6b4f] text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                } disabled:opacity-50`}
              >
                {savingReference && reference !== item ? "Guardando…" : referenceLabel[item]}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
          Esta comparación es una referencia orientativa basada en los promedios aportados para Bachillerato; no es un diagnóstico médico ni un percentil poblacional.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="card p-5">
          <p className="text-sm text-slate-500">Pruebas físicas</p>
          <p className="mt-2 text-3xl font-extrabold">{tests.length}</p>
        </article>
        <article className="card p-5">
          <p className="text-sm text-slate-500">Comparativas completas</p>
          <p className="mt-2 text-3xl font-extrabold">{completed}/{tests.length}</p>
        </article>
        <article className="card p-5">
          <p className="text-sm text-slate-500">Índice orientativo · Septiembre</p>
          <p className="mt-2 text-3xl font-extrabold">
            {globalIndex.september == null ? "—" : `${globalIndex.september.toFixed(1)}%`}
          </p>
          <p className="mt-1 text-xs text-slate-400">Media de las pruebas registradas frente al promedio</p>
        </article>
        <article className="card p-5">
          <p className="text-sm text-slate-500">Índice orientativo · Diciembre</p>
          <p className="mt-2 text-3xl font-extrabold">
            {globalIndex.december == null ? "—" : `${globalIndex.december.toFixed(1)}%`}
          </p>
          <p className="mt-1 text-xs text-slate-400">Media de las pruebas registradas frente al promedio</p>
        </article>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 p-5 sm:p-6">
          <h2 className="text-xl font-extrabold">Mis resultados</h2>
          <p className="mt-1 text-sm text-slate-500">
            Cada prueba admite solo dos registros: uno inicial en septiembre y otro final en diciembre. Al introducir un resultado verás también su comparación porcentual con el promedio de referencia.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {summary.map(({ test, evolution }) => (
            <article
              key={test.id}
              className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[1.35fr_1fr_1fr_.9fr] xl:items-start"
            >
              <div>
                <h3 className="font-bold text-slate-900">{test.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{test.description}</p>
                <p className="mt-2 text-xs leading-5 text-slate-400">{test.instructions}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {test.benchmarkMale != null && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                      Promedio masculino: {formatNumber(test.benchmarkMale)} {test.unit}
                    </span>
                  )}
                  {test.benchmarkFemale != null && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                      Promedio femenino: {formatNumber(test.benchmarkFemale)} {test.unit}
                    </span>
                  )}
                </div>
              </div>

              {(["september", "december"] as const).map((period) => {
                const key = `${test.id}:${period}`;
                return (
                  <div key={period}>
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {period === "september" ? "Septiembre" : "Diciembre"}
                      <div className="mt-2 flex items-center rounded-xl border border-slate-200 bg-white px-3">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          inputMode="decimal"
                          value={test[period] ?? ""}
                          onChange={(event) => update(test.id, period, event.target.value)}
                          className="min-w-0 flex-1 bg-transparent py-3 text-base font-semibold text-slate-900 outline-none"
                        />
                        <span className="text-xs font-medium text-slate-400">{test.unit}</span>
                      </div>
                    </label>
                    <button
                      type="button"
                      disabled={test[period] == null || saving === key}
                      onClick={() => void save(test, period)}
                      className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-[#1e6b4f] disabled:opacity-40"
                    >
                      {saving === key ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                      {saved === key ? "Guardado" : "Guardar registro"}
                    </button>

                    {test[period] != null && reference ? (
                      <ComparisonLine test={test} value={test[period]} reference={reference} />
                    ) : test[period] != null ? (
                      <div className="mt-2 space-y-2">
                        <ComparisonLine test={test} value={test[period]} reference="masculino" />
                        <ComparisonLine test={test} value={test[period]} reference="femenino" />
                      </div>
                    ) : null}
                  </div>
                );
              })}

              <div className="rounded-2xl bg-slate-50 p-4">
                {evolution ? (
                  <>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      {evolution.status === "improved" ? (
                        <TrendingUp size={17} />
                      ) : evolution.status === "maintained" ? (
                        <Minus size={17} />
                      ) : (
                        <CheckCircle2 size={17} />
                      )}
                      {evolutionLabel[evolution.status]}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Diferencia: {evolution.absolute > 0 ? "+" : ""}{evolution.absolute.toFixed(2)} {test.unit}
                    </p>
                    {reference && test.december != null && physicalBenchmark(test, reference) != null && (
                      <p className="mt-2 text-xs font-semibold text-[#1e6b4f]">
                        Diciembre: {physicalBenchmarkComparison(test, test.december, reference)?.index.toFixed(1)}% del promedio de referencia
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-slate-500">Completa los dos registros para ver tu evolución.</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

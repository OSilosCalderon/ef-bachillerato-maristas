"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowRight, CheckCircle2, Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { loadPhysicalTestsForCurrentStudent } from "@/lib/sa1-physical-data";
import { physicalBenchmarkComparison } from "@/lib/sa1-types";
import type { AssessmentPeriod, FitnessReference, PhysicalTest } from "@/lib/sa1-types";

const TOTAL_EXPECTED_TESTS = 11;

const referenceLabel: Record<FitnessReference, string> = {
  masculino: "Masculino",
  femenino: "Femenino",
};

function average(values: number[]) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function periodSummary(tests: PhysicalTest[], period: AssessmentPeriod, reference: FitnessReference) {
  const indexes = tests
    .map((test) => physicalBenchmarkComparison(test, test[period], reference)?.index)
    .filter((value): value is number => value != null && Number.isFinite(value));

  return {
    index: average(indexes),
    completed: indexes.length,
    completion: (indexes.length / TOTAL_EXPECTED_TESTS) * 100,
  };
}

function StatusText({ value }: { value: number | null }) {
  if (value == null) return <span className="text-slate-400">Sin datos suficientes</span>;
  if (value >= 105) return <span className="text-[#1e6b4f]">Por encima del promedio de referencia</span>;
  if (value >= 95) return <span className="text-slate-700">En torno al promedio de referencia</span>;
  return <span className="text-amber-700">Por debajo del promedio de referencia</span>;
}

function SummaryCard({
  title,
  subtitle,
  index,
  completed,
}: {
  title: string;
  subtitle: string;
  index: number | null;
  completed: number;
}) {
  const progressWidth = index == null ? 0 : Math.min(Math.max(index, 0), 150) / 1.5;

  return (
    <article className="card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#1e6b4f]">{subtitle}</p>
          <h3 className="mt-1 text-xl font-extrabold text-slate-950">{title}</h3>
        </div>
        <span className="rounded-full bg-[#e7f2ed] px-3 py-1 text-xs font-bold text-[#1e6b4f]">
          {completed}/{TOTAL_EXPECTED_TESTS} pruebas
        </span>
      </div>

      <div className="mt-6 flex items-end gap-2">
        <span className="text-4xl font-black tracking-tight text-slate-950">
          {index == null ? "—" : `${index.toFixed(1)}%`}
        </span>
        {index != null && <span className="pb-1 text-xs font-semibold text-slate-400">del promedio</span>}
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-[#1e6b4f] transition-all" style={{ width: `${progressWidth}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-[11px] font-semibold text-slate-400">
        <span>0%</span><span>100% promedio</span><span>150%+</span>
      </div>
      <p className="mt-4 text-sm font-semibold"><StatusText value={index} /></p>
    </article>
  );
}

export function PhysicalProgressSummary() {
  const [tests, setTests] = useState<PhysicalTest[]>([]);
  const [reference, setReference] = useState<FitnessReference | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPhysicalTestsForCurrentStudent()
      .then(({ tests, fitnessReference }) => {
        setTests(tests);
        setReference(fitnessReference);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "No se ha podido cargar tu progreso."))
      .finally(() => setLoading(false));
  }, []);

  const summaries = useMemo(() => {
    if (!reference) return null;
    return {
      september: periodSummary(tests, "september", reference),
      december: periodSummary(tests, "december", reference),
    };
  }, [tests, reference]);

  const change =
    summaries?.september.index != null && summaries.december.index != null
      ? summaries.december.index - summaries.september.index
      : null;

  if (loading) {
    return <section className="card flex items-center gap-3 p-6"><Loader2 className="animate-spin" size={20} /> Cargando tu progreso físico...</section>;
  }

  if (error) {
    return <section className="card border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700">{error}</section>;
  }

  if (!reference) {
    return (
      <section className="card p-6 sm:p-8">
        <Activity className="text-[#1e6b4f]" />
        <h2 className="mt-4 text-xl font-extrabold">Configura primero tu referencia de comparación</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Para calcular tu porcentaje global necesitamos que elijas la referencia masculina o femenina en “Mi evolución física”. La web no la asigna automáticamente.
        </p>
        <Link href="/alumno/sa1/evolucion" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white">
          Ir a Mi evolución física <ArrowRight size={16} />
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="card p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.17em] text-[#1e6b4f]">Condición física · SA1</p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-950">Mi evolución: antes y después</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              El 100% representa el promedio de Bachillerato de la referencia {referenceLabel[reference].toLowerCase()}. El resumen usa únicamente las pruebas que hayas registrado.
            </p>
          </div>
          <Link href="/alumno/sa1/evolucion" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#bfd8ca] bg-white px-4 py-2.5 text-sm font-bold text-[#1e6b4f] hover:bg-[#f4faf7]">
            Registrar o editar marcas <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
        <SummaryCard
          title="Septiembre"
          subtitle="Antes"
          index={summaries!.september.index}
          completed={summaries!.september.completed}
        />

        <div className="flex min-w-[160px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <div>
            {change == null ? (
              <>
                <p className="text-3xl font-black text-slate-300">—</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-400">Diciembre pendiente</p>
              </>
            ) : (
              <>
                <div className={`flex items-center justify-center gap-1 text-3xl font-black ${change >= 0 ? "text-[#1e6b4f]" : "text-amber-700"}`}>
                  {change >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                  {change > 0 ? "+" : ""}{change.toFixed(1)}
                </div>
                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-500">puntos porcentuales</p>
              </>
            )}
          </div>
        </div>

        <SummaryCard
          title="Diciembre"
          subtitle="Después"
          index={summaries!.december.index}
          completed={summaries!.december.completed}
        />
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-slate-200 p-5 sm:p-6">
          <h2 className="text-xl font-extrabold">Resumen por prueba</h2>
          <p className="mt-1 text-sm text-slate-500">Compara visualmente tu nivel relativo en septiembre y diciembre.</p>
        </div>
        <div className="divide-y divide-slate-100">
          {tests.map((test) => {
            const sep = physicalBenchmarkComparison(test, test.september, reference)?.index ?? null;
            const dec = physicalBenchmarkComparison(test, test.december, reference)?.index ?? null;
            return (
              <article key={test.id} className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[1.2fr_1fr_1fr] lg:items-center">
                <div>
                  <h3 className="font-bold text-slate-900">{test.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">100% = promedio de referencia</p>
                </div>
                <PeriodBar label="Septiembre" value={sep} />
                <PeriodBar label="Diciembre" value={dec} />
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="card p-5">
          <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-[#1e6b4f]"/><h3 className="font-extrabold">Registro de septiembre</h3></div>
          <p className="mt-3 text-3xl font-black">{summaries!.september.completed}/{TOTAL_EXPECTED_TESTS}</p>
          <p className="mt-1 text-sm text-slate-500">pruebas registradas</p>
        </article>
        <article className="card p-5">
          <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-[#1e6b4f]"/><h3 className="font-extrabold">Registro de diciembre</h3></div>
          <p className="mt-3 text-3xl font-black">{summaries!.december.completed}/{TOTAL_EXPECTED_TESTS}</p>
          <p className="mt-1 text-sm text-slate-500">pruebas registradas</p>
        </article>
      </section>

      <p className="rounded-xl bg-amber-50 p-4 text-xs leading-5 text-amber-800">
        Los porcentajes son una referencia educativa respecto a los promedios introducidos para Bachillerato; no representan un diagnóstico médico ni un percentil poblacional.
      </p>
    </div>
  );
}

function PeriodBar({ label, value }: { label: string; value: number | null }) {
  const width = value == null ? 0 : Math.min(Math.max(value, 0), 150) / 1.5;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold text-slate-500">
        <span>{label}</span>
        <span className={value == null ? "text-slate-300" : "text-slate-900"}>{value == null ? "Pendiente" : `${value.toFixed(1)}%`}</span>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="absolute inset-y-0 left-2/3 w-px bg-slate-300" aria-hidden="true" />
        <div className="h-full rounded-full bg-[#1e6b4f]" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadPhysicalTestsForCurrentStudent } from "@/lib/sa1-physical-data";
import { physicalCapacityTotals, physicalPeriodTotals, secondYearPhysicalComparison } from "@/lib/second-year-progress";
import type { FitnessReference, PhysicalTest } from "@/lib/sa1-types";
import { PhysicalRadarChart } from "@/components/physical-radar-chart";

const format = (value: number) => value.toLocaleString("es-ES", { maximumFractionDigits: 1 });

export function PhysicalCapacityProgress({ registrationHref }: { registrationHref: string }) {
  const [data, setData] = useState<{ tests: PhysicalTest[]; fitnessReference: FitnessReference | null } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    loadPhysicalTestsForCurrentStudent().then((result) => { if (active) setData(result); })
      .catch(() => { if (active) setError("No se han podido cargar tus marcas. Vuelve a abrir Mi progreso para intentarlo de nuevo."); });
    return () => { active = false; };
  }, []);

  if (error) return <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  if (!data) return <p role="status" className="text-sm text-slate-500">Cargando tus resultados de condición física…</p>;

  const { tests, fitnessReference } = data;
  const periods = (["september", "december"] as const).map((period) => ({
    period, label: period === "september" ? "Septiembre" : "Diciembre",
    ...physicalPeriodTotals(tests, period, fitnessReference),
  }));
  const groups = physicalCapacityTotals(tests, fitnessReference);
  const hasComparison = Boolean(fitnessReference && groups.length);

  return <section className="space-y-5" aria-labelledby="physical-progress-title">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h3 id="physical-progress-title" className="text-xl font-extrabold">Mi condición física frente al promedio de Bachillerato</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Cada capacidad reúne sus pruebas. El 100% equivale al promedio orientativo; un porcentaje superior indica un resultado mejor que la referencia, también en las pruebas de tiempo.</p></div>
      <Link href={registrationHref} className="rounded-xl bg-[#1e6b4f] px-4 py-3 text-sm font-bold text-white">Registrar o editar marcas</Link>
    </div>
    {!fitnessReference && <p className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">Elige una referencia masculina o femenina en «Registro de datos» para activar la comparación. Tus marcas registradas se muestran igualmente aquí.</p>}
    {fitnessReference && <p className="text-sm text-slate-500">Referencia {fitnessReference}. Se utilizan los promedios orientativos configurados para cada prueba, no una media calculada con las cuentas del alumnado.</p>}
    {hasComparison ? <><PhysicalRadarChart data={groups.map((group) => ({ capacity: group.capacity.replace("Flexibilidad / movilidad", "Flexibilidad"), initial: group.september.index, final: group.december.index, reference: 100 }))}/><div className="grid gap-3 sm:grid-cols-2">{groups.map((group) => <article key={group.capacity} className="rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-600"><h4 className="text-sm font-extrabold text-slate-900">{group.capacity}</h4><p className="mt-2">Inicial: <strong>{group.september.index == null ? "Pendiente" : format(group.september.index) + "%"}</strong> · Final: <strong>{group.december.index == null ? "Pendiente" : format(group.december.index) + "%"}</strong></p><p>{group.tests.map((test) => test.name).join(" · ")}</p>{group.pairedSeptember != null && group.pairedDecember != null ? <p className="mt-1 font-bold">Cambio sobre las mismas {group.pairedCount} pruebas: {format(group.pairedDecember - group.pairedSeptember)} puntos porcentuales.</p> : <p className="mt-1">El cambio se calculará al completar las dos tomas.</p>}</article>)}</div></> : <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-600">Todavía no hay resultados comparables. Registra tus marcas y elige la referencia; los periodos pendientes no se cuentan como cero.</p>}
    <p className="text-xs leading-5 text-slate-500">Cada prueba pesa lo mismo dentro de su capacidad. Los polígonos pueden contener pruebas distintas; el cambio entre tomas utiliza únicamente las pruebas presentes en ambas. El 5 × 10 m incluye cambios de dirección y coordinación. La movilidad se evalúa por articulaciones, no como una medida única de todo el cuerpo.</p>
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-left text-sm"><caption className="p-3 text-left font-bold">Suma de resultados y referencia de las mismas pruebas</caption>
        <thead className="bg-slate-50 text-xs text-slate-600"><tr><th className="p-3">Toma</th><th className="p-3">Registradas</th><th className="p-3">Comparadas</th><th className="p-3">Mis puntos</th><th className="p-3">Puntos de referencia</th><th className="p-3">Respecto al promedio</th></tr></thead>
        <tbody>{periods.map((item) => <tr key={item.period} className="border-t border-slate-100"><th scope="row" className="p-3">{item.label}</th><td className="p-3">{item.recorded}/{tests.length}</td><td className="p-3">{item.compared}</td><td className="p-3">{item.points == null ? "—" : format(item.points)}</td><td className="p-3">{item.benchmarkPoints == null ? "—" : format(item.benchmarkPoints)}</td><td className="p-3 font-bold">{item.index == null ? "Pendiente" : `${format(item.index)}%`}</td></tr>)}</tbody>
      </table>
    </div>
    <details className="rounded-xl bg-slate-50 p-4"><summary className="cursor-pointer font-bold">Ver mis marcas por prueba</summary>
      <div className="mt-4 divide-y divide-slate-200">{tests.map((test) => <article key={test.id} className="py-3"><h4 className="font-bold">{test.name}</h4><div className="mt-2 grid gap-2 sm:grid-cols-2">{periods.map(({ period, label }) => {
        const value = test[period];
        const comparison = fitnessReference ? secondYearPhysicalComparison(test, value, fitnessReference) : null;
        return <p key={period} className="text-sm text-slate-600">{label}: {value == null ? "Pendiente" : `${format(value)} ${test.unit}`}{comparison && <span className="ml-2 font-bold text-[#1e6b4f]">· {format(comparison.index)}%</span>}</p>;
      })}</div></article>)}</div>
    </details>
    <p className="text-xs leading-5 text-slate-500">Cálculo: marca ÷ referencia en pruebas donde más es mejor; referencia ÷ marca en pruebas donde menos es mejor. Se suman esos índices y se dividen entre los puntos de referencia. Las marcas sin referencia válida, los tiempos cero y los alcances negativos quedan fuera del índice porcentual, pero se conservan en el detalle. Un cero válido en repeticiones cuenta como 0%.</p>
  </section>;
}


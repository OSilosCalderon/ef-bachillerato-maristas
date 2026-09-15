"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { loadPhysicalTestsForCurrentStudent } from "@/lib/sa1-physical-data";
import { physicalCapacityTotals, physicalPeriodTotals, secondYearPhysicalComparison } from "@/lib/second-year-progress";
import type { FitnessReference, PhysicalTest } from "@/lib/sa1-types";

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
    {hasComparison ? <div className="grid min-w-0 gap-4 xl:grid-cols-2">{groups.map((group) => {
      const chart = [
        { name: "Septiembre", value: group.september.index, fill: "#1e6b4f" },
        { name: "Diciembre", value: group.december.index, fill: "#2563eb" },
        { name: "Promedio", value: fitnessReference ? 100 : null, fill: "#64748b" },
      ];
      const max = Math.max(120, ...chart.map((bar) => bar.value ?? 0)) * 1.25;
      return <figure key={group.capacity} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
        <h4 className="font-extrabold">{group.capacity}</h4>
        <div className="h-52 min-w-0" role="img" aria-label={`${group.capacity}. Septiembre: ${group.september.index == null ? "pendiente" : format(group.september.index) + "%"}. Diciembre: ${group.december.index == null ? "pendiente" : format(group.december.index) + "%"}. Promedio: 100%.`}>
          <ResponsiveContainer width="100%" height="100%"><BarChart data={chart} layout="vertical" margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false}/><XAxis type="number" domain={[0, max]} tickFormatter={(value: number) => `${Math.round(value)}%`} tick={{ fontSize: 11 }}/><YAxis dataKey="name" type="category" width={84} tick={{ fontSize: 11 }}/>
            <Tooltip formatter={(value) => `${format(Number(value))}%`}/><Bar dataKey="value" name="Respecto al promedio" isAnimationActive={false} radius={[0, 5, 5, 0]}><LabelList dataKey="value" position="right" formatter={(value) => value == null ? "" : `${format(Number(value))}%`} fontSize={12}/></Bar>
          </BarChart></ResponsiveContainer>
        </div>
        <figcaption className="space-y-2 text-xs leading-5 text-slate-600"><p>Septiembre: {group.september.compared}/{group.tests.length} pruebas comparadas{group.september.index == null ? " · pendiente" : ""}. Diciembre: {group.december.compared}/{group.tests.length}{group.december.index == null ? " · pendiente" : ""}.</p>
          <p>{group.tests.map((test) => test.name).join(" · ")}</p>
          {group.pairedSeptember != null && group.pairedDecember != null ? <p className="font-bold">Cambio sobre las mismas {group.pairedCount} pruebas: {format(group.pairedDecember - group.pairedSeptember)} puntos porcentuales.</p> : <p>El cambio se calculará cuando haya pruebas registradas en las dos tomas.</p>}
        </figcaption>
      </figure>;
    })}</div> : <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-600">Todavía no hay resultados comparables. Registra tus marcas y elige la referencia; los periodos pendientes no se cuentan como cero.</p>}
    <p className="text-xs leading-5 text-slate-500">Cada prueba pesa lo mismo dentro de su capacidad. Las barras pueden contener pruebas distintas; el cambio entre tomas utiliza únicamente las pruebas presentes en ambas. El 5 × 10 m incluye cambios de dirección y coordinación. La movilidad se evalúa por articulaciones, no como una medida única de todo el cuerpo.</p>
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

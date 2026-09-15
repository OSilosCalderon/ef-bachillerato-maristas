"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { loadPhysicalTestsForCurrentStudent } from "@/lib/sa1-physical-data";
import { physicalPeriodTotals } from "@/lib/second-year-progress";
import { physicalBenchmarkComparison } from "@/lib/sa1-types";
import type { FitnessReference, PhysicalTest } from "@/lib/sa1-types";

const format = (value: number) => value.toLocaleString("es-ES", { maximumFractionDigits: 1 });

export function SecondYearPhysicalProgress() {
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
  const chart = periods.map((item) => ({ name: item.label, personal: item.index, reference: item.index == null ? null : 100 }));
  const hasComparison = periods.some((item) => item.index != null);

  return <section className="space-y-5" aria-labelledby="physical-progress-title">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h3 id="physical-progress-title" className="text-xl font-extrabold">Mi condición física frente al promedio de Bachillerato</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">La gráfica representa la suma de tus resultados ajustados a la referencia. El 100% equivale al promedio de las mismas pruebas registradas.</p></div>
      <Link href="/alumno/2bach/sa1/registro" className="rounded-xl bg-[#1e6b4f] px-4 py-3 text-sm font-bold text-white">Registrar o editar marcas</Link>
    </div>
    {!fitnessReference && <p className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">Elige una referencia masculina o femenina en «Registro de datos» para activar la comparación. Tus marcas registradas se muestran igualmente aquí.</p>}
    {fitnessReference && <p className="text-sm text-slate-500">Referencia {fitnessReference}. Se utilizan los promedios orientativos configurados para cada prueba, no una media calculada con las cuentas del alumnado.</p>}
    {hasComparison ? <figure className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-5">
      <div role="img" aria-label="Gráfica de condición física: tus resultados en septiembre y diciembre frente al promedio del 100%. Valores disponibles en la tabla siguiente." className="h-72 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chart} margin={{ top: 15, right: 15, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" /><YAxis width={48} domain={[0, (max: number) => Math.max(120, Math.ceil(max / 20) * 20)]} tickFormatter={(value: number) => `${value}%`} />
            <Tooltip formatter={(value) => `${format(Number(value))}%`} /><Legend />
            <Line dataKey="reference" name="Promedio de Bachillerato" stroke="#64748b" strokeDasharray="6 4" strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} />
            <Line dataKey="personal" name="Mis resultados" stroke="#1e6b4f" strokeWidth={3} dot={{ r: 6 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div><figcaption className="mt-3 text-xs leading-5 text-slate-500">Cada prueba tiene el mismo peso. Los periodos pueden contener distintas pruebas: consulta cuántas se han comparado antes de interpretar el cambio.</figcaption>
    </figure> : <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-600">Todavía no hay resultados comparables para dibujar la gráfica. Registra tus marcas y elige la referencia; los periodos pendientes no se cuentan como cero.</p>}
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-left text-sm"><caption className="p-3 text-left font-bold">Suma de resultados y referencia de las mismas pruebas</caption>
        <thead className="bg-slate-50 text-xs text-slate-600"><tr><th className="p-3">Toma</th><th className="p-3">Registradas</th><th className="p-3">Comparadas</th><th className="p-3">Mis puntos</th><th className="p-3">Puntos de referencia</th><th className="p-3">Respecto al promedio</th></tr></thead>
        <tbody>{periods.map((item) => <tr key={item.period} className="border-t border-slate-100"><th scope="row" className="p-3">{item.label}</th><td className="p-3">{item.recorded}/{tests.length}</td><td className="p-3">{item.compared}</td><td className="p-3">{item.points == null ? "—" : format(item.points)}</td><td className="p-3">{item.benchmarkPoints == null ? "—" : format(item.benchmarkPoints)}</td><td className="p-3 font-bold">{item.index == null ? "Pendiente" : `${format(item.index)}%`}</td></tr>)}</tbody>
      </table>
    </div>
    <details className="rounded-xl bg-slate-50 p-4"><summary className="cursor-pointer font-bold">Ver mis marcas por prueba</summary>
      <div className="mt-4 divide-y divide-slate-200">{tests.map((test) => <article key={test.id} className="py-3"><h4 className="font-bold">{test.name}</h4><div className="mt-2 grid gap-2 sm:grid-cols-2">{periods.map(({ period, label }) => {
        const value = test[period];
        const comparison = fitnessReference ? physicalBenchmarkComparison(test, value, fitnessReference) : null;
        return <p key={period} className="text-sm text-slate-600">{label}: {value == null ? "Pendiente" : `${format(value)} ${test.unit}`}{comparison && <span className="ml-2 font-bold text-[#1e6b4f]">· {format(comparison.index)}%</span>}</p>;
      })}</div></article>)}</div>
    </details>
    <p className="text-xs leading-5 text-slate-500">Cálculo: marca ÷ referencia en pruebas donde más es mejor; referencia ÷ marca en pruebas donde menos es mejor. Se suman esos índices y se dividen entre los puntos de referencia. Las marcas sin referencia válida o no positivas quedan fuera de la comparación.</p>
  </section>;
}

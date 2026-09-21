"use client";

import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export type PhysicalRadarPoint = {
  capacity: string;
  initial: number | null;
  final: number | null;
  reference?: number | null;
};

const format = (value: number) => `${value.toLocaleString("es-ES", { maximumFractionDigits: 1 })}%`;

export function PhysicalRadarChart({ data, title = "Evolución por capacidades físicas" }: { data: PhysicalRadarPoint[]; title?: string }) {
  const available = data.filter((item) => item.initial !== null || item.final !== null);
  if (available.length < 3) {
    return <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">La red se mostrará cuando haya resultados comparables en al menos tres capacidades. Ninguna marca pendiente se cuenta como cero.</p>;
  }
  const chart = available.map((item) => ({ ...item, reference: item.reference ?? 100 }));
  const maximum = Math.max(120, ...chart.flatMap((item) => [item.initial ?? 0, item.final ?? 0, item.reference ?? 100]));
  return <figure className="modern-panel overflow-hidden p-4 sm:p-6">
    <figcaption className="mb-2"><h4 className="text-lg font-black text-slate-950">{title}</h4><p className="mt-1 text-sm text-slate-500">Cuanto más se aleja el polígono del centro, mayor es el índice respecto al promedio. La línea discontinua marca el 100 %.</p></figcaption>
    <div className="h-[360px] min-w-0 sm:h-[430px]" role="img" aria-label={chart.map((item) => `${item.capacity}: inicial ${item.initial == null ? "pendiente" : format(item.initial)}, final ${item.final == null ? "pendiente" : format(item.final)}`).join(". ")}>
      <ResponsiveContainer width="100%" height="100%"><RadarChart data={chart} outerRadius="72%" margin={{ top: 24, right: 36, bottom: 24, left: 36 }}>
        <PolarGrid stroke="#cbd5e1" radialLines={true}/>
        <PolarAngleAxis dataKey="capacity" tick={{ fill: "#334155", fontSize: 12, fontWeight: 700 }}/>
        <PolarRadiusAxis angle={90} domain={[0, Math.ceil(maximum / 20) * 20]} tickFormatter={(value: number) => `${value}%`} tick={{ fill: "#64748b", fontSize: 10 }}/>
        <Tooltip formatter={(value) => value == null ? "Pendiente" : format(Number(value))}/>
        <Legend verticalAlign="bottom"/>
        <Radar name="Promedio de Bachillerato" dataKey="reference" stroke="#64748b" fill="#94a3b8" fillOpacity={0.03} strokeDasharray="6 5" isAnimationActive={false}/>
        <Radar name="Resultado inicial" dataKey="initial" stroke="#0f766e" fill="#14b8a6" fillOpacity={0.18} strokeWidth={2} connectNulls={false}/>
        <Radar name="Resultado final" dataKey="final" stroke="#7c3aed" fill="#8b5cf6" fillOpacity={0.24} strokeWidth={3} connectNulls={false}/>
      </RadarChart></ResponsiveContainer>
    </div>
  </figure>;
}


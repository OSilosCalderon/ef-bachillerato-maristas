"use client";

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type EvolutionDatum = { label: string; september: number; november: number };

export function ComparisonBarChart({ data }: { data: EvolutionDatum[] }) {
  return (
    <div className="h-72 w-full" aria-label="Comparativa visual septiembre y noviembre">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 12, left: -16 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #dfe6e2" }} />
          <Legend />
          <Bar dataKey="september" name="Septiembre" fill="#94a3b8" radius={[6, 6, 0, 0]} />
          <Bar dataKey="november" name="Noviembre" fill="#1e6b4f" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EvolutionLineChart({ data }: { data: EvolutionDatum[] }) {
  const flattened = data.flatMap((item) => [
    { point: `${item.label} · Sep`, value: item.september },
    { point: `${item.label} · Nov`, value: item.november },
  ]);
  return (
    <div className="h-72 w-full" aria-label="Evolución individual normalizada">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={flattened} margin={{ top: 8, right: 10, bottom: 40, left: -16 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="point" angle={-28} textAnchor="end" height={60} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #dfe6e2" }} />
          <Line type="monotone" dataKey="value" name="Índice demo" stroke="#1e6b4f" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

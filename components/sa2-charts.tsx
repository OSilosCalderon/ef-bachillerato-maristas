"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Datum = { label: string; value: number };

export function Sa2LineChart({ data, suffix = "%" }: { data: Datum[]; suffix?: string }) {
  return (
    <div className="mt-5 h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[0, 100]} />
          <Tooltip formatter={(value) => [`${value}${suffix}`, "Índice"]} contentStyle={{ borderRadius: 12, border: "1px solid #dfe6e2" }} />
          <Line type="monotone" dataKey="value" stroke="#1e6b4f" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Sa2BarChart({ data }: { data: Datum[] }) {
  return (
    <div className="mt-5 h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[0, 100]} />
          <Tooltip formatter={(value) => [`${value}%`, "Índice agregado"]} contentStyle={{ borderRadius: 12, border: "1px solid #dfe6e2" }} />
          <Bar dataKey="value" fill="#1e6b4f" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { week: "S1", value: 32 }, { week: "S2", value: 41 }, { week: "S3", value: 47 },
  { week: "S4", value: 53 }, { week: "S5", value: 61 }, { week: "S6", value: 67 },
];

export function SimpleChart() {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
          <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[0, 100]} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #dfe6e2" }} />
          <Line type="monotone" dataKey="value" stroke="#1e6b4f" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

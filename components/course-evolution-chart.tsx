"use client";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function CourseEvolutionChart({ data }: { data: { label: string; value: number }[] }) {
  return (
    <div className="mt-5 h-72 w-full" aria-label="Gráfica de evolución agregada del curso">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 12, bottom: 25, left: -15 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3"/>
          <XAxis dataKey="label" angle={-12} textAnchor="end" height={70} axisLine={false} tickLine={false} tick={{ fontSize: 11 }}/>
          <YAxis domain={[0,100]} axisLine={false} tickLine={false} tick={{ fontSize: 11 }}/>
          <Tooltip formatter={(value: number | string)=>[`${value}%`, "Progreso agregado"]} contentStyle={{borderRadius:12,border:"1px solid #dfe6e2"}}/>
          <Line type="monotone" dataKey="value" stroke="#1e6b4f" strokeWidth={3} dot={{r:5}} activeDot={{r:7}}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

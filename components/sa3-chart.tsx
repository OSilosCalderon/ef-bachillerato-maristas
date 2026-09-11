"use client";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function Sa3BarChart({ data }: { data: { label: string; value: number }[] }) {
  return <div className="mt-5 h-60 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}><CartesianGrid vertical={false} strokeDasharray="3 3"/><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize:11}}/><YAxis domain={[0,5]} axisLine={false} tickLine={false} tick={{fontSize:11}}/><Tooltip contentStyle={{borderRadius:12,border:"1px solid #dfe6e2"}}/><Bar dataKey="value" fill="#1e6b4f" radius={[8,8,0,0]}/></BarChart></ResponsiveContainer></div>;
}

export function Sa3LineChart({ data }: { data: { label: string; value: number }[] }) {
  return <div className="mt-5 h-60 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top:8,right:12,bottom:0,left:-18 }}><CartesianGrid vertical={false} strokeDasharray="3 3"/><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize:11}}/><YAxis domain={[0,100]} axisLine={false} tickLine={false} tick={{fontSize:11}}/><Tooltip formatter={(value)=>[`${value ?? 0}%`,"Índice personal"]} contentStyle={{borderRadius:12,border:"1px solid #dfe6e2"}}/><Line type="monotone" dataKey="value" stroke="#1e6b4f" strokeWidth={3} dot={{r:4}}/></LineChart></ResponsiveContainer></div>;
}

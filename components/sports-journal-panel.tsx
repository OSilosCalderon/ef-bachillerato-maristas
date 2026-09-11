"use client";

import { useState } from "react";
import { CalendarDays, List, Plus } from "lucide-react";
import { sports, sportsJournalEntries as seed } from "@/lib/sa2-demo-data";
import type { SportsJournalEntry } from "@/lib/sa2-types";

export function SportsJournalPanel() {
  const [entries, setEntries] = useState(seed);
  const [mode, setMode] = useState<"list" | "timeline">("list");
  const add = () => setEntries([{
    id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), sportId: sports[0]?.id ?? "",
    contentWorked: "", exercises: "", learning: "", difficulty: 3, participation: 3,
    performancePerception: 3, needsImprovement: "", reflection: "",
  }, ...entries]);

  const update = <K extends keyof SportsJournalEntry>(id: string, key: K, value: SportsJournalEntry[K]) =>
    setEntries((current) => current.map((entry) => entry.id === id ? { ...entry, [key]: value } : entry));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between gap-3">
        <div className="flex rounded-xl border border-slate-200 bg-white p-1">
          <button onClick={() => setMode("list")} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${mode === "list" ? "bg-slate-100" : ""}`}><List size={16}/>Lista</button>
          <button onClick={() => setMode("timeline")} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${mode === "timeline" ? "bg-slate-100" : ""}`}><CalendarDays size={16}/>Cronología</button>
        </div>
        <button onClick={add} className="flex items-center gap-2 rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white"><Plus size={17}/>Nueva entrada</button>
      </div>
      <div className={mode === "timeline" ? "space-y-5 border-l-2 border-slate-200 pl-5" : "space-y-4"}>
        {entries.map((entry) => (
          <article key={entry.id} className="card p-5 sm:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Fecha"><input type="date" value={entry.date} onChange={(e) => update(entry.id, "date", e.target.value)} className="input"/></Field>
              <Field label="Deporte"><select value={entry.sportId} onChange={(e) => update(entry.id, "sportId", e.target.value)} className="input">{sports.filter((sport) => sport.active).map((sport) => <option key={sport.id} value={sport.id}>{sport.name}</option>)}</select></Field>
            </div>
            {([
              ["contentWorked", "Contenido trabajado"],
              ["exercises", "Ejercicios realizados"],
              ["learning", "Qué he aprendido"],
              ["needsImprovement", "Qué necesito mejorar"],
              ["reflection", "Reflexión"],
            ] as const).map(([key, label]) => (
              <Field key={key} label={label}><textarea rows={2} value={entry[key]} onChange={(e) => update(entry.id, key, e.target.value)} className="input"/></Field>
            ))}
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Range label="Dificultad" value={entry.difficulty} max={5} onChange={(value) => update(entry.id, "difficulty", value)} />
              <Range label="Participación" value={entry.participation} max={5} onChange={(value) => update(entry.id, "participation", value)} />
              <Range label="Percepción del rendimiento" value={entry.performancePerception} max={5} onChange={(value) => update(entry.id, "performancePerception", value)} />
            </div>
          </article>
        ))}
      </div>
      <style jsx>{`.input{margin-top:.5rem;width:100%;border-radius:.75rem;border:1px solid rgb(226 232 240);padding:.75rem;font-size:.875rem}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-slate-500">{label}{children}</label>;
}

function Range({ label, value, max, onChange }: { label: string; value: number; max: number; onChange: (value: number) => void }) {
  return <label className="text-xs font-bold uppercase tracking-wide text-slate-500">{label} · {value}/{max}<input type="range" min="1" max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full"/></label>;
}

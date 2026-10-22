"use client";

import { useId, useState } from "react";
import { Copy } from "lucide-react";
import { copyPlanItemToSession, type PlanItem } from "@/lib/personal-plan-tasks";

type Session = { date: string; day: string; start: string };

export function CopyPlanTask({ item, sessions, onCopy }: {
  item: PlanItem; sessions: Session[]; onCopy: (copy: PlanItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const [destination, setDestination] = useState("");
  const panelId = useId();
  const selectId = useId();
  const available = sessions.filter((session) => session.date !== item.sessionDate);
  const target = available.find((session) => session.date === destination);
  const dateLabel = (date: string) => new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long" }).format(new Date(`${date}T12:00:00`));

  function confirmCopy() {
    if (!target) return;
    onCopy(copyPlanItemToSession(item, target));
    setOpen(false);
    setDestination("");
  }

  return <div className="md:col-span-2">
    <button type="button" disabled={!available.length} aria-expanded={open} aria-controls={panelId} onClick={() => { setOpen((value) => !value); setDestination(""); }} className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-bold text-[#164c3a] disabled:opacity-50">
      <Copy size={17} aria-hidden="true"/>Copiar tarea a otro día
    </button>
    {open && <div id={panelId} className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
      <p className="text-sm font-bold text-[#164c3a]">Copiar {item.activity.trim() ? `«${item.activity.trim()}»` : "esta tarea"}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">Se copiarán los ejercicios, las cargas, los materiales y el objetivo. Las tareas que ya haya en el día elegido se conservarán.</p>
      <label htmlFor={selectId} className="mt-3 block text-sm font-bold text-slate-700">Sesión de destino</label>
      <select id={selectId} value={destination} onChange={(event) => setDestination(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm">
        <option value="">Elige otro día del calendario</option>
        {available.map((session) => <option key={session.date} value={session.date}>Sesión {sessions.findIndex((entry) => entry.date === session.date) + 1} · {session.day}, {dateLabel(session.date)} · {session.start}</option>)}
      </select>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={!target} onClick={confirmCopy} className="rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">Copiar a la sesión elegida</button>
        <button type="button" onClick={() => { setOpen(false); setDestination(""); }} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-600">Cancelar</button>
      </div>
    </div>}
  </div>;
}

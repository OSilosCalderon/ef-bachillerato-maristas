"use client";

import { Dumbbell, Plus, Trash2 } from "lucide-react";

export type TrainingPlanItem = {
  id: string;
  activity: string;
  series: number;
  repetitions: number;
};

type Props = {
  plan: TrainingPlanItem[];
  onChange: (plan: TrainingPlanItem[]) => void;
};

function newItem(): TrainingPlanItem {
  return {
    id: crypto.randomUUID(),
    activity: "",
    series: 1,
    repetitions: 1,
  };
}

export function TrainingPlanEditor({ plan, onChange }: Props) {
  const addItem = () => onChange([...plan, newItem()]);

  const updateItem = <K extends keyof TrainingPlanItem>(
    id: string,
    key: K,
    value: TrainingPlanItem[K],
  ) => {
    onChange(plan.map((item) => (item.id === id ? { ...item, [key]: value } : item)));
  };

  const removeItem = (id: string) => {
    onChange(plan.filter((item) => item.id !== id));
  };

  return (
    <section className="mt-4 rounded-2xl border border-[#d9e8e0] bg-[#f7fbf9] p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.14em] text-[#1e6b4f]">
            <Dumbbell size={16} /> Plan de trabajo de condición física
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Registra cada actividad y cómo la has programado mediante series y repeticiones.
          </p>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#bfd8ca] bg-white px-3 py-2 text-sm font-bold text-[#1e6b4f] hover:bg-[#eef7f2]"
        >
          <Plus size={16} /> Añadir actividad
        </button>
      </div>

      {plan.length === 0 ? (
        <button
          type="button"
          onClick={addItem}
          className="mt-4 w-full rounded-xl border border-dashed border-[#bfd8ca] bg-white px-4 py-5 text-center text-sm font-semibold text-slate-500 hover:bg-[#f4faf7]"
        >
          Añade la primera actividad de tu entrenamiento
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="hidden grid-cols-[minmax(0,1fr)_110px_130px_44px] gap-3 px-1 text-[11px] font-extrabold uppercase tracking-wide text-slate-400 sm:grid">
            <span>Actividad</span>
            <span>Series</span>
            <span>Repeticiones</span>
            <span className="sr-only">Eliminar</span>
          </div>

          {plan.map((item, index) => (
            <div
              key={item.id}
              className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_110px_130px_44px] sm:items-end sm:p-2"
            >
              <label className="min-w-0 text-xs font-bold text-slate-500 sm:text-transparent">
                <span className="sm:sr-only">Actividad</span>
                <input
                  value={item.activity}
                  maxLength={120}
                  placeholder={`Actividad ${index + 1} (por ejemplo, sentadillas)`}
                  onChange={(event) => updateItem(item.id, "activity", event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm text-slate-800 sm:mt-0"
                />
              </label>

              <label className="text-xs font-bold text-slate-500 sm:text-transparent">
                <span className="sm:sr-only">Series</span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  inputMode="numeric"
                  value={item.series}
                  onChange={(event) =>
                    updateItem(item.id, "series", Math.max(1, Math.min(50, Number(event.target.value) || 1)))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm text-slate-800 sm:mt-0"
                  aria-label={`Series de ${item.activity || `actividad ${index + 1}`}`}
                />
              </label>

              <label className="text-xs font-bold text-slate-500 sm:text-transparent">
                <span className="sm:sr-only">Repeticiones</span>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  inputMode="numeric"
                  value={item.repetitions}
                  onChange={(event) =>
                    updateItem(
                      item.id,
                      "repetitions",
                      Math.max(1, Math.min(1000, Number(event.target.value) || 1)),
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm text-slate-800 sm:mt-0"
                  aria-label={`Repeticiones de ${item.activity || `actividad ${index + 1}`}`}
                />
              </label>

              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="flex h-10 items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50"
                aria-label={`Eliminar ${item.activity || `actividad ${index + 1}`}`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

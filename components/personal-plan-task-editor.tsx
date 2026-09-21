"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { secondYearExercises } from "@/lib/second-year-exercises";
import { emptyExercise, methodologyLabels, type PlanExercise, type PlanItem } from "@/lib/personal-plan-tasks";

const capacities = [["condicion-fisica-general", "General y coordinación"], ["fuerza", "Fuerza"], ["resistencia", "Resistencia"], ["velocidad", "Velocidad"], ["flexibilidad-movilidad", "Flexibilidad y movilidad"]];
const field = "mt-2 w-full min-w-0 rounded-xl border border-slate-200 bg-white p-3 text-sm font-normal";

export function PersonalPlanTaskEditor({ item, onChange }: { item: PlanItem; onChange: (item: PlanItem) => void }) {
  function edit(id: string, update: Partial<PlanExercise>) {
    onChange({ ...item, exercises: item.exercises.map((exercise) => exercise.id === id ? { ...exercise, ...update } : exercise) });
  }
  function select(id: string, exerciseId: string) {
    const exercise = secondYearExercises.find((entry) => entry.id === exerciseId);
    if (exercise) edit(id, { exerciseId, activity: exercise.name, description: exercise.description, capacity: exercise.capacity, dose: exercise.dose, recovery: exercise.recovery });
    else edit(id, { exerciseId: "", description: "" });
  }
  function move(index: number, offset: number) {
    const exercises = [...item.exercises];
    [exercises[index], exercises[index + offset]] = [exercises[index + offset], exercises[index]];
    onChange({ ...item, exercises });
  }
  return <div className="space-y-4 md:col-span-2">
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-bold">Nombre de la tarea<input value={item.activity} onChange={(event) => onChange({ ...item, activity: event.target.value })} placeholder="Ej.: circuito de fuerza y resistencia" className={field}/></label>
      <label className="text-sm font-bold">Metodología<select value={item.methodology} onChange={(event) => onChange({ ...item, methodology: event.target.value as PlanItem["methodology"] })} className={field}>{Object.entries(methodologyLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="text-sm font-bold">Vueltas de la tarea completa<input value={item.rounds} onChange={(event) => onChange({ ...item, rounds: event.target.value })} placeholder="Ej.: 2 vueltas" className={field}/></label>
      <label className="text-sm font-bold">Descanso entre vueltas<input value={item.roundRecovery} onChange={(event) => onChange({ ...item, roundRecovery: event.target.value })} placeholder="Ej.: 2 min caminando" className={field}/></label>
    </div>
    <div className="rounded-xl bg-emerald-50 p-4 text-sm leading-6">
      {item.methodology === "circuit" ? "Organiza estaciones en el orden de la lista. Indica el trabajo y la pausa de cada estación y las vueltas del circuito. Ejemplo escolar: 30 s de trabajo y 30 s de pausa, con movimientos controlados. Adapta la dosis del catálogo a cada estación." : item.methodology === "total" ? "Combina bloques de carrera, fuerza, coordinación y movilidad en el orden de la lista. Aquí total training se utiliza como una propuesta escolar de trabajo global: cada bloque conserva su propia carga y recuperación." : "Combina los ejercicios necesarios para tu objetivo, indicando el orden, el trabajo y la recuperación de cada uno."}
      <p className="mt-2">La dosis de cada ejercicio se realiza en cada vuelta. Cuenta también los descansos al organizar los 55 minutos, dejando tiempo para calentamiento y vuelta a la calma. Sitúa la velocidad tras el calentamiento, antes de acumular fatiga; no la conviertas en una estación de resistencia.</p>
      {item.methodology === "circuit" && <p className="mt-2 text-xs text-slate-600">Base: Jiménez, PDF p. 82. Organización y cargas adaptadas al aula.</p>}
    </div>
    {item.exercises.map((exercise, index) => <fieldset key={exercise.id} className="min-w-0 rounded-xl border border-slate-200 p-4">
      <legend className="px-2 text-sm font-bold">{item.methodology === "circuit" ? "Estación" : "Ejercicio / bloque"} {index + 1}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-bold sm:col-span-2">Ejercicio del catálogo<select value={exercise.exerciseId} onChange={(event) => select(exercise.id, event.target.value)} className={field}><option value="">Otro ejercicio: escribirlo manualmente</option>{capacities.map(([value, label]) => <optgroup key={value} label={label}>{secondYearExercises.filter((entry) => entry.capacity === value).map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</optgroup>)}</select><span className="mt-2 block text-xs font-normal leading-5 text-slate-500">Puedes elegir una propuesta o seleccionar «Otro ejercicio» y escribir debajo tu actividad, capacidad, carga y descanso.</span></label>
        {exercise.description && <div className="rounded-xl bg-slate-50 p-3 text-sm leading-6 sm:col-span-2"><p>{exercise.description}</p><p className="mt-2 text-xs text-slate-500">{secondYearExercises.find((entry) => entry.id === exercise.exerciseId)?.source}</p></div>}
        <label className="text-sm font-bold">Actividad o ejercicio propuesto por ti<input value={exercise.activity} onChange={(event) => edit(exercise.id, { activity: event.target.value })} placeholder="Escribe el nombre del ejercicio" className={field}/></label>
        <label className="text-sm font-bold">Capacidad<select value={exercise.capacity} onChange={(event) => edit(exercise.id, { capacity: event.target.value })} className={field}>{capacities.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="text-sm font-bold">Trabajo por vuelta · series, tiempo e intensidad<input value={exercise.dose} onChange={(event) => edit(exercise.id, { dose: event.target.value })} placeholder="30 s · esfuerzo 5/10, o 2 × 8 repeticiones" className={field}/></label>
        <label className="text-sm font-bold">Pausas internas y antes del siguiente ejercicio<input value={exercise.recovery} onChange={(event) => edit(exercise.id, { recovery: event.target.value })} placeholder="30 s entre estaciones" className={field}/></label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Subir ejercicio ${index + 1}`} className="rounded-lg border p-2 disabled:opacity-30"><ArrowUp size={16}/></button>
        <button type="button" disabled={index === item.exercises.length - 1} onClick={() => move(index, 1)} aria-label={`Bajar ejercicio ${index + 1}`} className="rounded-lg border p-2 disabled:opacity-30"><ArrowDown size={16}/></button>
        <button type="button" onClick={() => onChange({ ...item, exercises: item.exercises.filter((entry) => entry.id !== exercise.id) })} className="inline-flex items-center gap-2 rounded-lg border p-2 text-sm text-red-700"><Trash2 size={16}/>Quitar ejercicio {index + 1}</button>
      </div>
    </fieldset>)}
    <button type="button" onClick={() => onChange({ ...item, exercises: [...item.exercises, emptyExercise()] })} className="inline-flex items-center gap-2 rounded-xl bg-[#1e6b4f] px-4 py-3 text-sm font-bold text-white"><Plus size={17}/>Añadir otro ejercicio a esta tarea</button>
    <p className="text-xs text-slate-500">Puedes incluir varios ejercicios en una tarea y varias tareas en una misma sesión. Pulsa «Guardar plan» al terminar.</p>
  </div>;
}


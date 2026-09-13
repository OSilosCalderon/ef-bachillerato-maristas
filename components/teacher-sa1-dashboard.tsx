"use client";

import { useMemo, useState } from "react";
import { Activity, BookOpen, ClipboardCheck, FileText, Plus, Users } from "lucide-react";
import { ComparisonBarChart, EvolutionLineChart } from "@/components/sa1-charts";
import { TeacherSa1JournalViewer } from "@/components/teacher-sa1-journal-viewer";
import { classEvolution, questionnaires, studentEvolution, theoryContents } from "@/lib/sa1-demo-data";
import { students } from "@/lib/demo-data";

type Tab = "overview" | "journal" | "questionnaires" | "content" | "tests";

export function TeacherSa1Dashboard() {
  const [group, setGroup] = useState("1º Bach A");
  const groupStudents = useMemo(() => students.filter((s) => s.group === group), [group]);
  const [studentId, setStudentId] = useState(groupStudents[0]?.id ?? "");
  const [tab, setTab] = useState<Tab>("overview");
  const selected = students.find((s) => s.id === studentId) ?? groupStudents[0];

  const selectGroup = (next: string) => {
    setGroup(next);
    setStudentId(students.find((s) => s.group === next)?.id ?? "");
  };

  return (
    <div className="space-y-6">
      <section className="card p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Grupo
            <select
              value={group}
              onChange={(e) => selectGroup(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold"
            >
              <option>1º Bach A</option>
              <option>1º Bach B</option>
            </select>
          </label>
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Alumno/a
            <select
              value={selected?.id ?? ""}
              onChange={(e) => setStudentId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold"
            >
              {groupStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi icon={Users} label="Alumnado del grupo" value={String(groupStudents.length)} note="Datos demo" />
        <Kpi icon={Activity} label="Pruebas comparables" value="4" note="Septiembre–diciembre" />
        <Kpi icon={BookOpen} label="Contenidos publicados" value={String(theoryContents.length)} note="Biblioteca SA1" />
        <Kpi icon={ClipboardCheck} label="Cuestionarios activos" value="1" note="Sin rankings" />
        <Kpi icon={Activity} label="Realización alumno/a" value={`${selected?.progress ?? 0}%`} note={selected?.name ?? "Sin selección"} />
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(
          [
            ["overview", "Evolución"],
            ["journal", "Diarios"],
            ["questionnaires", "Cuestionarios"],
            ["content", "Publicar contenido"],
            ["tests", "Crear prueba"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold ${
              tab === key ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid gap-5 xl:grid-cols-2">
          <section className="card p-6">
            <h2 className="text-lg font-extrabold">Evolución individual · {selected?.name}</h2>
            <p className="mt-1 text-xs text-slate-500">
              Índice normalizado demo para visualizar tendencias entre septiembre y diciembre en pruebas con distintas unidades.
            </p>
            <EvolutionLineChart data={studentEvolution} />
          </section>
          <section className="card p-6">
            <h2 className="text-lg font-extrabold">Evolución global · {group}</h2>
            <p className="mt-1 text-xs text-slate-500">
              Resumen agregado de clase. No muestra posiciones ni rankings individuales.
            </p>
            <ComparisonBarChart data={classEvolution} />
          </section>
        </div>
      )}

      {tab === "journal" && <TeacherSa1JournalViewer />}

      {tab === "questionnaires" && (
        <div className="space-y-5">
          <section className="grid gap-4 md:grid-cols-2">
            {questionnaires.map((q) => (
              <article key={q.id} className="card p-6">
                <ClipboardCheck className="text-[#1e6b4f]" />
                <h2 className="mt-4 font-extrabold">{q.title}</h2>
                <p className="mt-2 text-sm text-slate-500">{q.description}</p>
                <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
                  <strong>{selected?.name}:</strong> {q.status === "completed" ? "Completado" : "Pendiente"}
                </div>
              </article>
            ))}
          </section>
          <QuestionnaireBuilder />
        </div>
      )}

      {tab === "content" && <TeacherContentForm />}
      {tab === "tests" && <TeacherTestForm />}
    </div>
  );
}

function Kpi({ icon: Icon, label, value, note }: { icon: typeof Users; label: string; value: string; note: string }) {
  return (
    <article className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <Icon size={18} className="text-[#1e6b4f]" />
      </div>
      <p className="mt-3 text-3xl font-extrabold">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{note}</p>
    </article>
  );
}

function QuestionnaireBuilder() {
  return (
    <section className="card p-6">
      <div className="flex items-center gap-3">
        <ClipboardCheck className="text-[#1e6b4f]" />
        <div>
          <h2 className="font-extrabold">Crear cuestionario</h2>
          <p className="text-sm text-slate-500">Constructor genérico demo. No incluye instrumentos psicológicos predefinidos.</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Título" placeholder="Título del cuestionario" />
        <Field label="Descripción" placeholder="Breve descripción" />
        <label className="md:col-span-2 text-xs font-bold text-slate-500">
          INSTRUCCIONES
          <textarea rows={3} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm" />
        </label>
        <Field label="Fecha de apertura" type="datetime-local" />
        <Field label="Fecha de cierre" type="datetime-local" />
      </div>
      <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-5">
        <div className="flex flex-wrap items-end gap-4">
          <Field label="Pregunta" placeholder="Enunciado de la pregunta" />
          <label className="text-xs font-bold text-slate-500">
            TIPO
            <select className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm">
              <option>Texto</option>
              <option>Selección única</option>
              <option>Selección múltiple</option>
              <option>Escala 1–5</option>
              <option>Escala 1–7</option>
              <option>Escala 1–10</option>
            </select>
          </label>
          <label className="text-xs font-bold text-slate-500">
            OPCIONES
            <textarea
              rows={3}
              placeholder="Una opción por línea (solo para selección)"
              className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"
            />
          </label>
          <label className="flex items-center gap-2 pb-3 text-sm text-slate-600">
            <input type="checkbox" /> Puntuación opcional
          </label>
        </div>
        <button className="mt-3 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold">Añadir pregunta</button>
      </div>
      <button className="mt-5 rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white">Guardar borrador</button>
    </section>
  );
}

function TeacherContentForm() {
  return (
    <section className="card p-6">
      <div className="flex items-center gap-3">
        <span className="rounded-xl bg-[#e7f2ed] p-2 text-[#1e6b4f]">
          <FileText size={19} />
        </span>
        <div>
          <h2 className="font-extrabold">Nuevo contenido teórico</h2>
          <p className="text-sm text-slate-500">Formulario demo preparado para persistir en Supabase.</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Título" placeholder="Título del contenido" />
        <Field label="Categoría" placeholder="Entrenamiento, práctica segura…" />
        <label className="md:col-span-2 text-xs font-bold text-slate-500">
          TEXTO ENRIQUECIDO
          <textarea rows={7} placeholder="Contenido…" className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm" />
        </label>
        <Field label="Enlace" placeholder="https://…" />
        <Field label="Fecha de publicación" type="date" />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold">Añadir imagen/documento</button>
        <button className="rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white">Guardar contenido</button>
      </div>
    </section>
  );
}

function TeacherTestForm() {
  return (
    <section className="card p-6">
      <div className="flex items-center gap-3">
        <Plus className="text-[#1e6b4f]" />
        <div>
          <h2 className="font-extrabold">Crear prueba física</h2>
          <p className="text-sm text-slate-500">No existe una lista cerrada: cada prueba define su propia unidad y criterio de evolución.</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Nombre" placeholder="Nombre de la prueba" />
        <Field label="Unidad de medida" placeholder="s, cm, repeticiones…" />
        <label className="text-xs font-bold text-slate-500">
          CRITERIO
          <select className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm">
            <option>Un valor mayor significa mejor resultado</option>
            <option>Un valor menor significa mejor resultado</option>
          </select>
        </label>
        <label className="text-xs font-bold text-slate-500">
          ESTADO
          <select className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm">
            <option>Activo</option>
            <option>Inactivo</option>
          </select>
        </label>
        <label className="md:col-span-2 text-xs font-bold text-slate-500">
          DESCRIPCIÓN
          <textarea rows={2} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm" />
        </label>
        <label className="md:col-span-2 text-xs font-bold text-slate-500">
          INSTRUCCIONES
          <textarea rows={3} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm" />
        </label>
      </div>
      <button className="mt-5 rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white">Crear prueba</button>
    </section>
  );
}

function Field({ label, placeholder, type = "text" }: { label: string; placeholder?: string; type?: string }) {
  return (
    <label className="text-xs font-bold text-slate-500">
      {label.toUpperCase()}
      <input
        type={type}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"
      />
    </label>
  );
}

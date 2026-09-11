"use client";

import { useMemo, useState } from "react";
import { BarChart3, BookOpen, BrainCircuit, ClipboardCheck, Dumbbell, NotebookPen, Plus, Users } from "lucide-react";
import { Sa2BarChart, Sa2LineChart } from "@/components/sa2-charts";
import {
  groupTechnicalEvolution, individualTechnicalEvolution, proceduralAttempts, sa2Questionnaires,
  sa2TheoryContents, sports, sportsJournalEntries, technicalTests,
} from "@/lib/sa2-demo-data";
import { students } from "@/lib/demo-data";

type Tab = "overview" | "journal" | "questionnaires" | "procedural" | "content" | "sports" | "tests";

export function TeacherSa2Dashboard() {
  const [group, setGroup] = useState("1º Bach A");
  const [sportId, setSportId] = useState("all");
  const groupStudents = useMemo(() => students.filter((student) => student.group === group), [group]);
  const [studentId, setStudentId] = useState(groupStudents[0]?.id ?? "");
  const [tab, setTab] = useState<Tab>("overview");
  const selected = students.find((student) => student.id === studentId) ?? groupStudents[0];

  const selectGroup = (next: string) => {
    setGroup(next);
    setStudentId(students.find((student) => student.group === next)?.id ?? "");
  };

  return (
    <div className="space-y-6">
      <section className="card grid gap-4 p-5 lg:grid-cols-3">
        <Select label="Grupo" value={group} onChange={selectGroup}>
          <option>1º Bach A</option><option>1º Bach B</option>
        </Select>
        <Select label="Deporte" value={sportId} onChange={setSportId}>
          <option value="all">Todos los deportes</option>
          {sports.map((sport) => <option key={sport.id} value={sport.id}>{sport.name}</option>)}
        </Select>
        <Select label="Alumno/a" value={selected?.id ?? ""} onChange={setStudentId}>
          {groupStudents.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
        </Select>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi icon={Users} label="Alumnado" value={String(groupStudents.length)} note={group} />
        <Kpi icon={Dumbbell} label="Pruebas técnicas" value={String(technicalTests.length)} note="Configurables" />
        <Kpi icon={BookOpen} label="Contenidos" value={String(sa2TheoryContents.length)} note="Publicados demo" />
        <Kpi icon={ClipboardCheck} label="Cuestionarios" value={String(sa2Questionnaires.length)} note="Motor reutilizado" />
        <Kpi icon={BrainCircuit} label="Actividades procedimentales" value="2" note="Sin rankings" />
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {([
          ["overview", "Evolución"], ["journal", "Diarios"], ["questionnaires", "Cuestionarios"],
          ["procedural", "Conocimiento y decisiones"], ["content", "Publicar contenido"],
          ["sports", "Crear deporte"], ["tests", "Crear prueba técnica"],
        ] as [Tab, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold ${tab === key ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-600"}`}>{label}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid gap-5 xl:grid-cols-2">
          <section className="card p-6"><h2 className="text-lg font-extrabold">Evolución técnica · {selected?.name}</h2><p className="mt-1 text-xs text-slate-500">Índice normalizado demo enero–marzo para integrar pruebas con unidades distintas.</p><Sa2LineChart data={individualTechnicalEvolution}/></section>
          <section className="card p-6"><h2 className="text-lg font-extrabold">Evolución global · {group}</h2><p className="mt-1 text-xs text-slate-500">Resumen agregado del grupo. No muestra posiciones ni rankings individuales.</p><Sa2BarChart data={groupTechnicalEvolution}/></section>
          <section className="card p-6 xl:col-span-2">
            <div className="flex items-center gap-3"><BarChart3 className="text-[#1e6b4f]"/><div><h2 className="font-extrabold">Progreso de SA2</h2><p className="text-sm text-slate-500">Vista docente de realización por dimensiones, sin comparación competitiva.</p></div></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{["Pruebas 75%","Diario 67%","Contenidos 50%","Actividades 60%"].map((item) => <div key={item} className="rounded-xl bg-slate-50 p-4 text-sm font-bold">{item}</div>)}</div>
          </section>
        </div>
      )}

      {tab === "journal" && (
        <section className="card overflow-hidden">
          <div className="border-b border-slate-200 p-6"><h2 className="text-lg font-extrabold">Diario deportivo · {selected?.name}</h2><p className="mt-1 text-sm text-slate-500">Consulta docente de solo lectura.</p></div>
          <div className="divide-y divide-slate-100">{sportsJournalEntries.map((entry) => <article key={entry.id} className="p-6"><div className="flex flex-wrap justify-between gap-2"><h3 className="font-bold">{sports.find((sport) => sport.id === entry.sportId)?.name} · {entry.contentWorked}</h3><span className="text-xs text-slate-400">{entry.date}</span></div><p className="mt-3 text-sm text-slate-600">{entry.reflection}</p><div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500"><span>Dificultad {entry.difficulty}/5</span><span>Participación {entry.participation}/5</span><span>Percepción {entry.performancePerception}/5</span></div></article>)}</div>
        </section>
      )}

      {tab === "questionnaires" && (
        <section className="card p-6">
          <div className="flex items-center gap-3"><ClipboardCheck className="text-[#1e6b4f]"/><div><h2 className="font-extrabold">Cuestionarios asignados a SA2</h2><p className="text-sm text-slate-500">Reutiliza las tablas y tipos genéricos creados en SA1. No se incluye ningún test psicológico real.</p></div></div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">{sa2Questionnaires.map((q) => <article key={q.id} className="rounded-2xl border border-slate-200 p-5"><h3 className="font-bold">{q.title}</h3><p className="mt-2 text-sm text-slate-500">{q.description}</p><p className="mt-4 text-xs text-slate-500"><strong>{selected?.name}:</strong> Pendiente / completado según datos reales</p></article>)}</div>
        </section>
      )}

      {tab === "procedural" && <ProceduralTeacherPanel studentName={selected?.name ?? "Alumno/a"} />}
      {tab === "content" && <Sa2ContentForm />}
      {tab === "sports" && <SportForm />}
      {tab === "tests" && <TechnicalTestForm />}
    </div>
  );
}

function ProceduralTeacherPanel({ studentName }: { studentName: string }) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="card p-6"><BrainCircuit className="text-[#1e6b4f]"/><h2 className="mt-4 text-lg font-extrabold">Resultados de conocimiento procedimental</h2><p className="mt-2 text-sm text-slate-500">Intentos y puntuaciones privadas de {studentName}.</p><div className="mt-4 divide-y divide-slate-100">{proceduralAttempts.map((attempt) => <div key={attempt.id} className="flex justify-between py-3 text-sm"><span>Intento {attempt.attemptNumber} · {attempt.date}</span><strong>{attempt.score}/{attempt.maxScore}</strong></div>)}</div></section>
      <section className="card p-6"><h2 className="text-lg font-extrabold">Constructor de actividad</h2><p className="mt-1 text-sm text-slate-500">Admite preguntas tipo test, escenarios deportivos e imágenes tácticas.</p><div className="mt-5 space-y-4"><Field label="Título" placeholder="Nombre de la actividad"/><Field label="Descripción" placeholder="Descripción breve"/><Field label="Escenario" placeholder="Contexto de juego"/><Field label="Pregunta" placeholder="¿Qué decisión sería más adecuada?"/><label className="block text-xs font-bold text-slate-500">ALTERNATIVAS<textarea rows={4} placeholder={"Una alternativa por línea"} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"/></label><div className="grid gap-4 md:grid-cols-2"><Field label="Respuesta correcta opcional" placeholder="N.º de alternativa"/><Field label="Puntuación" type="number"/></div><label className="block text-xs font-bold text-slate-500">EXPLICACIÓN POSTERIOR<textarea rows={3} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"/></label><button className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold">Añadir imagen táctica</button><button className="ml-2 rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white">Guardar borrador</button></div></section>
    </div>
  );
}

function Sa2ContentForm() {
  return <section className="card p-6"><div className="flex items-center gap-3"><BookOpen className="text-[#1e6b4f]"/><div><h2 className="font-extrabold">Publicar contenido SA2</h2><p className="text-sm text-slate-500">Puede asociarse a toda SA2, a un deporte o a un contenido concreto.</p></div></div><div className="mt-6 grid gap-4 md:grid-cols-2"><Field label="Título" placeholder="Título"/><label className="text-xs font-bold text-slate-500">CATEGORÍA<select className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"><option>Reglamento</option><option>Técnica</option><option>Táctica</option><option>Principios de juego</option><option>Seguridad</option><option>Otros</option></select></label><label className="text-xs font-bold text-slate-500">ÁMBITO<select className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"><option>Toda SA2</option><option>Deporte específico</option><option>Contenido concreto</option></select></label><Select label="Deporte" value="basket" onChange={() => {}}>{sports.map((sport) => <option key={sport.id} value={sport.id}>{sport.name}</option>)}</Select><label className="md:col-span-2 text-xs font-bold text-slate-500">TEXTO ENRIQUECIDO<textarea rows={7} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"/></label><Field label="Enlace" placeholder="https://…"/><Field label="Fecha de publicación" type="date"/></div><div className="mt-4 flex flex-wrap gap-3"><button className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold">Añadir imagen/documento</button><button className="rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white">Guardar contenido</button></div></section>;
}

function SportForm() {
  return <section className="card p-6"><div className="flex items-center gap-3"><Plus className="text-[#1e6b4f]"/><div><h2 className="font-extrabold">Crear deporte</h2><p className="text-sm text-slate-500">El catálogo no está cerrado y puede ampliarse desde administración.</p></div></div><div className="mt-6 grid gap-4 md:grid-cols-2"><Field label="Nombre" placeholder="Nombre del deporte"/><label className="text-xs font-bold text-slate-500">ESTADO<select className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"><option>Activo</option><option>Inactivo</option></select></label><label className="md:col-span-2 text-xs font-bold text-slate-500">DESCRIPCIÓN<textarea rows={3} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"/></label></div><button className="mt-5 rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white">Crear deporte</button></section>;
}

function TechnicalTestForm() {
  return <section className="card p-6"><div className="flex items-center gap-3"><Dumbbell className="text-[#1e6b4f]"/><div><h2 className="font-extrabold">Crear prueba técnica</h2><p className="text-sm text-slate-500">Cada prueba se asocia a un deporte y define su propia unidad y criterio.</p></div></div><div className="mt-6 grid gap-4 md:grid-cols-2"><Field label="Nombre" placeholder="Nombre de la prueba"/><Select label="Deporte" value="basket" onChange={() => {}}>{sports.map((sport) => <option key={sport.id} value={sport.id}>{sport.name}</option>)}</Select><Field label="Unidad" placeholder="s, aciertos, puntos…"/><label className="text-xs font-bold text-slate-500">DIRECCIÓN<select className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"><option>Un valor mayor indica mejor evolución</option><option>Un valor menor indica mejor evolución</option></select></label><label className="md:col-span-2 text-xs font-bold text-slate-500">CRITERIO DE VALORACIÓN<textarea rows={2} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"/></label><label className="md:col-span-2 text-xs font-bold text-slate-500">DESCRIPCIÓN<textarea rows={2} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"/></label><label className="md:col-span-2 text-xs font-bold text-slate-500">INSTRUCCIONES<textarea rows={3} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"/></label></div><button className="mt-5 rounded-xl bg-[#1e6b4f] px-4 py-2.5 text-sm font-bold text-white">Crear prueba técnica</button></section>;
}

function Kpi({ icon: Icon, label, value, note }: { icon: typeof Users; label: string; value: string; note: string }) {
  return <article className="card p-5"><div className="flex items-center justify-between"><p className="text-sm text-slate-500">{label}</p><Icon size={18} className="text-[#1e6b4f]"/></div><p className="mt-3 text-3xl font-extrabold">{value}</p><p className="mt-1 text-xs text-slate-400">{note}</p></article>;
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return <label className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}<select value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold">{children}</select></label>;
}

function Field({ label, placeholder, type = "text" }: { label: string; placeholder?: string; type?: string }) {
  return <label className="text-xs font-bold text-slate-500">{label.toUpperCase()}<input type={type} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"/></label>;
}

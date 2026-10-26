"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { addAssessmentGradeItem, publishAssessmentGrade } from "@/app/profesor/calificaciones/actions";
import { formatGrade, formatPublication, gradesForStudent, type AssessmentGradeItem, type GradebookData, type PublishedAssessmentGrade } from "@/lib/gradebook";
import { parseTeacherSessionScore } from "@/lib/teacher-session-grading";

function GradePublicationForm({item,studentId,grade,onPublished}:{item:AssessmentGradeItem;studentId:string;grade:PublishedAssessmentGrade|null;onPublished:(grade:PublishedAssessmentGrade)=>void}) {
  const [score,setScore]=useState(grade?String(grade.score).replace(".",","):"");
  const [comment,setComment]=useState(grade?.comment ?? "");
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");
  const [error,setError]=useState("");
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();setMessage("");setError("");
    const number=parseTeacherSessionScore(score);
    if(number===null){setError("Introduce una nota entre 0 y 10. Puedes usar décimas, por ejemplo 8,5.");return;}
    setSaving(true);
    try {const result=await publishAssessmentGrade({studentId,itemId:item.id,score:number,comment});onPublished(result);setScore(String(result.score).replace(".",","));setComment(result.comment);setMessage("Calificación publicada. El alumno ya puede consultarla en Mis calificaciones.");}
    catch(cause){setError(cause instanceof Error?cause.message:"No se ha podido publicar la calificación.");}
    finally{setSaving(false);}
  }
  return <article className="card min-w-0 p-5 sm:p-6">
    <header className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-xs font-bold text-[#1e6b4f]">{item.sa_code}</p><h3 className="mt-1 text-lg font-extrabold">{item.title}</h3></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${grade?"bg-emerald-100 text-emerald-800":"bg-slate-100 text-slate-600"}`}>{grade?`Publicada · ${formatGrade(grade.score)}/10`:"Sin publicar"}</span></header>
    {grade && <p className="mt-2 text-xs text-slate-500">Última publicación: {formatPublication(grade.published_at)}</p>}
    <form aria-label={`Publicar ${item.title}`} onSubmit={(event)=>void submit(event)} className="mt-4">
      <fieldset disabled={saving} className="grid gap-3 sm:grid-cols-[8rem_1fr]">
        <label className="text-sm font-bold">Nota · 0–10<input type="text" inputMode="decimal" required maxLength={4} value={score} onChange={(event)=>{setScore(event.target.value);setError("");setMessage("");}} placeholder="Ej.: 8,5" className="mt-2 w-full rounded-xl border bg-white p-3 font-normal"/></label>
        <label className="text-sm font-bold">Comentario del profesor · opcional<textarea rows={3} maxLength={500} value={comment} onChange={(event)=>{setComment(event.target.value);setMessage("");}} placeholder="Orientación, puntos fuertes o aspectos que mejorar" className="mt-2 w-full rounded-xl border bg-white p-3 font-normal"/><span className="mt-1 block text-right text-xs font-normal text-slate-500">{comment.length}/500</span></label>
        <button type="submit" className="justify-self-start rounded-xl bg-[#1e6b4f] px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{saving?"Publicando…":grade?"Actualizar publicación":"Publicar calificación"}</button>
      </fieldset>
      <p className="mt-3 text-xs text-slate-500">La nota y el comentario serán visibles para este alumno al publicar.</p>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="mt-3 text-sm text-emerald-800">{message}</p>}
    </form>
  </article>;
}

export function TeacherGradebook({data,year,initialStudentId,initialSituation}:{data:GradebookData;year:1|2;initialStudentId?:string;initialSituation?:string}) {
  const [studentId,setStudentId]=useState(initialStudentId ?? "");
  const [group,setGroup]=useState("");
  const [sa,setSa]=useState(initialSituation && data.situations.some((entry)=>entry.code===initialSituation)?initialSituation:"SA1");
  const [items,setItems]=useState(data.items);
  const [grades,setGrades]=useState(data.grades);
  const [newTitle,setNewTitle]=useState("");
  const [adding,setAdding]=useState(false);
  const [itemError,setItemError]=useState("");
  const groups=[...new Set(data.students.map((student)=>student.group))].sort();
  const students=data.students.filter((student)=>!group || student.group===group);
  const student=students.find((entry)=>entry.id===studentId) ?? students[0];
  const situations=data.situations.filter((entry)=>entry.courseId===student?.courseId);
  const entries=student?gradesForStudent(items,grades,student.id,student.courseId).filter((entry)=>entry.item.sa_code===sa):[];
  const published=entries.filter((entry)=>entry.grade).length;
  async function addItem(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();if(!student)return;setAdding(true);setItemError("");
    try{const item=await addAssessmentGradeItem({courseId:student.courseId,saCode:sa,title:newTitle});setItems((current)=>[...current,item]);setNewTitle("");}
    catch(cause){setItemError(cause instanceof Error?cause.message:"No se ha podido añadir el instrumento.");}
    finally{setAdding(false);}
  }
  return <div className="space-y-5">
    <section className="card p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-extrabold">Publicar calificaciones</h1><p className="mt-2 text-sm text-slate-600">Valora los instrumentos de cada situación y comparte con cada alumno su nota y tu comentario.</p></div><button type="button" onClick={()=>window.location.assign(`/profesor/calificaciones?curso=${year}&sa=${sa}${student?`&alumno=${student.id}`:""}`)} className="rounded-xl border px-4 py-2 text-sm font-bold">Actualizar calificaciones</button></div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="text-sm font-bold">Curso<select value={year} onChange={(event)=>window.location.assign(`/profesor/calificaciones?curso=${event.target.value}`)} className="mt-2 w-full rounded-xl border bg-white p-3"><option value="1">1º Bachillerato</option><option value="2">2º Bachillerato</option></select></label>
        <label className="text-sm font-bold">Grupo<select value={group} onChange={(event)=>{setGroup(event.target.value);setStudentId("");}} className="mt-2 w-full rounded-xl border bg-white p-3"><option value="">Todos los grupos</option>{groups.map((value)=><option key={value}>{value}</option>)}</select></label>
        <label className="text-sm font-bold">Alumno para calificar<select value={student?.id ?? ""} onChange={(event)=>setStudentId(event.target.value)} className="mt-2 w-full rounded-xl border border-emerald-600 bg-emerald-50 p-3">{students.map((entry)=><option key={entry.id} value={entry.id}>{entry.name}</option>)}</select></label>
        <label className="text-sm font-bold">Situación de aprendizaje<select value={sa} onChange={(event)=>{setSa(event.target.value);setItemError("");}} className="mt-2 w-full rounded-xl border bg-white p-3">{situations.map((entry)=><option key={`${entry.courseId}-${entry.code}`} value={entry.code}>{entry.code} · {entry.title}</option>)}</select></label>
      </div>
      {student && <p className="mt-4 text-sm font-semibold text-[#164c3a]">{student.name} · {sa} · {published}/{entries.length} calificaciones publicadas</p>}
      {((year===2 && sa==="SA2") || (year===1 && sa==="SA1")) && <Link href={`/profesor/calificar-sesiones?curso=${year}${student?`&alumno=${student.id}`:""}`} className="mt-4 inline-block rounded-xl border border-emerald-600 px-4 py-2 text-sm font-bold text-[#164c3a]">Abrir calificaciones de cada sesión</Link>}
    </section>
    <section aria-label="Instrumentos para calificar" className="grid gap-4 xl:grid-cols-2">{student && entries.map(({item,grade})=><GradePublicationForm key={`${student.id}-${item.id}`} item={item} studentId={student.id} grade={grade} onPublished={(value)=>setGrades((current)=>[...current.filter((entry)=>!(entry.student_id===value.student_id && entry.item_id===value.item_id)),value])}/>)}</section>
    {student && !entries.length && <p className="card p-5 text-sm text-slate-600">Todavía no hay instrumentos de calificación configurados en esta situación. Puedes añadirlos a continuación.</p>}
    {student && <details className="card p-5"><summary className="cursor-pointer font-bold">Añadir instrumento de evaluación a {sa}</summary><form onSubmit={(event)=>void addItem(event)} className="mt-4 flex flex-wrap items-end gap-3"><label className="min-w-0 flex-1 text-sm font-bold">Nombre del instrumento<input required maxLength={120} value={newTitle} onChange={(event)=>setNewTitle(event.target.value)} className="mt-2 w-full rounded-xl border p-3 font-normal" placeholder="Nombre del trabajo o prueba"/></label><button type="submit" disabled={adding} className="rounded-xl bg-[#1e6b4f] px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{adding?"Añadiendo…":"Añadir instrumento"}</button></form><p className="mt-2 text-xs text-slate-500">El instrumento estará disponible para todo el alumnado de este curso y situación. Cada nota se publica de forma individual.</p>{itemError && <p role="alert" className="mt-2 text-sm text-red-700">{itemError}</p>}</details>}
  </div>;
}


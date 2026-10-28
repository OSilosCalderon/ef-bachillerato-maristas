import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";
import { Sa1Layout } from "@/components/sa1-layout";
import { SecondYearSa2Layout } from "@/components/second-year-sa2-layout";
import { FinalPhysicalReflectionForm } from "@/components/final-physical-reflection-form";
import { getReflectionContext, loadFinalPhysicalReflection } from "@/lib/final-physical-reflection-server";

export async function FinalPhysicalReflectionPage({ year }: { year: 1 | 2 }) {
  const { supabase, student, sa } = await getReflectionContext(year);
  const [{ data: item, error: itemError }, initial] = await Promise.all([
    supabase.from("assessment_grade_items").select("id").eq("course_id", student.course_id).eq("sa_code", sa).eq("item_key", "final-physical-reflection").maybeSingle(),
    loadFinalPhysicalReflection(year),
  ]);
  if (itemError) throw new Error("No se ha podido consultar la valoración del profesor.");
  const { data: grade, error: gradeError } = item ? await supabase.from("student_assessment_grades").select("score,comment").eq("student_id", student.id).eq("item_id", item.id).maybeSingle() : { data: null, error: null };
  if (gradeError) throw new Error("No se ha podido consultar la valoración del profesor.");
  const Layout = year === 1 ? Sa1Layout : SecondYearSa2Layout;
  return <><DashboardHeader eyebrow={`${year}º Bachillerato · ${sa} · Cierre de la evaluación física`} title="Reflexión personal y futuro" description="Comprende tus resultados y convierte lo aprendido en nuevas motivaciones."/><Layout>
    <div className="flex flex-wrap gap-3 text-sm font-bold text-[#164c3a]"><Link href={year === 1 ? "/alumno/sa1/progreso" : "/alumno/2bach/sa2/seguimiento"}>← {year === 1 ? "Mis resultados de SA1" : "Seguimiento de sesiones"}</Link><Link href={year === 1 ? "/alumno/sa1/evolucion" : "/alumno/progreso"}>Consultar mis resultados físicos</Link><Link href={year === 1 ? "/alumno/sa1/plan" : "/alumno/2bach/sa1/plan"}>Consultar mi plan y objetivos</Link></div>
    {grade && <section className="card border-emerald-200 p-5"><h2 className="font-extrabold">Valoración del profesor · {new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(Number(grade.score))}/10</h2>{grade.comment && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">{grade.comment}</p>}</section>}
    <FinalPhysicalReflectionForm initial={initial}/>
  </Layout></>;
}

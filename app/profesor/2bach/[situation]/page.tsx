import { notFound } from "next/navigation";
import { TeacherSituationResults } from "@/components/teacher-situation-results";
import { Sa4EventWorkspace } from "@/components/sa4-event-workspace";
import { Sa4Delegations } from "@/components/sa4-delegations";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function Page({ params }: { params: Promise<{ situation: string }> }) {
  const { situation } = await params;
  if (!/^sa[1-6]$/.test(situation)) notFound();
  const results = <TeacherSituationResults year={2} code={situation.toUpperCase()}/>;
  if (situation !== "sa4") return results;

  await requireRole("teacher");
  const supabase = await createClient();
  const { data: courses, error } = await supabase.from("courses").select("id")
    .eq("bachillerato_year", 2).eq("is_active", true);
  if (error) throw new Error("No se han podido cargar los cursos de 2.º de Bachillerato.");

  return <>
    <div className="mx-auto max-w-7xl px-5 pt-5 sm:px-8 sm:pt-8">
      {courses?.map(({ id }) => <div key={id} className="space-y-6"><Sa4Delegations courseId={id}/><Sa4EventWorkspace courseId={id}/></div>)}
    </div>
    {results}
  </>;
}

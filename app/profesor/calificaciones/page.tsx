import { TeacherGradebook } from "@/components/teacher-gradebook";
import { loadTeacherGradebook } from "@/lib/gradebook-server";

export default async function Page({searchParams}:{searchParams:Promise<{curso?:string;alumno?:string;sa?:string;vista?:string}>}) {
  const params=await searchParams;
  const year=params.curso==="1"?1:2;
  const data=await loadTeacherGradebook(year);
  const initialView = year === 2 && params.vista === "finales" ? "finales" : params.vista === "cuaderno" ? "cuaderno" : "alumno";
  const gradingContext = JSON.stringify([year, params.alumno, params.sa, initialView]);
  return <div className="mx-auto max-w-7xl p-5 sm:p-8">
    <TeacherGradebook key={gradingContext} data={data} year={year} initialStudentId={params.alumno} initialSituation={params.sa} initialView={initialView}/>
  </div>;
}

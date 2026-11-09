import { notFound } from "next/navigation";
import { TeacherStudentWork } from "@/components/teacher-student-work";
import { loadSecondYearStudentWork } from "@/lib/gradebook-server";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const work = await loadSecondYearStudentWork(id);
  if (!work) notFound();
  return <TeacherStudentWork {...work}/>;
}

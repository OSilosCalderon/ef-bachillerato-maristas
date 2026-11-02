import { notFound } from "next/navigation";
import { TeacherStudentGrades } from "@/components/teacher-student-grades";
import { loadSecondYearStudentGradebook } from "@/lib/gradebook-server";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await loadSecondYearStudentGradebook(id);
  if (!result) notFound();
  return <TeacherStudentGrades key={id} student={result.student} data={result.gradebook}/>;
}

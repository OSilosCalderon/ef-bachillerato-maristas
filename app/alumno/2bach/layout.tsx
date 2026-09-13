import { redirect } from "next/navigation";
import { getCurrentStudentCourse } from "@/lib/student-course";

export default async function SecondYearLayout({ children }: { children: React.ReactNode }) {
  const course = await getCurrentStudentCourse();
  if (course.bachilleratoYear !== 2) redirect("/alumno");
  return children;
}

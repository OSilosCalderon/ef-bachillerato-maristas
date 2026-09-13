import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/auth/guards";
import { getCurrentStudentCourse } from "@/lib/student-course";

export const dynamic = "force-dynamic";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireRole("student");
  const course = await getCurrentStudentCourse();
  return <AppShell role="student" courseYear={course.bachilleratoYear}>{children}</AppShell>;
}

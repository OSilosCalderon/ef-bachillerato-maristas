import { requireRole } from "@/lib/auth/guards";
import { PasswordChangeForm } from "@/components/password-change-form";
import { getCurrentStudentCourse } from "@/lib/student-course";

export const dynamic = "force-dynamic";

export default async function FirstAccessPage() {
  await requireRole("student");
  const course = await getCurrentStudentCourse();
  return <main className="mx-auto max-w-2xl px-5 py-10 sm:py-16">
    <p className="text-xs font-bold uppercase tracking-wide text-[#1e6b4f]">Maristas Badajoz · {course.bachilleratoYear}º Bachillerato</p>
    <h1 className="mt-3 text-3xl font-black">Bienvenido/a a la plataforma</h1>
    <p className="mb-6 mt-3 text-sm leading-6 text-slate-600">Tu cuenta ya está asignada a tu curso. Antes de empezar, puedes personalizar tu contraseña.</p>
    <PasswordChangeForm firstAccess passwordPending/>
  </main>;
}

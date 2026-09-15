import { DashboardHeader } from "@/components/dashboard-header";
import { PasswordChangeForm } from "@/components/password-change-form";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const profile = await requireRole("student");
  const { data } = await (await createClient()).auth.getUser();
  return <>
    <DashboardHeader eyebrow="Mi perfil" title="Tu cuenta de alumno/a" description="Consulta tu usuario y cambia tu contraseña cuando lo necesites."/>
    <div className="mx-auto max-w-3xl space-y-6 p-5 sm:p-8">
      <section className="card p-6 sm:p-8"><h2 className="text-xl font-extrabold">Datos de acceso</h2><p className="mt-3 text-sm text-slate-600">{data.user?.user_metadata?.username ? `Usuario: ${String(data.user.user_metadata.username)}` : `Correo: ${data.user?.email ?? ""}`}</p><p className="mt-2 text-sm text-slate-600">Nombre: {"display_name" in profile ? String(profile.display_name) : "Alumno/a"}</p></section>
      <PasswordChangeForm passwordPending={data.user?.user_metadata?.initial_password === true}/>
    </div>
  </>;
}

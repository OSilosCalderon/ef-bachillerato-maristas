"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Props = { firstAccess?: boolean; passwordPending?: boolean };

export function PasswordChangeForm({ firstAccess = false, passwordPending = false }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setMessage("");
    if (password.length < 8) { setError("Elige una contraseña de al menos 8 caracteres."); return; }
    if (password === "Maristas1") { setError("Elige una contraseña diferente de la inicial."); return; }
    if (password !== confirmation) { setError("Las contraseñas no coinciden."); return; }
    setSaving(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
        data: { initial_password: false, first_access_seen: true },
      });
      if (updateError) throw updateError;
      setPassword(""); setConfirmation("");
      setMessage("Contraseña cambiada. En tu próximo acceso utiliza la nueva.");
      if (firstAccess) router.replace("/alumno");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido cambiar la contraseña. Inténtalo de nuevo.");
    } finally { setSaving(false); }
  }

  async function continueWithInitialPassword() {
    setSaving(true); setError("");
    try {
      const { error: updateError } = await createClient().auth.updateUser({ data: { first_access_seen: true } });
      if (updateError) throw updateError;
      router.replace("/alumno"); router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido completar el primer acceso.");
    } finally { setSaving(false); }
  }

  return <section className="card min-w-0 p-6 sm:p-8">
    <div className="flex items-center gap-3"><LockKeyhole className="shrink-0 text-[#1e6b4f]"/><h2 className="text-xl font-extrabold">{firstAccess ? "Elige tu contraseña personal" : "Cambiar contraseña"}</h2></div>
    <p className="mt-3 text-sm leading-6 text-slate-600">{firstAccess ? "Puedes cambiar ahora la contraseña inicial o hacerlo después desde Mi perfil." : passwordPending ? "Todavía utilizas la contraseña inicial. Aquí puedes sustituirla por una personal." : "Introduce una nueva contraseña para tu cuenta."} Utiliza al menos 8 caracteres.</p>
    <form onSubmit={changePassword} className="mt-6 max-w-lg space-y-4">
      <label htmlFor="new-password" className="block text-sm font-bold text-slate-700">Nueva contraseña
        <input id="new-password" type="password" autoComplete="new-password" minLength={8} required disabled={saving} value={password} onChange={event => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 p-3 font-normal"/>
      </label>
      <label htmlFor="confirm-password" className="block text-sm font-bold text-slate-700">Repite la nueva contraseña
        <input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required disabled={saving} value={confirmation} onChange={event => setConfirmation(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 p-3 font-normal"/>
      </label>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
      <div className="flex flex-wrap gap-3">
        <button disabled={saving} className="rounded-xl bg-[#1e6b4f] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{saving ? "Guardando…" : "Guardar nueva contraseña"}</button>
        {firstAccess && <button type="button" disabled={saving} onClick={() => void continueWithInitialPassword()} className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 disabled:opacity-50">Cambiarla más tarde</button>}
      </div>
    </form>
  </section>;
}

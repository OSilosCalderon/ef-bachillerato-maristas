import { createClient } from "@/lib/supabase/server";

type Delegation = { country_code: string; country: string; members: string[] };

function flag(code: string) {
  return String.fromCodePoint(...Array.from(code, (letter) => 127397 + letter.charCodeAt(0)));
}

export async function Sa4Delegations({ courseId }: { courseId: string | null }) {
  if (!courseId) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("sa4_delegations")
    .select("country_code,country,members").eq("course_id", courseId).order("position")
    .returns<Delegation[]>();

  return <section className="card space-y-4 p-6 sm:p-8" aria-labelledby="sa4-delegations-title">
    <div>
      <h2 id="sa4-delegations-title" className="text-2xl font-extrabold text-slate-950">Delegaciones del evento</h2>
      <p className="mt-2 text-sm text-slate-600">Cada equipo representa a un país. Diseñaréis el evento deportivo y participaréis en él como delegación.</p>
    </div>
    {error ? <p role="alert" className="text-sm text-slate-600">No se han podido cargar las delegaciones. Actualiza la página para volver a intentarlo.</p>
      : data?.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.map(({ country_code, country, members }) => <article key={country_code} className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <span aria-hidden="true" className="text-4xl leading-none">{flag(country_code)}</span>
          <h3 className="mt-2 font-extrabold text-slate-950">{country}</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {members.map((member) => <li key={member}>{member}</li>)}
          </ul>
        </article>)}
      </div> : <p className="text-sm text-slate-600">Las delegaciones están pendientes de asignar.</p>}
  </section>;
}

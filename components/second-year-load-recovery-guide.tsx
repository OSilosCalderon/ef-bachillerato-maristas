import Image from "next/image";

export function SecondYearLoadRecoveryGuide() {
  return <section className="space-y-6" aria-labelledby="load-recovery-title">
    <div className="card overflow-hidden">
      <div className="border-b border-slate-100 bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-5 sm:p-7">
        <p className="text-xs font-black uppercase tracking-[.16em] text-[#1e6b4f]">SA2 · Guía visual</p>
        <h2 id="load-recovery-title" className="mt-2 text-2xl font-black text-slate-950">Recuperar también es entrenar</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Usa los tiempos como referencias para planificar y escucha la respuesta real de tu cuerpo. El mismo entrenamiento no exige la misma recuperación a todas las personas.</p>
      </div>
      <div className="bg-slate-50 p-3 sm:p-6">
        <a href="/theory/sa2-recuperacion-cargas.webp" target="_blank" rel="noopener noreferrer" className="mx-auto block w-full max-w-[760px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-emerald-200" aria-label="Abrir la infografía de tiempos de recuperación en tamaño completo">
          <Image src="/theory/sa2-recuperacion-cargas.webp" alt="Infografía: tiempos orientativos de recuperación según capacidad física e intensidad, señales para repetir o reducir la carga y ejemplo de semana equilibrada" width={1055} height={1491} sizes="(max-width: 768px) 100vw, 760px" className="h-auto w-full"/>
        </a>
        <p className="mx-auto mt-3 max-w-[760px] text-xs leading-5 text-slate-500">Toca o selecciona la infografía para verla ampliada. Sus tiempos son orientativos para alumnado sano: adapta la siguiente sesión a la carga, la capacidad trabajada, el descanso y las sensaciones.</p>
      </div>
    </div>

    <div className="card overflow-hidden">
      <div className="p-5 sm:p-7">
        <p className="text-xs font-black uppercase tracking-[.16em] text-violet-700">Cómo asimilamos una carga</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">Fatiga, recuperación, asimilación y supercompensación</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">El gráfico representa un modelo simplificado: tras el estímulo puede bajar temporalmente la capacidad de rendimiento; durante la recuperación el organismo asimila la carga, repone recursos y puede situarse por encima del nivel inicial. La respuesta cambia según la persona y el tipo de carga.</p>
      </div>
      <div className="px-3 pb-3 sm:px-6 sm:pb-6">
        <SupercompensationChart/>
      </div>
      <div className="grid gap-3 border-t border-slate-100 bg-slate-50 p-5 sm:grid-cols-3 sm:p-6">
        <GuideStep number="1" title="Estímulo" text="La sesión genera una demanda y aparece fatiga temporal." tone="blue"/>
        <GuideStep number="2" title="Recuperación y asimilación" text="El descanso y los hábitos diarios permiten reponer recursos y asimilar la carga." tone="amber"/>
        <GuideStep number="3" title="Nueva carga" text="Ajusta cuándo y cuánto repetir observando técnica, energía y molestias." tone="green"/>
      </div>
      <p className="px-5 pb-5 text-xs leading-5 text-slate-500 sm:px-6">No existe una hora universal de supercompensación ni es necesario perseguir siempre un pico. Si aparece dolor localizado, mareo, enfermedad o cansancio intenso, evita entrenar fuerte y consulta al profesor.</p>
    </div>
  </section>;
}

function SupercompensationChart() {
  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 sm:p-4">
    <svg viewBox="0 0 900 390" role="img" aria-labelledby="supercomp-title supercomp-desc" className="h-auto w-full">
      <title id="supercomp-title">Modelo de recuperación y supercompensación tras una carga</title>
      <desc id="supercomp-desc">La capacidad baja temporalmente después del estímulo, el organismo asimila la carga durante la recuperación y puede superar el nivel inicial. El momento de una nueva carga depende de la respuesta individual.</desc>
      <defs>
        <linearGradient id="adaptation-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#10b981" stopOpacity=".24"/><stop offset="1" stopColor="#10b981" stopOpacity="0"/></linearGradient>
        <marker id="axis-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#64748b"/></marker>
      </defs>
      <rect x="90" y="40" width="750" height="275" rx="18" fill="#f8fafc"/>
      <rect x="472" y="41" width="120" height="273" fill="#ecfdf5"/>
      <line x1="90" y1="230" x2="838" y2="230" stroke="#94a3b8" strokeWidth="2" strokeDasharray="8 7"/>
      <text x="102" y="218" fill="#64748b" fontSize="14" fontWeight="700">Nivel inicial</text>
      <line x1="90" y1="315" x2="842" y2="315" stroke="#64748b" strokeWidth="2" markerEnd="url(#axis-arrow)"/>
      <line x1="90" y1="315" x2="90" y2="48" stroke="#64748b" strokeWidth="2" markerEnd="url(#axis-arrow)"/>
      <text x="26" y="185" fill="#475569" fontSize="14" fontWeight="700" transform="rotate(-90 26 185)">Capacidad de rendimiento</text>
      <text x="810" y="344" fill="#475569" fontSize="14" fontWeight="700">Tiempo</text>
      <path d="M105 230 C160 230 182 232 207 263 C241 309 291 302 338 264 C383 229 407 205 449 190 C495 173 529 174 557 190 C602 216 631 229 681 230 C735 232 785 229 830 230 L830 315 L105 315 Z" fill="url(#adaptation-fill)"/>
      <path d="M105 230 C160 230 182 232 207 263 C241 309 291 302 338 264 C383 229 407 205 449 190 C495 173 529 174 557 190 C602 216 631 229 681 230 C735 232 785 229 830 230" fill="none" stroke="#059669" strokeWidth="6" strokeLinecap="round"/>
      <line x1="207" y1="263" x2="207" y2="315" stroke="#2563eb" strokeWidth="2" strokeDasharray="5 5"/>
      <circle cx="207" cy="263" r="7" fill="#2563eb"/>
      <line x1="291" y1="302" x2="291" y2="315" stroke="#d97706" strokeWidth="2" strokeDasharray="5 5"/>
      <circle cx="291" cy="302" r="7" fill="#d97706"/>
      <line x1="501" y1="176" x2="501" y2="315" stroke="#059669" strokeWidth="2" strokeDasharray="5 5"/>
      <circle cx="501" cy="176" r="8" fill="#059669"/>
      <line x1="650" y1="230" x2="650" y2="315" stroke="#7c3aed" strokeWidth="2" strokeDasharray="5 5"/>
      <circle cx="650" cy="230" r="8" fill="#7c3aed"/>
      <text x="151" y="69" fill="#1d4ed8" fontSize="14" fontWeight="800">ESTÍMULO</text>
      <text x="247" y="286" fill="#92400e" fontSize="13" fontWeight="800">Fatiga</text>
      <text x="315" y="181" fill="#1d4ed8" fontSize="13" fontWeight="800">Recuperación y asimilación</text>
      <text x="407" y="145" fill="#047857" fontSize="13" fontWeight="800">SUPERCOMPENSACIÓN</text>
      <text x="608" y="261" fill="#6d28d9" fontSize="13" fontWeight="800">Nueva carga ajustada</text>
      <text x="502" y="296" textAnchor="middle" fill="#047857" fontSize="12" fontWeight="800">Ventana orientativa</text>
      <text x="450" y="373" textAnchor="middle" fill="#64748b" fontSize="12">Esquema cualitativo: no representa horas exactas ni una respuesta idéntica para todas las capacidades.</text>
    </svg>
  </div>;
}

function GuideStep({ number, title, text, tone }: { number: string; title: string; text: string; tone: "blue" | "amber" | "green" }) {
  const styles = { blue: "bg-sky-50 text-sky-800", amber: "bg-amber-50 text-amber-900", green: "bg-emerald-50 text-emerald-900" };
  return <div className={`rounded-2xl p-4 ${styles[tone]}`}><p className="text-xs font-black uppercase tracking-wide opacity-70">Paso {number}</p><h3 className="mt-1 font-extrabold">{title}</h3><p className="mt-1 text-sm leading-5">{text}</p></div>;
}


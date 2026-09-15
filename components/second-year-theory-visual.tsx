type Props = { kind: "diagnosis" | "load" | "habits" | "event" | "expression" | "community"; alt: string };

const text = { fontFamily: "Arial, sans-serif", fontWeight: 800 } as const;

const mobileSteps: Record<Props["kind"], string[]> = {
  diagnosis: ["Mido", "Interpreto", "Priorizo", "Diseño", "Entreno", "Vuelvo a medir"],
  load: ["Estímulo", "Fatiga", "Recuperación", "Adaptación"],
  habits: ["Sueño", "Movimiento", "Hidratación", "Alimentación variada", "Recuperación", "Bienestar"],
  event: ["Idea", "Diseño", "Organización", "Ejecución", "Evaluación"],
  expression: ["Cuerpo", "Espacio", "Tiempo", "Emoción", "Cultura"],
  community: ["Persona", "Clase", "Centro", "Familia", "Barrio", "Comunidad"],
};

export function SecondYearTheoryVisual(props: Props) {
  const sequential = ["diagnosis", "load", "event", "community"].includes(props.kind);
  return <>
    <div className="sm:hidden p-5" role="img" aria-label={props.alt}>
      <p className="mb-4 font-extrabold text-slate-900">{props.alt}</p>
      <ol className="grid grid-cols-2 gap-3">
        {mobileSteps[props.kind].map((step, index) => <li key={step} className="min-w-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-950">
          {sequential && <span className="mb-1 block text-xs text-emerald-700">Paso {index + 1}</span>}{step}
        </li>)}
      </ol>
      {props.kind === "load" && <p className="mt-4 text-sm leading-6 text-slate-600">La carga combina volumen, intensidad, frecuencia y densidad. RPE describe cómo percibes ese esfuerzo; no se suman magnitudes con unidades distintas.</p>}
      {sequential && <p className="mt-4 text-sm text-slate-600">Sigue el orden, comprueba el resultado y vuelve atrás para reajustar.</p>}
    </div>
    <div className="hidden sm:block aspect-[1000/470]"><DesktopVisual {...props}/></div>
  </>;
}

function DesktopVisual({ kind, alt }: Props) {
  if (kind === "diagnosis") return <Flow alt={alt} title="Del dato a la decisión" steps={["MIDO","INTERPRETO","PRIORIZO","DISEÑO","ENTRENO","REVALÚO"]}/>;
  if (kind === "event") return <Flow alt={alt} title="Un evento se construye por fases" steps={["IDEA","DISEÑO","RECURSOS","ORGANIZO","EJECUTO","EVALÚO"]}/>;
  if (kind === "community") return <Flow alt={alt} title="Una comunidad activa se conecta" steps={["PERSONA","CLASE","CENTRO","FAMILIA","BARRIO","COMUNIDAD"]}/>;
  if (kind === "load") {
    return <svg viewBox="0 0 1000 470" role="img" aria-label={alt} className="h-full w-full bg-slate-50">
      <text x="55" y="62" fontSize="32" fill="#0f172a" style={text}>Carga, fatiga y adaptación</text>
      <text x="55" y="98" fontSize="17" fill="#475569">La mejora depende tanto del estímulo como de la recuperación.</text>
      {[[130,"CARGA","#1e6b4f"],[360,"FATIGA","#d97706"],[590,"RECUPERACIÓN","#2563eb"],[820,"ADAPTACIÓN","#7c3aed"]].map(([x,label,color],i)=><g key={String(label)}><circle cx={Number(x)} cy="205" r="66" fill={String(color)}/><text x={Number(x)} y="213" textAnchor="middle" fontSize="16" fill="white" style={text}>{String(label)}</text>{i<3 && <path d={`M ${Number(x)+72} 205 H ${Number(x)+155}`} stroke="#64748b" strokeWidth="8" strokeLinecap="round"/>}</g>)}
      <rect x="75" y="320" width="850" height="100" rx="26" fill="white" stroke="#cbd5e1"/>
      <text x="500" y="355" textAnchor="middle" fontSize="20" fill="#0f172a" style={text}>Variables de carga</text>
      <text x="500" y="390" textAnchor="middle" fontSize="18" fill="#334155">VOLUMEN · INTENSIDAD · FRECUENCIA · DENSIDAD · RPE</text>
    </svg>;
  }
  if (kind === "habits") {
    const items = [[330,160,"SUEÑO"],[670,160,"HIDRATACIÓN"],[760,280,"ALIMENTACIÓN"],[670,400,"RECUPERACIÓN"],[330,400,"MOVIMIENTO"],[240,280,"BIENESTAR"]];
    return <svg viewBox="0 0 1000 470" role="img" aria-label={alt} className="h-full w-full bg-[#f8fafc]">
      <text x="55" y="60" fontSize="32" fill="#0f172a" style={text}>Hábitos que se apoyan entre sí</text><text x="55" y="96" fontSize="17" fill="#475569">No hay una única pieza: la regularidad aparece cuando el conjunto es sostenible.</text>
      <circle cx="500" cy="285" r="95" fill="#1e6b4f"/><text x="500" y="275" textAnchor="middle" fontSize="20" fill="white" style={text}>HÁBITOS</text><text x="500" y="305" textAnchor="middle" fontSize="16" fill="white">SOSTENIBLES</text>
      {items.map(([x,y,label],i)=><g key={String(label)}><circle cx={Number(x)} cy={Number(y)} r="62" fill={["#2563eb","#0891b2","#d97706","#7c3aed","#16a34a","#db2777"][i]} opacity=".14"/><text x={Number(x)} y={Number(y)+5} textAnchor="middle" fontSize="15" fill="#0f172a" style={text}>{String(label)}</text></g>)}
    </svg>;
  }
  const items = kind === "expression" ? [["CUERPO","#2563eb"],["ESPACIO","#7c3aed"],["TIEMPO","#d97706"],["EMOCIÓN","#db2777"],["CULTURA","#16a34a"]] : [];
  return <svg viewBox="0 0 1000 470" role="img" aria-label={alt} className="h-full w-full bg-[#f8fafc]">
    <text x="55" y="62" fontSize="32" fill="#0f172a" style={text}>Expresión = decisiones con intención</text><text x="55" y="98" fontSize="17" fill="#475569">El significado cambia al combinar distintas variables.</text>
    {items.map(([label,color],i)=>{const angle=(-90+i*72)*Math.PI/180; const x=500+210*Math.cos(angle); const y=285+145*Math.sin(angle); return <g key={String(label)}><line x1="500" y1="285" x2={x} y2={y} stroke="#cbd5e1" strokeWidth="4"/><circle cx={x} cy={y} r="64" fill={String(color)} opacity=".15"/><text x={x} y={y+5} textAnchor="middle" fontSize="16" fill={String(color)} style={text}>{String(label)}</text></g>})}
    <circle cx="500" cy="285" r="86" fill="#0f172a"/><text x="500" y="292" textAnchor="middle" fontSize="20" fill="white" style={text}>EXPRESIÓN</text>
  </svg>;
}

function Flow({ alt, title, steps }: { alt: string; title: string; steps: string[] }) {
  return <svg viewBox="0 0 1000 470" role="img" aria-label={alt} className="h-full w-full bg-[#f8fafc]">
    <text x="55" y="62" fontSize="32" fill="#0f172a" style={text}>{title}</text>
    <text x="55" y="98" fontSize="17" fill="#475569">Cada fase prepara la siguiente y permite volver atrás para reajustar.</text>
    {steps.map((step,i)=>{const x=90+i*150; return <g key={step}><rect x={x} y="190" width="125" height="95" rx="24" fill={i%2===0?"#e7f2ed":"#eef5ff"} stroke={i%2===0?"#1e6b4f":"#2563eb"} strokeWidth="3"/><text x={x+62.5} y="245" textAnchor="middle" fontSize="14" fill="#0f172a" style={text}>{step}</text>{i<steps.length-1 && <path d={`M ${x+130} 237 H ${x+147}`} stroke="#64748b" strokeWidth="6" strokeLinecap="round"/>}</g>})}
    <path d="M 820 330 C 720 405 280 405 180 330" fill="none" stroke="#94a3b8" strokeWidth="4" strokeDasharray="10 10"/>
    <text x="500" y="420" textAnchor="middle" fontSize="17" fill="#475569" style={text}>Observar → decidir → actuar → comprobar → reajustar</text>
  </svg>;
}

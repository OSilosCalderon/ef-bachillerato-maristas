type TheoryVisualProps = {
  kind: string;
  alt: string;
};

const labelStyle = { fontFamily: "Arial, sans-serif", fontWeight: 800 } as const;

export function TheoryVisual({ kind, alt }: TheoryVisualProps) {
  if (kind.includes("adaptacion-ciclo")) {
    return (
      <svg viewBox="0 0 1000 480" role="img" aria-label={alt} className="h-full w-full bg-[#f7faf8]">
        <defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e7f2ed"/><stop offset="1" stopColor="#eef5ff"/></linearGradient></defs>
        <rect width="1000" height="480" fill="url(#g1)"/>
        <text x="60" y="70" fontSize="34" fill="#0f172a" style={labelStyle}>Entrenar es un ciclo</text>
        <text x="60" y="108" fontSize="18" fill="#475569">La mejora aparece cuando estímulo y recuperación están bien relacionados.</text>
        {[
          [110,210,"1","ESTÍMULO","#1e6b4f"],[340,270,"2","FATIGA","#d97706"],[570,230,"3","RECUPERACIÓN","#2563eb"],[800,170,"4","ADAPTACIÓN","#7c3aed"]
        ].map(([x,y,n,t,c]) => <g key={String(t)}><circle cx={Number(x)} cy={Number(y)} r="64" fill={String(c)}/><text x={Number(x)} y={Number(y)-8} textAnchor="middle" fontSize="30" fill="white" style={labelStyle}>{String(n)}</text><text x={Number(x)} y={Number(y)+27} textAnchor="middle" fontSize="14" fill="white" style={labelStyle}>{String(t)}</text></g>)}
        <path d="M175 218 C240 218 270 250 290 260" stroke="#64748b" strokeWidth="8" fill="none" strokeLinecap="round"/><path d="M405 266 C470 254 485 235 510 230" stroke="#64748b" strokeWidth="8" fill="none" strokeLinecap="round"/><path d="M635 220 C700 205 720 185 740 180" stroke="#64748b" strokeWidth="8" fill="none" strokeLinecap="round"/>
        <rect x="80" y="365" width="840" height="65" rx="24" fill="white" opacity=".95"/><text x="500" y="405" textAnchor="middle" fontSize="20" fill="#164c3a" style={labelStyle}>Carga adecuada + descanso suficiente + continuidad = oportunidad de mejorar</text>
      </svg>
    );
  }

  if (kind.includes("capacidades-fisicas")) {
    const cards = [
      [65,"FUERZA","Producir tensión","#be123c"],[300,"RESISTENCIA","Sostener o repetir esfuerzos","#15803d"],[535,"VELOCIDAD","Actuar en poco tiempo","#1d4ed8"],[770,"FLEXIBILIDAD","Moverse con amplitud útil","#b45309"]
    ];
    return (
      <svg viewBox="0 0 1000 480" role="img" aria-label={alt} className="h-full w-full bg-[#f8fafc]">
        <text x="55" y="65" fontSize="34" fill="#0f172a" style={labelStyle}>Cuatro capacidades, cuatro preguntas</text>
        <text x="55" y="103" fontSize="18" fill="#475569">El ejercicio cambia según la capacidad prioritaria y la variable de carga que modificamos.</text>
        {cards.map(([x,title,desc,color],i)=><g key={String(title)}><rect x={Number(x)} y="155" width="190" height="220" rx="28" fill="white" stroke={String(color)} strokeWidth="4"/><circle cx={Number(x)+95} cy="220" r="42" fill={String(color)} opacity=".12"/><text x={Number(x)+95} y="230" textAnchor="middle" fontSize="30" fill={String(color)} style={labelStyle}>{["F","R","V","M"][i]}</text><text x={Number(x)+95} y="295" textAnchor="middle" fontSize="19" fill={String(color)} style={labelStyle}>{String(title)}</text><foreignObject x={Number(x)+20} y="315" width="150" height="55"><div style={{textAlign:"center",fontFamily:"Arial",fontSize:14,color:"#475569",lineHeight:1.35}}>{String(desc)}</div></foreignObject></g>)}
        <text x="500" y="430" textAnchor="middle" fontSize="19" fill="#0f172a" style={labelStyle}>¿Cuánto? · ¿A qué intensidad? · ¿Cuántas veces? · ¿Con qué pausa?</text>
      </svg>
    );
  }

  if (kind.includes("adaptaciones-cuerpo")) {
    const items = [[160,"CORAZÓN","Transporta mejor","#dc2626"],[380,"PULMONES","Ventilación eficiente","#0284c7"],[620,"MÚSCULO","Produce y resiste fuerza","#d97706"],[840,"SISTEMA NERVIOSO","Coordina y aprende","#7c3aed"]];
    return (
      <svg viewBox="0 0 1000 480" role="img" aria-label={alt} className="h-full w-full bg-[#f8fafc]">
        <text x="55" y="65" fontSize="34" fill="#0f172a" style={labelStyle}>¿Qué cambia cuando entrenamos?</text><text x="55" y="103" fontSize="18" fill="#475569">La adaptación no ocurre en un solo músculo: participan varios sistemas.</text>
        {items.map(([x,t,d,c])=><g key={String(t)}><circle cx={Number(x)} cy="225" r="72" fill={String(c)} opacity=".12"/><circle cx={Number(x)} cy="225" r="38" fill={String(c)}/><text x={Number(x)} y="235" textAnchor="middle" fontSize="24" fill="white" style={labelStyle}>+</text><text x={Number(x)} y="325" textAnchor="middle" fontSize="16" fill={String(c)} style={labelStyle}>{String(t)}</text><text x={Number(x)} y="352" textAnchor="middle" fontSize="13" fill="#475569">{String(d)}</text></g>)}
        <rect x="125" y="400" width="750" height="45" rx="20" fill="#e7f2ed"/><text x="500" y="429" textAnchor="middle" fontSize="18" fill="#164c3a" style={labelStyle}>Planificar ayuda a repartir estímulos y recuperación entre capacidades y sistemas.</text>
      </svg>
    );
  }

  const sports = [[120,"PÁDEL","reacción"],[270,"VOLEIBOL","salto"],[420,"FÚTBOL","aceleración"],[570,"BALONCESTO","frenada"],[720,"BÁDMINTON","pies"],[870,"ATLETISMO","ritmo"]];
  return (
    <svg viewBox="0 0 1000 480" role="img" aria-label={alt} className="h-full w-full bg-[#f8fafc]">
      <text x="55" y="65" fontSize="34" fill="#0f172a" style={labelStyle}>El entrenamiento cambia con el deporte</text><text x="55" y="103" fontSize="18" fill="#475569">No entrenamos “deportes”: entrenamos capacidades para resolver demandas concretas.</text>
      {sports.map(([x,sport,cap],i)=><g key={String(sport)}><circle cx={Number(x)} cy="225" r="62" fill={["#2563eb","#db2777","#16a34a","#ea580c","#7c3aed","#0891b2"][i]} opacity=".14"/><path d={`M ${Number(x)-28} 250 Q ${Number(x)} 175 ${Number(x)+28} 250`} stroke={["#2563eb","#db2777","#16a34a","#ea580c","#7c3aed","#0891b2"][i]} strokeWidth="12" fill="none" strokeLinecap="round"/><circle cx={Number(x)} cy="180" r="16" fill={["#2563eb","#db2777","#16a34a","#ea580c","#7c3aed","#0891b2"][i]}/><text x={Number(x)} y="320" textAnchor="middle" fontSize="15" fill="#0f172a" style={labelStyle}>{String(sport)}</text><text x={Number(x)} y="345" textAnchor="middle" fontSize="13" fill="#64748b">{String(cap)}</text></g>)}
      <rect x="100" y="395" width="800" height="50" rx="20" fill="white" stroke="#cbd5e1"/><text x="500" y="426" textAnchor="middle" fontSize="18" fill="#334155" style={labelStyle}>Capacidad → tarea → carga → recuperación → progresión</text>
    </svg>
  );
}

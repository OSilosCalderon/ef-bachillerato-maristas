import Link from "next/link";
import { BookOpen, ClipboardList, Gauge, Library, MessageSquareMore, PencilRuler, SmilePlus } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Sa3Layout } from "@/components/sa3-layout";
const sections=[
 {href:"/alumno/sa3/juegos",title:"Biblioteca de juegos alternativos",description:"Descubre propuestas, reglas, variantes y medidas de seguridad.",icon:Library},
 {href:"/alumno/sa3/disena",title:"Diseña tu sesión",description:"Combina juegos de la biblioteca con propuestas propias.",icon:PencilRuler},
 {href:"/alumno/sa3/sesiones",title:"Sesiones creadas",description:"Consulta borradores, entregas y feedback del profesor.",icon:ClipboardList},
 {href:"/alumno/sa3/valoraciones",title:"Valoración de juegos",description:"Valora tu experiencia después de practicar cada propuesta.",icon:MessageSquareMore},
 {href:"/alumno/sa3/material",title:"Material teórico",description:"Consulta recursos, documentos, infografías, enlaces y vídeos.",icon:BookOpen},
 {href:"/alumno/sa3/actitud",title:"Autoevaluación de actitud",description:"Reflexiona sobre participación, cooperación y responsabilidad.",icon:SmilePlus},
 {href:"/alumno/sa3/progreso",title:"Mi progreso",description:"Revisa de forma global tu participación en SA3.",icon:Gauge},
];
export default function Page(){return <><DashboardHeader eyebrow="SA3" title="Ocio activo y juegos alternativos" description="Participa, crea, adapta y reflexiona sobre nuevas formas de disfrutar del movimiento."/><Sa3Layout><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{sections.map(({href,title,description,icon:Icon})=><Link key={href} href={href} className="card group p-6 transition hover:-translate-y-0.5"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e7f2ed] text-[#1e6b4f]"><Icon size={21}/></span><h2 className="mt-5 text-lg font-extrabold group-hover:text-[#1e6b4f]">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p><span className="mt-5 inline-block text-sm font-bold text-[#1e6b4f]">Entrar →</span></Link>)}</section></Sa3Layout></>}

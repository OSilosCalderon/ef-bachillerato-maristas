"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3, BookOpen, ClipboardCheck, Download, Dumbbell, FileText, Gauge, GraduationCap, HeartPulse,
  Home, PlusCircle, Settings, Sparkles, User, Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = { label: string; href: string; icon: LucideIcon };

const firstYearItems: NavItem[] = [
  { label: "Inicio", href: "/alumno", icon: Home },
  { label: "Mi progreso", href: "/alumno/progreso", icon: BarChart3 },
  { label: "Apuntes entrenamiento", href: "/alumno/apuntes-entrenamiento", icon: GraduationCap },
  { label: "SA1 Salud", href: "/alumno/sa1", icon: HeartPulse },
  { label: "SA2 Deportes", href: "/alumno/sa2", icon: Dumbbell },
  { label: "SA3 Ocio activo", href: "/alumno/sa3", icon: Sparkles },
  { label: "Autoevaluación", href: "/alumno/autoevaluacion", icon: ClipboardCheck },
  { label: "Mi perfil", href: "/alumno/perfil", icon: User },
];

const secondYearItems: NavItem[] = [
  { label: "Inicio", href: "/alumno", icon: Home },
  { label: "Mi progreso", href: "/alumno/progreso", icon: BarChart3 },
  { label: "Apuntes entrenamiento", href: "/alumno/apuntes-entrenamiento", icon: GraduationCap },
  { label: "SA1 Punto de partida", href: "/alumno/2bach/sa1", icon: Gauge },
  { label: "SA2 Condición física", href: "/alumno/2bach/sa2", icon: Dumbbell },
  { label: "SA3 Hábitos saludables", href: "/alumno/2bach/sa3", icon: HeartPulse },
  { label: "SA4 Evento deportivo", href: "/alumno/2bach/sa4", icon: ClipboardCheck },
  { label: "SA5 Cultura y expresión", href: "/alumno/2bach/sa5", icon: Sparkles },
  { label: "SA6 Comunidad activa", href: "/alumno/2bach/sa6", icon: Users },
  { label: "Mi perfil", href: "/alumno/perfil", icon: User },
];

const teacherItems: NavItem[] = [
  { label: "Dashboard", href: "/profesor", icon: Gauge },
  { label: "Alumnado", href: "/profesor/alumnado", icon: Users },
  { label: "Crear actividad", href: "/profesor/crear-actividad", icon: PlusCircle },
  { label: "Contenidos", href: "/profesor/contenidos", icon: BookOpen },
  { label: "Documentos", href: "/profesor/documentos", icon: FileText },
  { label: "Exportar", href: "/profesor/exportar", icon: Download },
  { label: "SA1", href: "/profesor/sa1", icon: HeartPulse },
  { label: "SA2", href: "/profesor/sa2", icon: Dumbbell },
  { label: "SA3", href: "/profesor/sa3", icon: Sparkles },
  { label: "Configuración", href: "/profesor/configuracion", icon: Settings },
];

export function SideNav({ role, courseYear = 1 }: { role: "student" | "teacher"; courseYear?: 1 | 2 }) {
  const pathname = usePathname();
  const items = role === "teacher" ? teacherItems : courseYear === 2 ? secondYearItems : firstYearItems;
  const root = role === "student" ? "/alumno" : "/profesor";
  const isActive = (href: string) => href === root ? pathname === href : pathname.startsWith(href);
  const courseLabel = role === "teacher" ? "EF · Bachillerato" : `EF · ${courseYear}º Bachillerato`;

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white/95 px-4 py-6 backdrop-blur lg:block">
        <Link href="/" className="mb-8 block rounded-xl px-3 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e6b4f]">
          <div className="text-xs font-bold uppercase tracking-[.2em] text-[#1e6b4f]">Maristas Badajoz</div>
          <div className="mt-1 text-lg font-extrabold text-slate-900">{courseLabel}</div>
        </Link>
        <nav aria-label={role === "student" ? "Navegación del alumnado" : "Navegación del profesorado"} className="space-y-1">
          {items.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e6b4f] ${active ? "bg-[#e7f2ed] text-[#164c3a]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}><Icon size={19}/>{item.label}</Link>;
          })}
        </nav>
        <div className="absolute bottom-5 left-4 right-4 rounded-2xl bg-slate-950 p-4 text-white">
          <div className="text-xs uppercase tracking-wider text-slate-400">Entorno privado</div>
          <div className="mt-1 text-sm font-semibold">{role === "student" ? `Vista alumno/a · ${courseYear}º` : "Vista profesor/a"}</div>
        </div>
      </aside>

      <nav aria-label="Navegación móvil" className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
        <div className="flex gap-1 overflow-x-auto">
          {items.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`flex min-w-[78px] flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e6b4f] ${active ? "bg-[#e7f2ed] text-[#164c3a]" : "text-slate-500"}`}><Icon size={18}/><span className="whitespace-nowrap">{item.label}</span></Link>;
          })}
        </div>
      </nav>
    </>
  );
}

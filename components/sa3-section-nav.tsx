"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ClipboardList, Gauge, Library, MessageSquareMore, PencilRuler, SmilePlus } from "lucide-react";

const items = [
  { href: "/alumno/sa3/juegos", label: "Biblioteca de juegos", icon: Library },
  { href: "/alumno/sa3/disena", label: "Diseña tu sesión", icon: PencilRuler },
  { href: "/alumno/sa3/sesiones", label: "Sesiones creadas", icon: ClipboardList },
  { href: "/alumno/sa3/valoraciones", label: "Valoración de juegos", icon: MessageSquareMore },
  { href: "/alumno/sa3/material", label: "Material teórico", icon: BookOpen },
  { href: "/alumno/sa3/actitud", label: "Autoevaluación de actitud", icon: SmilePlus },
  { href: "/alumno/sa3/progreso", label: "Mi progreso", icon: Gauge },
];

export function Sa3SectionNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Apartados de Ocio activo y juegos alternativos" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${active ? "border-[#1e6b4f]/25 bg-[#e7f2ed] text-[#164c3a]" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950"}`}>
            <Icon size={18}/>{label}
          </Link>
        );
      })}
    </nav>
  );
}

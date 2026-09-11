"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, BrainCircuit, ClipboardCheck, Gauge, NotebookPen, Trophy } from "lucide-react";

const items = [
  { href: "/alumno/sa2/habilidades", label: "Mis habilidades deportivas", icon: Trophy },
  { href: "/alumno/sa2/contenidos", label: "Contenidos teóricos", icon: BookOpen },
  { href: "/alumno/sa2/diario", label: "Diario deportivo", icon: NotebookPen },
  { href: "/alumno/sa2/cuestionarios", label: "Cuestionarios", icon: ClipboardCheck },
  { href: "/alumno/sa2/decisiones", label: "Conocimiento y decisiones", icon: BrainCircuit },
  { href: "/alumno/sa2/progreso", label: "Mi progreso", icon: Gauge },
];

export function Sa2SectionNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Apartados de Habilidades motrices específicas y deportes" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
              active
                ? "border-[#1e6b4f]/25 bg-[#e7f2ed] text-[#164c3a]"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950"
            }`}
          >
            <Icon size={18} /> {label}
          </Link>
        );
      })}
    </nav>
  );
}

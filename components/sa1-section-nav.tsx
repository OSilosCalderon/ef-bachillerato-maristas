"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BookOpen, ClipboardList, Gauge, MessageSquareText, Target } from "lucide-react";

const items = [
  { href: "/alumno/sa1/evolucion", label: "Mi evolución física", icon: Activity },
  { href: "/alumno/sa1/plan", label: "Mi plan personal", icon: Target },
  { href: "/alumno/sa1/contenidos", label: "Contenidos teóricos", icon: BookOpen },
  { href: "/alumno/sa1/diario", label: "Diario de sesiones", icon: MessageSquareText },
  { href: "/alumno/sa1/cuestionarios", label: "Cuestionarios", icon: ClipboardList },
  { href: "/alumno/sa1/progreso", label: "Mi progreso", icon: Gauge },
];

export function Sa1SectionNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Apartados de Salud y calidad de vida" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${active ? "border-[#1e6b4f]/25 bg-[#e7f2ed] text-[#164c3a]" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950"}`}>
            <Icon size={18} /> {label}
          </Link>
        );
      })}
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BookOpenCheck, ClipboardCheck, Home, Target } from "lucide-react";

const items = [
  { href: "/alumno/2bach/sa1", label: "Resumen", icon: Home },
  { href: "/alumno/2bach/sa1/evaluacion", label: "Evaluación inicial", icon: ClipboardCheck },
  { href: "/alumno/2bach/sa1/registro", label: "Registro de datos", icon: Activity },
  { href: "/alumno/2bach/sa1/plan", label: "Mi plan personal", icon: Target },
  { href: "/alumno/2bach/sa1/teoria", label: "Bloque teórico", icon: BookOpenCheck },
];

export function SecondYearSa1SectionNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Apartados de la SA1 de 2º Bachillerato" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/alumno/2bach/sa1" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
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

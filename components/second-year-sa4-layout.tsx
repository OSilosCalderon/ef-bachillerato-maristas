"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck, Home, ListChecks, MapPinned } from "lucide-react";

const items = [
  { href: "/alumno/2bach/sa4", label: "Inicio", icon: Home },
  { href: "/alumno/2bach/sa4/proyecto", label: "Proyecto del evento", icon: MapPinned },
  { href: "/alumno/2bach/sa4/guia", label: "Guía de organización", icon: ListChecks },
  { href: "/alumno/2bach/sa4/evaluacion", label: "Evaluación final", icon: ClipboardCheck },
];

export function SecondYearSa4Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
      <nav aria-label="Apartados de SA4 de 2º Bachillerato" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${active ? "border-[#1e6b4f]/25 bg-[#e7f2ed] text-[#164c3a]" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950"}`}
            >
              <Icon size={18}/> {label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}

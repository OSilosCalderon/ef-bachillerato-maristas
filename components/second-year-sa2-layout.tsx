"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenCheck, ClipboardList, Dumbbell, Target } from "lucide-react";

const items = [
  { href: "/alumno/2bach/sa2", label: "Inicio SA2", icon: Dumbbell },
  { href: "/alumno/2bach/sa1/plan", label: "Mi plan de SA1", icon: Target },
  { href: "/alumno/2bach/sa2/seguimiento", label: "Seguimiento", icon: ClipboardList },
  { href: "/alumno/2bach/sa2/teoria", label: "Teoría aplicada", icon: BookOpenCheck },
];

export function SecondYearSa2Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
      <nav aria-label="Apartados de SA2 de 2º Bachillerato" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === "/alumno/2bach/sa2" ? pathname === href : pathname.startsWith(href);
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
      {children}
    </div>
  );
}

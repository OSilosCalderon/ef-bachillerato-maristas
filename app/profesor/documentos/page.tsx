import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";

export default function Page() {
  return (
    <>
      <DashboardHeader
        eyebrow="Gestión central"
        title="Biblioteca de documentos"
        description="Los documentos se gestionan junto a los contenidos teóricos para mantener cada archivo unido a su situación de aprendizaje."
      />
      <div className="mx-auto max-w-7xl p-5 sm:p-8">
        <section className="card flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-start gap-4">
            <span className="rounded-2xl bg-[#e7f2ed] p-3 text-[#1e6b4f]"><FileText size={22}/></span>
            <div>
              <h2 className="text-xl font-extrabold">Documentos y contenidos en un único gestor</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Desde Contenidos puedes adjuntar PDF, Word, PowerPoint e imágenes, añadir enlaces y decidir si cada material permanece en borrador o se publica para el alumnado.
              </p>
            </div>
          </div>
          <Link href="/profesor/contenidos" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1e6b4f] px-4 py-3 text-sm font-bold text-white">
            Abrir gestor <ArrowRight size={17}/>
          </Link>
        </section>
      </div>
    </>
  );
}

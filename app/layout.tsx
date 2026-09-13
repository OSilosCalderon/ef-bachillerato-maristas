import type { Metadata } from "next";
import { CorporateLogo } from "@/components/corporate-logo";
import "./globals.css";

export const metadata: Metadata = {
  title: "Educación Física · Bachillerato | Maristas Badajoz",
  description: "Aplicación educativa de Educación Física para 1º y 2º de Bachillerato en Maristas Badajoz.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <div className="corporate-strip">
          <div className="corporate-strip-inner">
            <CorporateLogo />
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}

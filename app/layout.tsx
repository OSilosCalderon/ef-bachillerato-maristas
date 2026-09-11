import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EF de 1º Bachillerato | Maristas Badajoz",
  description: "Aplicación educativa de Educación Física para 1º de Bachillerato.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

"use client";

import { useState } from "react";

export function Sa4LogoImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  if (failedSource === src) return <div role="status" className="space-y-3 p-3 text-sm text-slate-700">
    <p>No se ha podido mostrar esta imagen.</p>
    <button type="button" className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 font-bold" onClick={() => setFailedSource(null)}>Reintentar imagen</button>
  </div>;
  // Uploaded data URLs must be displayed directly, without the image optimizer.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} onError={() => setFailedSource(src)}/>;
}

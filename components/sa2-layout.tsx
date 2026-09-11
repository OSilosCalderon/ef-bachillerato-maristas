import { Sa2SectionNav } from "@/components/sa2-section-nav";

export function Sa2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
      <Sa2SectionNav />
      {children}
    </div>
  );
}

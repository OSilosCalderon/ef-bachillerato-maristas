import { Sa1SectionNav } from "@/components/sa1-section-nav";

export function Sa1Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
      <Sa1SectionNav />
      {children}
    </div>
  );
}

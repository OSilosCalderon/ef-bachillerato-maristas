import { SecondYearSa1SectionNav } from "@/components/second-year-sa1-section-nav";

export function SecondYearSa1Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
      <SecondYearSa1SectionNav />
      {children}
    </div>
  );
}

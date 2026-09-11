import { Sa3SectionNav } from "@/components/sa3-section-nav";

export function Sa3Layout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8"><Sa3SectionNav/>{children}</div>;
}

import { SideNav } from "@/components/side-nav";

export function AppShell({ role, children, courseYear, visibleSituations }: { role: "student" | "teacher"; children: React.ReactNode; courseYear?: 1 | 2; visibleSituations?: string[] }) {
  return (
    <div className="min-h-screen">
      <SideNav role={role} courseYear={courseYear} visibleSituations={visibleSituations} />
      <main className="pb-24 lg:ml-64 lg:pb-8">{children}</main>
    </div>
  );
}

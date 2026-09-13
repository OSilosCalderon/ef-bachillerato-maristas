import { SideNav } from "@/components/side-nav";

export function AppShell({ role, children, courseYear }: { role: "student" | "teacher"; children: React.ReactNode; courseYear?: 1 | 2 }) {
  return (
    <div className="min-h-screen">
      <SideNav role={role} courseYear={courseYear} />
      <main className="pb-24 lg:ml-64 lg:pb-8">{children}</main>
    </div>
  );
}

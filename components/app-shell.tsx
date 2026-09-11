import { SideNav } from "@/components/side-nav";

export function AppShell({ role, children }: { role: "student" | "teacher"; children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <SideNav role={role} />
      <main className="pb-24 lg:ml-64 lg:pb-8">{children}</main>
    </div>
  );
}

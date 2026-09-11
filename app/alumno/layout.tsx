import { AppShell } from "@/components/app-shell";
import { requireRole } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireRole("student");
  return <AppShell role="student">{children}</AppShell>;
}

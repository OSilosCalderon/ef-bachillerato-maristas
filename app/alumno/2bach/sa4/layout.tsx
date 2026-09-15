import { requireVisibleSituation } from "@/lib/situation-visibility-server";
export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireVisibleSituation(2, "SA4");
  return children;
}

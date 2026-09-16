import { TeacherSituationVisibility } from "@/components/teacher-situation-visibility";
export default async function Page({ searchParams }: { searchParams: Promise<{ curso?: string }> }) {
  const year = (await searchParams).curso === "2" ? 2 : 1;
  return <div className="mx-auto max-w-7xl p-5 sm:p-8"><TeacherSituationVisibility key={year} initialYear={year}/></div>;
}

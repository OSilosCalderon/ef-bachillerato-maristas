import { TeacherSituationVisibility } from "@/components/teacher-situation-visibility";
export default async function Page({ searchParams }: { searchParams: Promise<{ curso?: string }> }) {
  const params = await searchParams;
  return <div className="mx-auto max-w-6xl p-5 sm:p-8"><TeacherSituationVisibility initialYear={params.curso === "2" ? 2 : 1}/></div>;
}

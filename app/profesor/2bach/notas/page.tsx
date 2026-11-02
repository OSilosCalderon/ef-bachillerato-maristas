import { TeacherGradesOverview } from "@/components/teacher-grades-overview";
import { loadSecondYearGradesOverview } from "@/lib/gradebook-server";

export default async function Page() {
  const data = await loadSecondYearGradesOverview();
  return <div className="mx-auto max-w-7xl p-5 sm:p-8"><TeacherGradesOverview key={data.loadedAt} data={data}/></div>;
}

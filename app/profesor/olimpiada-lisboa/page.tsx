import { OlympiadLisboaContent } from "@/components/olympiad-lisboa-content";
import { TeacherOlympiadResponses } from "@/components/teacher-olympiad-responses";
import { loadTeacherOlympiad } from "@/lib/olympiad-lisboa-server";

export default async function Page() {
  const students = await loadTeacherOlympiad();
  return <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8"><TeacherOlympiadResponses students={students}/><OlympiadLisboaContent/></div>;
}

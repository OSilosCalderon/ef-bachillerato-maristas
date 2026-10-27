import { redirect } from "next/navigation";
import { OlympiadLisboaContent } from "@/components/olympiad-lisboa-content";
import { OlympiadParticipationForm } from "@/components/olympiad-participation-form";
import { loadStudentOlympiad } from "@/lib/olympiad-lisboa-server";

export const metadata = { title: "Olimpiada Marista Lisboa 2027" };

export default async function Page() {
  const data = await loadStudentOlympiad();
  if (!data) redirect("/alumno");
  return <div className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8"><OlympiadLisboaContent showParticipationLink/><OlympiadParticipationForm initialResponse={data.response}/></div>;
}

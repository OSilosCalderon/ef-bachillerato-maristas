import { notFound } from "next/navigation";
import { TeacherSituationResults } from "@/components/teacher-situation-results";

export default async function Page({ params }: { params: Promise<{ situation: string }> }) {
  const { situation } = await params;
  if (!/^sa[1-6]$/.test(situation)) notFound();
  return <TeacherSituationResults year={2} code={situation.toUpperCase()}/>;
}

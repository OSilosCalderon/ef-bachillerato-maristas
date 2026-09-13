import { TeacherCentralDashboard } from "@/components/teacher-central-dashboard";
import { ClassScheduleCard } from "@/components/class-schedule-card";

export default function TeacherDashboard() {
  return <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8"><ClassScheduleCard showAll/><TeacherCentralDashboard/></div>;
}

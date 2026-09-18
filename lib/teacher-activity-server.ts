import "server-only";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { firstYearCalendarGroup } from "@/lib/class-groups";
import { trainingTheoryTopics } from "@/lib/training-theory-topics";
import { flexibilityTheoryTopic } from "@/lib/training-theory-flexibility";
import { secondYearTheoryTopics } from "@/lib/second-year-theory-topics";
import type { ActivityCategory, TeacherActivity, TeacherActivityData } from "@/lib/teacher-activity";

type Row = Record<string, unknown>;
const str = (value: unknown) => typeof value === "string" ? value : "";
const num = (value: unknown) => value !== null && value !== undefined && Number.isFinite(Number(value)) ? Number(value) : null;

export async function loadTeacherActivity(year: 1 | 2): Promise<TeacherActivityData> {
  await requireRole("teacher");
  const supabase = await createClient();
  async function rows(table: string, filter?: { key: string; values: string[] }): Promise<Row[]> {
    if (filter && !filter.values.length) return [];
    const result: Row[] = [];
    for (let start = 0; ; start += 1000) {
      let query = supabase.from(table).select("*").order(table === "theory_challenge_topics" ? "slug" : "id").range(start, start + 999);
      if (filter) query = query.in(filter.key, filter.values);
      const { data, error } = await query;
      if (error) throw new Error(`No se han podido cargar los datos de ${table}.`);
      result.push(...(data ?? []) as Row[]);
      if ((data?.length ?? 0) < 1000) return result;
    }
  }
  const { data: courses, error } = await supabase.from("courses").select("id,name").eq("bachillerato_year", year).eq("is_active", true);
  if (error || !courses?.length) throw new Error("No se ha encontrado un curso activo.");
  const courseIds = courses.map((course) => String(course.id));
  const [studentRows, situations, physicalTests, sports, technicalTests, questionnaires, contents, procedural] = await Promise.all([
    rows("students", { key: "course_id", values: courseIds }), rows("learning_situations", { key: "course_id", values: courseIds }),
    rows("physical_tests"), rows("sports"), rows("technical_tests"), rows("questionnaires"), rows("theoretical_contents"), rows("procedural_activities"),
  ]);
  const activeStudents = studentRows.filter((row) => row.active);
  const profiles = await rows("profiles", { key: "id", values: activeStudents.map((row) => str(row.profile_id)) });
  const students = activeStudents.map((row) => {
    const profile = profiles.find((entry) => entry.id === row.profile_id);
    return { id: str(row.id), name: str(profile?.display_name) || "Alumno/a", group: firstYearCalendarGroup(str(profile?.class_group)) ?? (str(profile?.class_group) || `${year}º Bachillerato`) };
  }).sort((a, b) => a.name.localeCompare(b.name, "es"));
  const ids = students.map((student) => student.id);
  const tableNames = ["personal_training_plans", "session_journals", "sports_journals", "training_session_logs", "physical_test_results", "technical_test_results", "questionnaire_attempts", "procedural_attempts", "theory_topic_progress", "theory_challenge_responses", "content_reads", "theoretical_content_reads", "healthy_habit_plans", "healthy_habit_weekly_logs", "sports_event_projects"];
  const loaded = await Promise.all(tableNames.map((table) => rows(table, { key: "student_id", values: ids })));
  const table = Object.fromEntries(tableNames.map((name, index) => [name, loaded[index]]));
  const saFor = (id: unknown) => str(situations.find((sa) => sa.id === id)?.code);
  const activities: TeacherActivity[] = [];
  function add(row: Row, category: ActivityCategory, title: string, sa: string, score: number | null = null, scoreLabel?: string) {
    if (!sa) return;
    activities.push({ id: `${category}-${str(row.id)}`, studentId: str(row.student_id), category, sa, title, date: str(row.updated_at || row.read_at || row.submitted_at || row.recorded_at || row.created_at), status: str(row.status), score, scoreLabel, details: row });
  }
  for (const row of table.personal_training_plans) add(row, "plans", str(row.objective) || "Plan personal", str(row.sa_code));
  for (const row of table.session_journals) add(row, "journals", str(row.title) || "Diario de clase", saFor(row.learning_situation_id), num(row.perceived_effort), "Esfuerzo percibido");
  for (const row of table.sports_journals) add(row, "journals", "Diario deportivo", saFor(row.learning_situation_id));
  for (const row of table.training_session_logs) add(row, "journals", `Sesión de entrenamiento ${row.session_number}`, str(row.sa_code), num(row.completion_percent), "Realización declarada (%)");
  for (const row of table.physical_test_results) {
    const test = physicalTests.find((entry) => entry.id === row.physical_test_id);
    if (test) add(row, "physical", str(test.name), "SA1", num(row.value), str(test.unit));
  }
  for (const row of table.technical_test_results) {
    const test = technicalTests.find((entry) => entry.id === row.technical_test_id);
    const sport = sports.find((entry) => entry.id === test?.sport_id);
    if (test) add(row, "technical", str(test.name), saFor(sport?.learning_situation_id), num(row.value), str(test.unit));
  }
  for (const row of table.questionnaire_attempts) {
    const definition = questionnaires.find((entry) => entry.id === row.questionnaire_id);
    if (definition) add({ ...row, instrument_code: definition.instrument_code, assessment_phase: definition.assessment_phase }, "questionnaires", str(definition.title), saFor(definition.learning_situation_id));
  }
  for (const row of table.procedural_attempts) {
    const definition = procedural.find((entry) => entry.id === row.activity_id);
    if (definition) add(row, "procedural", str(definition.title), saFor(definition.learning_situation_id), row.status === "submitted" ? num(row.total_score) : null, "Puntos");
  }
  const topics = year === 2 ? secondYearTheoryTopics : [...trainingTheoryTopics, flexibilityTheoryTopic].map((topic) => ({ ...topic, sa: "SA1" }));
  for (const row of table.theory_topic_progress) {
    const topic = topics.find((entry) => entry.slug === row.topic_slug);
    if (!topic) continue;
    if (row.completed) add(row, "theory", topic.title, topic.sa);
    if (row.quiz_score !== null) add(row, "quizzes", topic.title, topic.sa, num(row.quiz_score), "Mejor puntuación (%)");
  }
  const challengeTopics = await rows("theory_challenge_topics", { key: "course_year", values: [String(year)] });
  for (const row of table.theory_challenge_responses) {
    const definition = challengeTopics.find((entry) => entry.slug === row.topic_slug);
    if (definition) add({ ...row, challenge_prompt: definition.prompt }, "challenges", str(definition.title), str(definition.sa_code));
  }
  const seenReads = new Set<string>();
  for (const row of [...table.content_reads, ...table.theoretical_content_reads]) {
    const key = `${row.student_id}:${row.content_id}`;
    if (seenReads.has(key)) continue;
    seenReads.add(key);
    const content = contents.find((entry) => entry.id === row.content_id);
    if (content) add(row, "theory", str(content.title), saFor(content.learning_situation_id));
  }
  for (const row of table.healthy_habit_plans) add(row, "habits", str(row.focus_habit) || "Plan de hábitos", str(row.sa_code));
  for (const row of table.healthy_habit_weekly_logs) add(row, "habits", `Seguimiento de hábitos · semana ${row.week_number}`, str(row.sa_code));
  for (const row of table.sports_event_projects) add(row, "projects", str(row.event_name) || "Proyecto deportivo", str(row.sa_code));
  return { students, activities, situations: situations.map((sa) => ({ id: str(sa.id), code: str(sa.code), title: str(sa.title) })), physicalTests: physicalTests.map((test) => ({ id: str(test.id), name: str(test.name), unit: str(test.unit), direction: str(test.direction) })), courseName: courses.map((course) => course.name).join(" · "), loadedAt: new Date().toISOString() };
}

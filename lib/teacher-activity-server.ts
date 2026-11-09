import "server-only";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { firstYearCalendarGroup } from "@/lib/class-groups";
import { trainingTheoryTopics } from "@/lib/training-theory-topics";
import { flexibilityTheoryTopic } from "@/lib/training-theory-flexibility";
import { secondYearTheoryTopics } from "@/lib/second-year-theory-topics";
import { FIRST_YEAR_PLAN_SESSIONS } from "@/lib/first-year-personal-plan-calendar";
import { SECOND_YEAR_PLAN_SESSIONS } from "@/lib/second-year-personal-plan-calendar";
import type { ExpectedTeacherInstrument, ActivityCategory, TeacherActivity, TeacherActivityData } from "@/lib/teacher-activity";

type Row = Record<string, unknown>;
type QueryError = { code?: string | null; message?: string | null };
function isMissingRelation(error: QueryError) {
  const code = error.code ?? "";
  const message = error.message ?? "";
  return code === "42P01" || code === "PGRST205" || /relation .* does not exist|could not find the table .* in the schema cache/i.test(message);
}
const str = (value: unknown) => typeof value === "string" ? value : "";
const num = (value: unknown) => value !== null && value !== undefined && Number.isFinite(Number(value)) ? Number(value) : null;

type SecondYearWorkView = { view: "overview" } | { view: "student"; studentId: string };
type Membership = { key: string; values: string[] };

const overviewColumns: Record<string, string> = {
  physical_final_reflections: "id,student_id,course_id,course_year,sa_code,status,submitted_at,updated_at",
  personal_training_plans: "id,student_id,course_id,sa_code,status,final_conclusions,future_work,updated_at",
  training_session_logs: "id,student_id,course_id,sa_code,session_number,status,updated_at",
  physical_test_results: "id,student_id,physical_test_id,period,value,updated_at",
  questionnaire_attempts: "id,student_id,questionnaire_id,status,submitted_at",
  theory_topic_progress: "id,student_id,topic_slug,completed,quiz_score,updated_at",
  student_assessment_grades: "id,student_id,item_id,score,published_at",
};

export async function loadTeacherActivity(year: 1 | 2, work?: SecondYearWorkView): Promise<TeacherActivityData> {
  await requireRole("teacher");
  const supabase = await createClient();
  const overview = work?.view === "overview";
  async function rows(table: string, filter?: Membership, optional = false, extra?: Membership): Promise<Row[]> {
    const filters = [filter, extra].filter((entry) => entry !== undefined);
    if (filters.some((entry) => !entry.values.length)) return [];
    const result: Row[] = [];
    for (let start = 0; ; start += 1000) {
      const columns = overview ? overviewColumns[table] ?? "*" : "*";
      let query = supabase.from(table).select(columns).order(table === "theory_challenge_topics" ? "slug" : "id").range(start, start + 999);
      for (const entry of filters) query = query.in(entry.key, entry.values);
      const { data, error } = await query;
      if (error) {
        if (optional && isMissingRelation(error)) return result;
        throw new Error(`No se han podido cargar los datos de ${table}.`);
      }
      result.push(...(data ?? []) as unknown as Row[]);
      if ((data?.length ?? 0) < 1000) return result;
    }
  }
  const { data: courses, error } = await supabase.from("courses").select("id,name").eq("bachillerato_year", year).eq("is_active", true);
  if (error || !courses?.length) throw new Error("No se ha encontrado un curso activo.");
  const courseIds = courses.map((course) => String(course.id));
  const courseFilter = { key: "course_id", values: courseIds };
  const studentFilter = work?.view === "student" ? { key: "id", values: [work.studentId] } : undefined;
  const situationFilter = work ? { key: "code", values: ["SA1", "SA2"] } : undefined;
  const [studentRows, situations] = await Promise.all([
    rows("students", courseFilter, false, studentFilter), rows("learning_situations", courseFilter, false, situationFilter),
  ]);
  const activeStudents = studentRows.filter((row) => row.active);
  const situationMembership = work ? { key: "learning_situation_id", values: situations.map((sa) => str(sa.id)) } : undefined;
  const courseName = courses.map((course) => course.name).join(" · ");
  if (studentFilter && !activeStudents.length) return { students: [], activities: [], situations: [], physicalTests: [], courseName, loadedAt: new Date().toISOString() };
  const [profiles, physicalTests, sports, technicalTests, questionnaires, contents, procedural, assessmentItemRows] = await Promise.all([
    rows("profiles", { key: "id", values: activeStudents.map((row) => str(row.profile_id)) }),
    rows("physical_tests"), overview ? [] : rows("sports", situationMembership), overview ? [] : rows("technical_tests"),
    rows("questionnaires", situationMembership), overview ? [] : rows("theoretical_contents", situationMembership),
    overview ? [] : rows("procedural_activities", situationMembership), rows("assessment_grade_items", courseFilter),
  ]);
  const students = activeStudents.map((row) => {
    const profile = profiles.find((entry) => entry.id === row.profile_id);
    return { id: str(row.id), courseId: str(row.course_id), name: str(profile?.display_name) || "Alumno/a", group: firstYearCalendarGroup(str(profile?.class_group)) ?? (str(profile?.class_group) || `${year}º Bachillerato`) };
  }).sort((a, b) => a.name.localeCompare(b.name, "es"));
  const ids = students.map((student) => student.id);
  const optionalTables = new Set(["personal_training_plans", "training_session_logs", "theory_topic_progress", "healthy_habit_plans", "healthy_habit_weekly_logs", "sports_event_projects"]);
  const tableNames = ["physical_final_reflections", "personal_training_plans", "session_journals", "sports_journals", "training_session_logs", "physical_test_results", "technical_test_results", "questionnaire_attempts", "procedural_attempts", "theory_topic_progress", "theory_challenge_responses", "content_reads", "healthy_habit_plans", "healthy_habit_weekly_logs", "sports_event_projects"];
  tableNames.push("student_assessment_grades");
  if (year === 1) tableNames.push("first_year_plan_session_logs");
  const scopedFilters: Record<string, Membership> = {
    personal_training_plans: courseFilter, training_session_logs: courseFilter, physical_final_reflections: courseFilter,
    questionnaire_attempts: { key: "questionnaire_id", values: questionnaires.map((row) => str(row.id)) },
    procedural_attempts: { key: "activity_id", values: procedural.map((row) => str(row.id)) },
  };
  const loaded = await Promise.all(tableNames.map((table) => {
    if (overview && !overviewColumns[table]) return [];
    if (work && ["healthy_habit_plans", "healthy_habit_weekly_logs", "sports_event_projects"].includes(table)) return [];
    return rows(table, { key: "student_id", values: ids }, optionalTables.has(table), work ? scopedFilters[table] : undefined);
  }));
  const table = Object.fromEntries(tableNames.map((name, index) => [name, loaded[index]]));
  const [questionnaireResponses, questionnaireQuestions, proceduralResponses, proceduralQuestions] = await Promise.all([
    overview ? [] : rows("questionnaire_responses", {key:"attempt_id",values:table.questionnaire_attempts.map((row) => str(row.id))}),
    overview ? [] : rows("questionnaire_questions", {key:"questionnaire_id",values:questionnaires.filter((row) => situations.some((sa) => sa.id===row.learning_situation_id)).map((row) => str(row.id))}),
    rows("procedural_responses", {key:"attempt_id",values:table.procedural_attempts.map((row) => str(row.id))}),
    rows("procedural_questions", {key:"activity_id",values:procedural.filter((row) => situations.some((sa) => sa.id===row.learning_situation_id)).map((row) => str(row.id))}),
  ]);
  const proceduralOptions = await rows("procedural_options", {key:"question_id",values:proceduralQuestions.map((row) => str(row.id))});
  const questionnaireAnswers = (attemptId: unknown) => questionnaireResponses.filter((row) => row.attempt_id===attemptId).map((row) => {
    const question = questionnaireQuestions.find((item) => item.id===row.question_id);
    const answer = row.answer !== null && typeof row.answer==="object" && !Array.isArray(row.answer) ? row.answer as Row : null;
    return {question:str(question?.prompt)||"Pregunta",answer:answer?.label ?? answer?.value ?? row.answer,position:Number(question?.position)||0};
  }).sort((a,b) => a.position-b.position).map(({question,answer}) => ({question,answer}));
  const proceduralAnswers = (attemptId: unknown) => proceduralResponses.filter((row) => row.attempt_id===attemptId).map((row) => {
    const question = proceduralQuestions.find((item) => item.id===row.question_id);
    const option = proceduralOptions.find((item) => item.id===row.selected_option_id);
    return {question:str(question?.prompt)||"Pregunta",answer:str(row.text_answer)||str(option?.label)||"Sin responder",score:num(row.score)};
  });

  const evaluationRows: Row[] = [];
  if (ids.length) for (let start = 0; ; start += 1000) {
    const { data, error: evaluationError } = await supabase
      .from(year === 1 ? "first_year_plan_session_grades" : "training_session_grade_results")
      .select(overview ? "student_id,session_number,teacher_score,updated_at,absent" : "student_id,session_number,teacher_score,teacher_comment,updated_at,absent")
      .in("student_id", ids)
      .order("student_id").order("session_number").range(start, start + 999);
    if (evaluationError) throw new Error("No se han podido cargar las valoraciones del profesorado.");
    evaluationRows.push(...(data ?? []) as unknown as Row[]);
    if ((data?.length ?? 0) < 1000) break;
  }
  const sessionEvaluations = evaluationRows.map((row) => ({ studentId: str(row.student_id), number: Number(row.session_number), score: Number(row.teacher_score), comment: str(row.teacher_comment), absent: row.absent === true, updatedAt: str(row.updated_at) }));
  const evaluationsBySession = new Map(sessionEvaluations.map((row) => [`${row.studentId}:${row.number}`, row]));
  const situationsById = new Map(situations.map((sa) => [sa.id, sa]));
  const studentCourses = new Map(students.map((student) => [student.id, student.courseId]));
  const saFor = (id: unknown) => str(situationsById.get(id)?.code);
  const sameCourse = (row: Row, course: unknown) => !work || studentCourses.get(str(row.student_id)) === course;
  const saForStudent = (row: Row, situationId: unknown) => sameCourse(row, situationsById.get(situationId)?.course_id) ? saFor(situationId) : "";
  const inScope = (sa: string) => Boolean(sa) && (!work || sa === "SA1" || sa === "SA2");
  const activities: TeacherActivity[] = [];
  function add(row: Row, category: ActivityCategory, title: string, sa: string, score: number | null = null, scoreLabel?: string) {
    if (!inScope(sa)) return;
    activities.push({ id: `${category}-${str(row.id)}`, studentId: str(row.student_id), category, sa, title, date: str(row.updated_at || row.read_at || row.submitted_at || row.recorded_at || row.created_at), status: str(row.status), score, scoreLabel, details: row });
  }
  for (const row of table.personal_training_plans) if (sameCourse(row, row.course_id)) add(row, "plans", str(row.objective) || "Plan personal", str(row.sa_code));
  for (const row of table.physical_final_reflections) {
    if (row.course_id === students.find((student) => student.id === row.student_id)?.courseId && Number(row.course_year) === year && row.sa_code === (year === 1 ? "SA1" : "SA2")) add(row, "reflections", "Reflexión personal y motivaciones de futuro", str(row.sa_code));
  }
  // Keep all historical responses available to teachers without requesting new diaries.
  for (const row of table.session_journals) add({ ...row, _kind: "class-journal" }, "journals", `Registro anterior · ${str(row.title) || "Diario de clase"}`, saForStudent(row, row.learning_situation_id), num(row.perceived_effort), "Esfuerzo percibido");
  for (const row of table.sports_journals) add(row, "journals", "Registro anterior · Diario deportivo", saForStudent(row, row.learning_situation_id));
  for (const row of (year === 1 ? table.first_year_plan_session_logs : table.training_session_logs)) {
    if (!sameCourse(row, row.course_id)) continue;
    const evaluation = evaluationsBySession.get(`${row.student_id}:${row.session_number}`);
    add({ ...row, _kind: "plan-session", teacher_score: evaluation?.score ?? null, teacher_absent: evaluation?.absent ?? false, teacher_comment: evaluation?.comment ?? "", teacher_evaluated_at: evaluation?.updatedAt ?? null }, "journals", `Sesión de entrenamiento ${row.session_number}`, str(row.sa_code), num(row.completion_percent), "Realización declarada (%)");
  }
  for (const row of table.physical_test_results) {
    const test = physicalTests.find((entry) => entry.id === row.physical_test_id);
    if (test) add(row, "physical", str(test.name), year === 2 && row.period === "december" ? "SA2" : "SA1", num(row.value), str(test.unit));
  }
  for (const row of table.technical_test_results) {
    const test = technicalTests.find((entry) => entry.id === row.technical_test_id);
    const sport = sports.find((entry) => entry.id === test?.sport_id);
    if (test) add(row, "technical", str(test.name), saForStudent(row, sport?.learning_situation_id), num(row.value), str(test.unit));
  }
  for (const row of table.questionnaire_attempts) {
    const definition = questionnaires.find((entry) => entry.id === row.questionnaire_id);
    const sa = saForStudent(row, definition?.learning_situation_id);
    if (definition && sa) add({ ...row, answers: questionnaireAnswers(row.id), instrument_code: definition.instrument_code, assessment_phase: definition.assessment_phase }, "questionnaires", str(definition.title), year === 2 && definition.assessment_phase === "final" ? "SA2" : sa);
  }
  for (const row of table.procedural_attempts) {
    const definition = procedural.find((entry) => entry.id === row.activity_id);
    if (definition) add({ ...row, answers: proceduralAnswers(row.id) }, "procedural", str(definition.title), saForStudent(row, definition.learning_situation_id), row.status === "submitted" ? num(row.total_score) : null, "Puntos");
  }
  const topics = year === 2 ? secondYearTheoryTopics : [...trainingTheoryTopics, flexibilityTheoryTopic].map((topic) => ({ ...topic, sa: "SA1" }));
  const expectedInstruments: ExpectedTeacherInstrument[] = [];
  const expect = (item: ExpectedTeacherInstrument) => { if (situations.some((sa) => sa.code === item.sa)) expectedInstruments.push(year === 1 && item.sa !== "SA1" ? { ...item, tracking: "unavailable" } : item); };
  expect({ key: "SA1:plan", sa: "SA1", category: "plans", title: "Plan personal", matchAll: true });
  expect({ key: "SA1:plan-reflection", sa: "SA1", category: "plans", title: "Reflexión final del plan", matchAll: true, completion: "reflection" });
  expect({ key: `${year === 1 ? "SA1" : "SA2"}:final-physical-reflection`, sa: year === 1 ? "SA1" : "SA2", category: "reflections", title: "Reflexión personal y motivaciones de futuro", matchAll: true });
  for (const test of physicalTests) for (const period of ["september", "december"]) {
    if (work && test.active !== true) continue;
    const sa = year === 2 && period === "december" ? "SA2" : "SA1";
    const phase = period === "september" ? "initial" : "final";
    expect({ key: `${sa}:physical:${test.id}:${period}`, sa, category: "physical", title: `${test.name} · ${phase === "initial" ? "Inicial" : "Final"}`, filters: { physical_test_id: str(test.id), period }, phase });
  }
  for (const test of technicalTests) {
    const sport = sports.find((entry) => entry.id === test.sport_id);
    const sa = saFor(sport?.learning_situation_id);
    if (work && (!test.active || !sport?.active)) continue;
    const courseId = work ? str(situationsById.get(sport?.learning_situation_id)?.course_id) : undefined;
    for (const period of ["january", "march"]) if (sa) expect({ key: `${sa}:technical:${test.id}:${period}`, sa, category: "technical", title: `${test.name} · ${period === "january" ? "Inicial" : "Final"}`, filters: { technical_test_id: str(test.id), period }, courseId });
  }
  for (const questionnaire of questionnaires) {
    if (work && questionnaire.published !== true) continue;
    const originalSa = saFor(questionnaire.learning_situation_id);
    const phase = questionnaire.assessment_phase === "final" ? "final" : "initial";
    const sa = originalSa && year === 2 && phase === "final" ? "SA2" : originalSa;
    const courseId = work ? str(situationsById.get(questionnaire.learning_situation_id)?.course_id) : undefined;
    if (sa) expect({ key: `${sa}:questionnaire:${questionnaire.id}`, sa, category: "questionnaires", title: str(questionnaire.title), filters: { questionnaire_id: str(questionnaire.id) }, courseId, phase });
  }
  for (const activity of procedural) {
    if (work && activity.published !== true) continue;
    const sa = saFor(activity.learning_situation_id);
    const courseId = work ? str(situationsById.get(activity.learning_situation_id)?.course_id) : undefined;
    if (sa) expect({ key: `${sa}:procedural:${activity.id}`, sa, category: "procedural", title: str(activity.title), filters: { activity_id: str(activity.id) }, courseId });
  }
  for (const topic of topics) for (const category of ["theory", "quizzes"] as const) expect({ key: `${topic.sa}:${category}:${topic.slug}`, sa: topic.sa, category, title: topic.title, filters: { topic_slug: topic.slug } });
  if (year === 2) {
    SECOND_YEAR_PLAN_SESSIONS.forEach((session, index) => expect({ key: `SA2:session:${index + 1}`, sa: "SA2", category: "journals", title: `Sesión ${index + 1} · ${session.date.slice(8)}/${session.date.slice(5, 7)}`, filters: work ? { _kind: "plan-session", session_number: index + 1 } : { session_number: index + 1 } }));
    expect({ key: "SA3:habit-plan", sa: "SA3", category: "habits", title: "Plan personal de hábitos", filters: { _kind: "habit-plan" } });
    for (let week = 1; week <= 4; week++) expect({ key: `SA3:habit-week:${week}`, sa: "SA3", category: "habits", title: `Seguimiento de hábitos · semana ${week}`, filters: { _kind: "habit-week", week_number: week } });
    expect({ key: "SA4:event-project", sa: "SA4", category: "projects", title: "Proyecto de evento deportivo", matchAll: true });
  } else {
    for (const group of [...new Set(students.map((student) => student.group))]) {
      (FIRST_YEAR_PLAN_SESSIONS[group] ?? []).forEach((session,index) => expect({key:`SA1:plan-session:${group}:${index+1}`,sa:"SA1",category:"journals",group,title:`Seguimiento del plan · sesión ${index+1} · ${session.date.slice(8)}/${session.date.slice(5,7)}`,filters:{_kind:"plan-session",session_number:index+1}}));
    }
    for (const [category, title] of [["technical","Pruebas técnicas · Inicial y final"],["questionnaires","Cuestionarios"],["procedural","Conocimiento y toma de decisiones"],["theory","Bloque teórico"],["quizzes","Autoevaluación teórica"]] as const) if (!expectedInstruments.some((item) => item.sa === "SA2" && item.category === category)) expect({ key: `SA2:${category}:planned`, sa: "SA2", category, title, matchAll:true, tracking:"unavailable" });
    // These existing pupil screens are demonstrations without a persisted submission.
    // Keep them visible without claiming that the pupil failed to deliver them.
    expect({ key: "SA3:session-design", sa: "SA3", category: "projects", title: "Diseño y realización de la sesión", matchAll: true, tracking: "unavailable" });
    expect({ key: "SA3:game-ratings", sa: "SA3", category: "procedural", title: "Valoración de juegos", filters: { _kind: "game-rating" }, tracking: "unavailable" });
    expect({ key: "SA3:attitude", sa: "SA3", category: "quizzes", title: "Autoevaluación de actitud", filters: { _kind: "attitude" }, tracking: "unavailable" });
    expect({ key: "SA3:materials", sa: "SA3", category: "theory", title: "Bloque teórico de SA3", matchAll: true, tracking: "unavailable" });
  }
  for (const row of table.theory_topic_progress) {
    const topic = topics.find((entry) => entry.slug === row.topic_slug);
    if (!topic) continue;
    add(row, "theory", topic.title, topic.sa);
    if (row.quiz_score !== null) add(row, "quizzes", topic.title, topic.sa, num(row.quiz_score), "Mejor puntuación (%)");
  }
  const challengeTopics = overview ? [] : await rows("theory_challenge_topics", { key: "course_year", values: [String(year)] });
  for (const topic of challengeTopics) expect({ key: `${topic.sa_code}:challenge:${topic.slug}`, sa: str(topic.sa_code), category: "challenges", title: str(topic.title), filters: { topic_slug: str(topic.slug) } });
  for (const row of table.theory_challenge_responses) {
    const definition = challengeTopics.find((entry) => entry.slug === row.topic_slug);
    if (definition) add({ ...row, challenge_prompt: definition.prompt }, "challenges", str(definition.title), str(definition.sa_code));
  }
  const seenReads = new Set<string>();
  for (const row of table.content_reads) {
    const key = `${row.student_id}:${row.content_id}`;
    if (seenReads.has(key)) continue;
    seenReads.add(key);
    const content = contents.find((entry) => entry.id === row.content_id);
    if (content) add(row, "theory", str(content.title), saForStudent(row, content.learning_situation_id));
  }
  for (const row of table.healthy_habit_plans) add({ ...row, _kind: "habit-plan" }, "habits", str(row.focus_habit) || "Plan de hábitos", str(row.sa_code));
  for (const row of table.healthy_habit_weekly_logs) add({ ...row, _kind: "habit-week" }, "habits", `Seguimiento de hábitos · semana ${row.week_number}`, str(row.sa_code));
  for (const row of table.sports_event_projects) add(row, "projects", str(row.event_name) || "Proyecto deportivo", str(row.sa_code));
  const assessmentItems = assessmentItemRows.map((row) => ({id:str(row.id),course_id:str(row.course_id),sa_code:str(row.sa_code),item_key:str(row.item_key),title:str(row.title),position:Number(row.position)}));
  const itemIds = new Set(assessmentItems.map((item) => item.id));
  const assessmentGrades = table.student_assessment_grades.filter((row) => itemIds.has(str(row.item_id))).map((row) => ({id:str(row.id),student_id:str(row.student_id),item_id:str(row.item_id),score:Number(row.score),comment:str(row.comment),published_at:str(row.published_at)}));
  return { students, activities, sessionEvaluations, assessmentItems, assessmentGrades, situations: situations.map((sa) => ({ id: str(sa.id), code: str(sa.code), title: str(sa.title) })), physicalTests: physicalTests.map((test) => ({ id: str(test.id), name: str(test.name), unit: str(test.unit), direction: str(test.direction) })), expectedInstruments, courseName, loadedAt: new Date().toISOString() };
}



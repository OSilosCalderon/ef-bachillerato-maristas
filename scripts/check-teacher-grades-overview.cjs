const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

function load(file, imports = {}) {
  const module = { exports: {} };
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(code, { module, exports: module.exports, require: name => Object.hasOwn(imports, name) ? imports[name] : require(name), Intl, Date, Error, Response, Uint8Array, atob, crypto: require('node:crypto').webcrypto });
  return module.exports;
}

const id = n => `${String(n).padStart(8, '0')}-1111-4111-8111-111111111111`;
const [a, b, first, inactive, old, c1, c2, oldCourse, item, firstItem, teacher] = Array.from({ length: 11 }, (_, i) => id(i + 1));
const date = '2026-11-02T10:00:00Z';
const sessions = [
  { student_id: a, session_number: 1, teacher_score: '0', teacher_comment: 'Ausencia publicada', updated_at: date, absent: true },
  { student_id: b, session_number: 2, teacher_score: '7.5', teacher_comment: 'Sesión privada de B', updated_at: date, absent: false },
  { student_id: a, session_number: 2, teacher_score: '0', teacher_comment: '', updated_at: date, absent: false },
  { student_id: a, session_number: 3, teacher_score: '8', teacher_comment: '', updated_at: date, absent: false },
];
const tables = {
  courses: [{ id: c1, bachillerato_year: 1, is_active: true }, { id: c2, bachillerato_year: 2, is_active: true }, { id: oldCourse, bachillerato_year: 2, is_active: false }],
  students: [a, b, first, inactive, old].map((value, i) => ({ id: value, profile_id: `profile-${value}`, course_id: i === 2 ? c1 : i === 4 ? oldCourse : c2, active: i !== 3 })),
  profiles: [a, b, first, inactive, old].map(value => ({ id: `profile-${value}`, display_name: value === a ? 'Álvaro Prueba' : `Alumno ${value.slice(0, 8)}`, class_group: value === a ? '2ºA' : '2ºB' })),
  assessment_grade_items: [{ id: item, course_id: c2, sa_code: 'SA1', item_key: 'personal-plan', title: 'Plan personal', position: 1 }, { id: firstItem, course_id: c1, sa_code: 'SA1', item_key: 'personal-plan', title: 'Plan de primero', position: 1 }],
  student_assessment_grades: [{ id: 'grade-a', student_id: a, item_id: item, score: 0, comment: 'Comentario de A', published_at: date }, { id: 'grade-b', student_id: b, item_id: item, score: 6, comment: 'Comentario privado de B', published_at: date }, { id: 'grade-first', student_id: first, item_id: firstItem, score: 10, comment: 'Primero', published_at: date }],
  learning_situations: [{ id: 'second-sa1', course_id: c2, code: 'SA1', title: 'Punto de partida' }, { id: 'second-sa2', course_id: c2, code: 'SA2', title: 'Entrenar con cabeza' }, { id: 'second-sa3', course_id: c2, code: 'SA3', title: 'Hábitos' }, { id: 'first-sa1', course_id: c1, code: 'SA1', title: 'Salud' }],
  training_session_grade_results: sessions,
  training_session_grades: sessions,
  first_year_plan_session_grades: [{ student_id: first, session_number: 8, teacher_score: '8.5', teacher_comment: 'Sesión de primero', updated_at: date, absent: false }],
  physical_tests: [{ id: 'jump', name: 'Salto', active: true, unit: 'cm' }, { id: 'run', name: 'Carrera', active: true, unit: 's' }, { id: 'old-test', name: 'Prueba archivada', active: false, unit: 's' }],
  physical_test_results: [
    { id: 'initial-a', student_id: a, physical_test_id: 'jump', period: 'september', value: 0, updated_at: date },
    { id: 'final-a', student_id: a, physical_test_id: 'jump', period: 'december', value: 125, updated_at: date },
    { id: 'old-a', student_id: a, physical_test_id: 'old-test', period: 'september', value: 7, updated_at: date },
  ],
  questionnaires: [
    { id: 'initial-1', learning_situation_id: 'second-sa1', published: true, assessment_phase: 'initial', title: 'GOES inicial' },
    { id: 'initial-2', learning_situation_id: 'second-sa1', published: true, assessment_phase: 'initial', title: 'BPNES inicial' },
    { id: 'final-1', learning_situation_id: 'second-sa1', published: true, assessment_phase: 'final', title: 'GOES final' },
    { id: 'unpublished', learning_situation_id: 'second-sa1', published: false, assessment_phase: 'final', title: 'Cuestionario oculto' },
  ],
  questionnaire_attempts: [
    { id: 'sent', student_id: a, questionnaire_id: 'initial-1', status: 'submitted', submitted_at: date },
    { id: 'repeat', student_id: a, questionnaire_id: 'initial-1', status: 'submitted', submitted_at: date },
    { id: 'draft-quiz', student_id: a, questionnaire_id: 'initial-2', status: 'in_progress', submitted_at: null },
    { id: 'peer', student_id: b, questionnaire_id: 'final-1', status: 'submitted', submitted_at: date },
  ],
  questionnaire_questions: [{ id: 'question', questionnaire_id: 'initial-1', prompt: 'Pregunta inicial', position: 1 }],
  questionnaire_responses: [{ id: 'answer', attempt_id: 'sent', question_id: 'question', answer: { label: 'Respuesta propia' } }, { id: 'peer-answer', attempt_id: 'peer', question_id: 'question', answer: { label: 'Respuesta privada de B' } }],
  theory_topic_progress: [
    { id: 't1', student_id: a, topic_slug: 'theory-sa1', completed: true, quiz_score: 0, updated_at: date },
    { id: 't2', student_id: a, topic_slug: 'theory-sa2', completed: false, quiz_score: 80, updated_at: date },
    { id: 't3', student_id: a, topic_slug: 'theory-sa3', completed: true, quiz_score: 100, updated_at: date },
  ],
  training_session_logs: [
    { id: 'log-one', student_id: a, course_id: c2, sa_code: 'SA2', session_number: 1, status: 'completed', reflection: 'Sensaciones de prueba', updated_at: date },
    { id: 'log-two', student_id: a, course_id: c2, sa_code: 'SA2', session_number: 2, status: 'draft', updated_at: date },
  ],
  personal_training_plans: [
    { id: 'plan', student_id: a, course_id: c2, sa_code: 'SA1', status: 'active', objective: 'Caminar a ritmo estable', plan_items: [{ activity: 'Caminar', sessionDate: '2026-10-15' }], final_conclusions: 'Conclusión guardada', future_work: '', updated_at: date },
    { id: 'old-plan', student_id: a, course_id: oldCourse, sa_code: 'SA1', status: 'completed', objective: 'Plan privado anterior' },
    { id: 'first-plan', student_id: first, course_id: c1, sa_code: 'SA1', status: 'completed', objective: 'Plan de primero' },
  ],
  physical_final_reflections: [{ id: 'reflection', student_id: a, course_id: c2, course_year: 2, sa_code: 'SA2', status: 'draft', results_analysis: 'Comparación propia', updated_at: date }],
  theory_challenge_topics: [{ slug: 'theory-sa2', course_year: 2, sa_code: 'SA2', title: 'Reto de aplicación', prompt: 'Diseña un ajuste' }],
  theory_challenge_responses: [{ id: 'challenge', student_id: a, topic_slug: 'theory-sa2', answer: 'Propuesta de prueba', updated_at: date }],
  sports: [], technical_tests: [], theoretical_contents: [], procedural_activities: [], procedural_attempts: [],
  session_journals: [], sports_journals: [], technical_test_results: [], content_reads: [],
};
let actor = { id: teacher, role: 'teacher' }, failureTable = '', queries = 0;
const invalidations = [];
const selections = [];
const client = { from(table) {
  queries++;
  assert.ok(Object.hasOwn(tables, table), `Unexpected table: ${table}`);
  const filters = [];
  let single = false, range, write, columns = '*';
  const query = {
    select(fields = '*') { columns = fields; selections.push({table, columns}); return query; },
    eq(key, value) { filters.push(row => row[key] === value); return query; },
    in(key, values) { filters.push(row => values.map(String).includes(String(row[key]))); return query; },
    order() { return query; },
    range(start, end) { range = [start, end]; return query; },
    single() { single = true; return query; },
    maybeSingle() { single = true; return query; },
    upsert(value, options) { write = { value, keys: options.onConflict.split(','), defaultToNull: options.defaultToNull }; return query; },
    then(resolve, reject) {
      if (failureTable === table) return Promise.resolve({ data: null, error: { message: 'Test read/write failure' } }).then(resolve, reject);
      if (write) {
        if (Array.isArray(write.value)) {
          assert.equal(write.defaultToNull, false, 'New grades use the comment column default.');
          assert.ok(write.value.every(row => !Object.hasOwn(row, 'comment')), 'Score-only updates must leave existing comments intact.');
          const allowed = write.value.every(row => {
            const student = tables.students.find(value => value.id === row.student_id);
            const gradeItem = tables.assessment_grade_items.find(value => value.id === row.item_id);
            return student?.active && gradeItem?.course_id === student.course_id && tables.courses.some(course => course.id === student.course_id && course.is_active);
          });
          if (!allowed) return Promise.resolve({ data: null, error: { code: '42501' } }).then(resolve, reject);
          const data = write.value.map(value => {
            const existing = tables[table].find(row => write.keys.every(key => row[key] === value[key]));
            if (existing) { Object.assign(existing, value); return { ...existing }; }
            const added = { id: `new-grade-${tables[table].length}`, comment: '', ...value };
            tables[table].push(added);
            return added;
          });
          return Promise.resolve({ data, error: null }).then(resolve, reject);
        }
        const existing = tables[table].find(row => write.keys.every(key => row[key] === write.value[key]));
        if (existing) Object.assign(existing, write.value);
        else tables[table].push({ id: 'new-grade', ...write.value });
        return Promise.resolve({ data: { ...(existing ?? tables[table].at(-1)) }, error: null }).then(resolve, reject);
      }
      let rows = tables[table].filter(row => filters.every(filter => filter(row))).map(row => columns === '*'
        ? { ...row }
        : Object.fromEntries(columns.split(',').map(key => [key, row[key]])));
      if (range) rows = rows.slice(range[0], range[1] + 1);
      return Promise.resolve({ data: single ? rows[0] ?? null : rows, error: null }).then(resolve, reject);
    },
  };
  return query;
} };
const grades = load('lib/gradebook.ts');
const activity = load('lib/teacher-activity.ts');
const completion = load('lib/teacher-completion.ts', { './teacher-activity': activity });
const calendars = {
  './first-year-personal-plan-calendar': load('lib/first-year-personal-plan-calendar.ts'),
  './second-year-personal-plan-calendar': load('lib/second-year-personal-plan-calendar.ts'),
  './class-groups': load('lib/class-groups.ts'),
};
const grading = load('lib/teacher-session-grading.ts', calendars);
const summaries = load('lib/teacher-assessment-summary.ts', { './gradebook': grades, './teacher-session-grading': grading });
const imports = {
  'server-only': {},
  'next/cache': { revalidatePath: path => invalidations.push(path) },
  '@/lib/gradebook': grades,
  '@/lib/auth/guards': { requireRole: async role => { if (actor.role !== role) throw new Error('FORBIDDEN'); return actor; } },
  '@/lib/supabase/server': { createClient: async () => client },
  '@/lib/teacher-completion': completion,
  '@/lib/teacher-assessment-summary': summaries,
  '@/lib/second-year-work': load('lib/second-year-work.ts', { './teacher-activity': activity, './teacher-completion': completion, './teacher-assessment-summary': summaries }),
};
imports['@/lib/teacher-activity-server'] = load('lib/teacher-activity-server.ts', {
  ...imports,
  '@/lib/class-groups': calendars['./class-groups'],
  '@/lib/first-year-personal-plan-calendar': calendars['./first-year-personal-plan-calendar'],
  '@/lib/second-year-personal-plan-calendar': calendars['./second-year-personal-plan-calendar'],
  '@/lib/training-theory-topics': { trainingTheoryTopics: [] },
  '@/lib/training-theory-flexibility': { flexibilityTheoryTopic: {} },
  '@/lib/second-year-theory-topics': { secondYearTheoryTopics: [1, 2, 3].map(i => ({ slug: `theory-sa${i}`, sa: `SA${i}`, title: `Teoría SA${i}` })) },
});
const loaders = load('lib/gradebook-server.ts', imports);
const actions = load('app/profesor/calificaciones/actions.ts', imports);
const sessionActions = load('app/profesor/actions.ts', imports);
const links = { 'next/link': { __esModule: true, default: ({ href, children, prefetch: _prefetch, ...props }) => React.createElement('a', { href, ...props }, children) } };

(async () => {
  const overview = await loaders.loadSecondYearGradesOverview();
  assert.deepEqual(Array.from(overview.students, student => student.id).sort(), [a, b].sort(), 'Only active pupils in active second-year courses are included.');
  assert.equal(overview.grades.length, 2);
  assert.equal(overview.sessionGrades.length, 4);
  assert.deepEqual(JSON.parse(JSON.stringify(overview.work[a].physical)), { initial: { done: 1, total: 2 }, final: { done: 1, total: 2 } });
  assert.deepEqual(JSON.parse(JSON.stringify(overview.work[a].questionnaires)), { initial: { done: 1, total: 2 }, final: { done: 0, total: 1 } });
  assert.equal(overview.work[b].questionnaires.final.done, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(overview.work[a].quizzes)), { done: 2, total: 2, mean: 4 });
  assert.equal(overview.work[b].quizzes.mean, null);
  assert.equal(overview.work[a].readings.done, 1);
  assert.equal(overview.work[a].readings.total, 2);
  assert.equal(overview.work[a].sessions.mean, 4);
  assert.equal(overview.work[a].sessions.graded, 2);
  assert.equal(overview.work[a].sessions.points, 1);
  assert.equal(overview.work[a].sessions.absences, 1);
  assert.equal(overview.work[a].plan, 'active');
  assert.equal(overview.work[a].conclusions, 'in_progress');
  assert.equal(overview.work[a].finalReflection, 'in_progress');
  assert.ok(!selections.some(query => query.table === 'questionnaire_responses'));
  assert.ok(!JSON.stringify(overview).includes('privad'));
  const work = await loaders.loadSecondYearStudentWork(a);
  const workText = JSON.stringify(work);
  for (const value of ['Respuesta propia', 'Conclusión guardada', 'Sensaciones de prueba', 'Comparación propia', 'Propuesta de prueba', 'Prueba archivada']) assert.ok(workText.includes(value), value);
  for (const value of ['Respuesta privada', 'Plan privado anterior', 'Teoría SA3', 'Plan de primero']) assert.ok(!workText.includes(value), value);
  assert.ok(work.situations.every(sa => sa.code === 'SA1' || sa.code === 'SA2'));
  for (const rejected of [first, inactive, old, 'invalid-id', id(100)]) assert.equal(await loaders.loadSecondYearStudentWork(rejected), null);
  const planPdf = load('lib/personal-plan-pdf.ts');
  const planPdfData = load('lib/saved-plan-pdf.ts', { ...calendars, './personal-plan-tasks': load('lib/personal-plan-tasks.ts') });
  const pdfRoute = load('app/profesor/2bach/notas/[id]/plan.pdf/route.ts', { '@/lib/gradebook-server': loaders, '@/lib/personal-plan-pdf': planPdf, '@/lib/saved-plan-pdf': planPdfData });
  const pdfFor = value => pdfRoute.GET(undefined, {params: Promise.resolve({ id: value })});
  const response = await pdfFor(a);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Content-Type'), 'application/pdf');
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
  assert.match(response.headers.get('Content-Disposition'), /^inline/);
  const pdf = Buffer.from(await response.arrayBuffer()).toString('latin1');
  assert.match(pdf, /^%PDF/);
  assert.ok(pdf.includes(Buffer.from('Caminar a ritmo estable').toString('hex')));
  const savedPlan = await loaders.loadSecondYearSavedPlan(a);
  assert.ok(planPdfData.savedPlanPdfData(savedPlan.plan, savedPlan.student, 2).sections[2].lines.some(line => line.includes('Sesión 3 - 15 de octubre - Caminar')));
  for (const rejected of [b, first, inactive, old, 'invalid-id']) assert.equal((await pdfFor(rejected)).status, 404);
  const detail = await loaders.loadSecondYearStudentGradebook(a);
  assert.equal(detail.student.name, 'Álvaro Prueba');
  assert.equal(detail.gradebook.grades.length, 1);
  assert.equal(detail.gradebook.grades[0].score, 0);
  assert.equal(detail.gradebook.sessionGrades[0].absent, true);
  assert.ok(!JSON.stringify(detail).includes('privad'), 'The detail payload must not contain a peer’s marks or comments.');
  for (const rejected of [first, inactive, old, 'invalid-id', id(100)]) assert.equal(await loaders.loadSecondYearStudentGradebook(rejected), null);

  actor = { id: `profile-${a}`, role: 'student' };
  const own = await loaders.loadStudentGradebook();
  assert.equal(JSON.stringify(own), JSON.stringify(detail.gradebook), 'Teacher and pupil must load the same grade and session sources.');
  const beforeDenied = queries;
  await assert.rejects(() => loaders.loadSecondYearGradesOverview(), /FORBIDDEN/);
  await assert.rejects(() => loaders.loadSecondYearStudentGradebook(a), /FORBIDDEN/);
  await assert.rejects(() => loaders.loadSecondYearStudentWork(a), /FORBIDDEN/);
  await assert.rejects(() => pdfFor(a), /FORBIDDEN/);
  await assert.rejects(() => actions.publishAssessmentGrade({ studentId: a, itemId: item, score: 8.5, comment: '' }), /FORBIDDEN/);
  await assert.rejects(() => actions.publishAssessmentScores([{ studentId: a, itemId: item, score: 8.5 }]), /FORBIDDEN/);
  assert.equal(queries, beforeDenied, 'Role checks precede database access.');

  actor = { id: `profile-${first}`, role: 'student' };
  const firstYear = await loaders.loadStudentGradebook();
  assert.equal(firstYear.year, 1);
  assert.equal(firstYear.items[0].title, 'Plan de primero');
  assert.equal(firstYear.sessionGrades[0].number, 8);
  assert.equal(firstYear.sessionGrades[0].comment, 'Sesión de primero');

  actor = { id: teacher, role: 'teacher' };
  const peerSnapshot = JSON.stringify(tables.student_assessment_grades[1]);
  const saved = await actions.publishAssessmentGrade({ studentId: a, itemId: item, score: 8.5, comment: '  Nota corregida  ' });
  assert.equal(saved.id, 'grade-a');
  assert.equal(saved.score, 8.5);
  assert.equal(saved.comment, 'Nota corregida');
  assert.equal(tables.student_assessment_grades.length, 3, 'Editing updates the existing publication instead of adding another mark.');
  assert.equal(JSON.stringify(tables.student_assessment_grades[1]), peerSnapshot);
  assert.ok(invalidations.includes('/profesor/2bach/notas'));
  assert.ok(invalidations.includes(`/profesor/2bach/notas/${a}`));
  assert.ok(invalidations.includes('/alumno/calificaciones'));
  await assert.rejects(() => actions.publishAssessmentGrade({ studentId: first, itemId: item, score: 8, comment: '' }));
  const session = await sessionActions.saveSecondYearSessionEvaluation({ studentId: a, sessionNumber: 1, score: 9.5, comment: 'Sesión corregida', absent: false });
  assert.equal(session.score, 9.5);
  assert.equal(session.absent, false);
  assert.equal(sessions.length, 4);
  assert.equal(sessions[1].teacher_comment, 'Sesión privada de B');
  failureTable = 'student_assessment_grades';
  await assert.rejects(() => actions.publishAssessmentGrade({ studentId: a, itemId: item, score: 2, comment: '' }));
  assert.equal(tables.student_assessment_grades[0].score, 8.5, 'A failed save must not report or display a replacement grade.');
  failureTable = 'training_session_grade_results';
  await assert.rejects(() => loaders.loadSecondYearStudentGradebook(a));
  failureTable = '';
  actor = { id: `profile-${a}`, role: 'student' };
  const updated = await loaders.loadStudentGradebook();
  assert.equal(updated.grades[0].score, 8.5);
  assert.equal(updated.sessionGrades[0].score, 9.5);
  assert.equal(updated.sessionGrades[0].absent, false);

  const view = load('components/gradebook-view.tsx', { ...imports, ...links });
  const teacherUi = load('components/teacher-student-grades.tsx', { ...links, '@/components/gradebook-view': view, '@/components/teacher-gradebook': { GradePublicationForm: () => null }, '@/components/teacher-session-grading': { TeacherSessionEvaluationForm: () => null } });
  const html = renderToStaticMarkup(React.createElement(teacherUi.TeacherStudentGrades, { student: detail.student, data: updated }));
  assert.ok(html.includes('Mis calificaciones') && html.includes('Nota corregida') && html.includes('Sesión corregida'));
  assert.ok(html.includes('8,5') && html.includes('9,5/10'));
  assert.ok(html.includes('Modificar nota de Plan personal') && html.includes('Modificar nota de la sesión 1'));
  assert.ok(!html.includes('href="/alumno/'), 'Teacher preview must keep navigation within teacher routes.');
  assert.ok(!html.includes('privad'));
  const overviewUi = load('components/teacher-grades-overview.tsx', { ...links, '@/lib/gradebook': grades });
  const list = renderToStaticMarkup(React.createElement(overviewUi.TeacherGradesOverview, { data: overview }));
  assert.ok(list.includes('Notas de todos') && list.includes('0/10') && list.includes('AUSENCIA'));
  assert.ok(list.includes(`/profesor/2bach/notas/${a}`));
  assert.ok(list.includes(`/profesor/2bach/notas/${a}/plan.pdf`) && !list.includes(`/profesor/2bach/notas/${b}/plan.pdf`));
  assert.ok(list.includes('Valoradas por el profesor') && list.includes('Valoradas por el alumno') && list.includes('Conclusiones del plan'));
  assert.ok(!list.includes('Plan de primero'));
  const activityDetail = load('components/teacher-activity-detail.tsx');
  const checklistUi = load('components/teacher-student-checklist.tsx', { ...links, '@/lib/teacher-activity': activity, '@/lib/teacher-completion': completion });
  const workUi = load('components/teacher-student-work.tsx', {
    ...links, '@/lib/gradebook': grades, '@/components/teacher-activity-detail': activityDetail, '@/components/teacher-student-checklist': checklistUi,
    '@/components/teacher-assessment-summary': { TeacherSessionScoreSummary: () => null },
  });
  const workHtml = renderToStaticMarkup(React.createElement(workUi.TeacherStudentWork, work));
  for (const value of ['Entregas de SA1 y SA2', 'Respuesta propia', 'Conclusión guardada', 'Propuesta de prueba', 'Pendiente', '/plan.pdf']) assert.ok(workHtml.includes(value), value);
  assert.ok(!workHtml.includes('Respuesta privada de B'));
  console.log('SA1/SA2 work: distinct submitted instruments, readings, both means, drafts, legacy records, private PDF and linked evidence passed.');

  // Exercise the real UI handlers with deterministic hook state, as in the existing refresh checks.
  let state = [], cursor = 0;
  const hooks = {
    react: { useState(initial) { const index = cursor++; if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial; return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }]; } },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }), Fragment: 'fragment' },
    'next/link': { __esModule: true, default: 'a' },
  };
  const nodes = node => Array.isArray(node) ? node.flatMap(nodes) : node && typeof node === 'object' ? [node, ...nodes(node.props?.children)] : [];
  const filterUi = load('components/teacher-grades-overview.tsx', { ...hooks, '@/lib/gradebook': grades });
  const filterRender = () => { cursor = 0; return nodes(filterUi.TeacherGradesOverview({ data: overview })); };
  let tree = filterRender();
  tree.find(node => node.type === 'input').props.onChange({ target: { value: 'alvaro' } });
  tree = filterRender();
  assert.equal(tree.filter(node => node.type === 'th' && node.props.scope === 'row').length, 1, 'Name search must ignore accents.');
  assert.ok(tree.some(node => node.type === 'a' && node.props.href === `/profesor/2bach/notas/${a}`));
  tree.find(node => node.type === 'select').props.onChange({ target: { value: '2ºB' } });
  assert.ok(filterRender().some(node => node.props?.children === 'No hay alumnos que coincidan con los filtros.'));
  filterRender().find(node => node.type === 'input').props.onChange({ target: { value: '' } });
  assert.ok(filterRender().some(node => node.type === 'a' && node.props.href === `/profesor/2bach/notas/${b}`));

  state = [];
  const editUi = load('components/teacher-student-grades.tsx', { ...hooks, '@/components/gradebook-view': { GradebookView: 'shared-view' }, '@/components/teacher-gradebook': { GradePublicationForm: 'grade-form' }, '@/components/teacher-session-grading': { TeacherSessionEvaluationForm: 'session-form' } });
  const editRender = () => { cursor = 0; return nodes(editUi.TeacherStudentGrades({ student: detail.student, data: updated })); };
  const shared = () => editRender().find(node => node.type === 'shared-view').props;
  const entry = { item: updated.items[0], grade: updated.grades[0] };
  nodes(shared().assessmentActions(entry)).find(node => node.type === 'button').props.onClick();
  let form = nodes(shared().assessmentActions(entry)).find(node => node.type === 'grade-form');
  assert.equal(form.props.grade.score, 8.5, 'Editing starts with the published grade.');
  form.props.onCancel();
  assert.equal(shared().data.grades[0].score, 8.5, 'Cancelling does not alter the publication.');
  nodes(shared().assessmentActions(entry)).find(node => node.type === 'button').props.onClick();
  form = nodes(shared().assessmentActions(entry)).find(node => node.type === 'grade-form');
  form.props.onPublished({ ...entry.grade, score: 6.5, comment: 'Corrección confirmada' });
  assert.equal(shared().data.grades[0].score, 6.5);
  assert.equal(shared().data.grades[0].comment, 'Corrección confirmada');
  const pupilSession = updated.sessionGrades[0];
  nodes(shared().sessionActions(pupilSession)).find(node => node.type === 'button').props.onClick();
  const sessionForm = nodes(shared().sessionActions(pupilSession)).find(node => node.type === 'session-form');
  sessionForm.props.onSaved({ score: 0, absent: true, comment: 'Ausencia corregida', updatedAt: date });
  assert.equal(shared().data.sessionGrades[0].score, 0);
  assert.equal(shared().data.sessionGrades[0].absent, true);

  let gradingData = {
    ...overview,
    situations: [{ courseId: c2, code: 'SA1', title: 'Inicio' }, { courseId: c2, code: 'SA2', title: 'Seguimiento' }],
    items: [{ ...overview.items[0], sa_code: 'SA2' }],
  };
  const gradebookPage = load('app/profesor/calificaciones/page.tsx', {
    '@/components/teacher-gradebook': { TeacherGradebook: 'teacher-gradebook' },
    '@/lib/gradebook-server': { loadTeacherGradebook: async () => gradingData },
  }).default;
  const sessionPage = load('app/profesor/calificar-sesiones/page.tsx', {
    ...links, '@/components/teacher-session-grading': { TeacherSessionGrading: 'session-grading' },
    '@/lib/teacher-activity-server': { loadTeacherActivity: async () => ({ ...gradingData, activities: [] }) },
    '@/lib/teacher-session-grading': grading,
  }).default;
  const renderPage = (page, params) => page({ searchParams: Promise.resolve(params) });
  const gradebookKey = (await renderPage(gradebookPage, { curso: '2', alumno: a })).props.children.key;
  const sessionsKey = (await renderPage(sessionPage, { curso: '2', alumno: a })).props.children.at(-1).key;
  gradingData = { ...gradingData, loadedAt: '2026-11-02T10:01:00Z' };
  assert.equal((await renderPage(gradebookPage, { curso: '2', alumno: a })).props.children.key, gradebookKey, 'Publishing must preserve the grading component and its current selection.');
  assert.notEqual((await renderPage(gradebookPage, { curso: '2', alumno: b })).props.children.key, gradebookKey, 'Opening a new grading link must select the pupil requested in the URL.');
  assert.equal((await renderPage(sessionPage, { curso: '2', alumno: b })).props.children.at(-1).key, sessionsKey, 'Session revalidation must retain the instance even after the pupil changes the URL.');
  assert.notEqual((await renderPage(sessionPage, { curso: '1' })).props.children.at(-1).key, sessionsKey);

  state = [];
  let refreshes = 0;
  const gradingUi = load('components/teacher-gradebook.tsx', {
    ...hooks, '@/lib/gradebook': grades, '@/lib/teacher-session-grading': grading, '@/app/profesor/calificaciones/actions': actions,
    '@/components/teacher-grade-grid': { TeacherGradeGrid: 'teacher-grade-grid' },
    'next/navigation': { useRouter: () => ({ refresh: () => refreshes++ }) },
  });
  const renderGrading = () => { cursor = 0; return nodes(gradingUi.TeacherGradebook({ data: gradingData, year: 2, initialStudentId: a })); };
  const gradingSelects = () => renderGrading().filter(node => node.type === 'select');
  gradingSelects()[1].props.onChange({ target: { value: '2ºB' } });
  gradingSelects()[2].props.onChange({ target: { value: b } });
  gradingSelects()[3].props.onChange({ target: { value: 'SA2' } });
  const publication = () => renderGrading().find(node => typeof node.props?.onPublished === 'function');
  const savedMark = { ...gradingData.grades.find(grade => grade.student_id === b), score: 9, published_at: '2026-11-02T10:02:00Z' };
  assert.equal(publication().props.studentId, b);
  publication().props.onPublished(savedMark);
  assert.equal(publication().props.grade.score, 9);
  gradingData = { ...gradingData, grades: [...gradingData.grades.filter(grade => grade.student_id !== b), { ...savedMark, score: 9.5, published_at: '2026-11-02T10:03:00Z' }] };
  assert.deepEqual(gradingSelects().slice(1).map(node => node.props.value), ['2ºB', b, 'SA2']);
  assert.equal(publication().props.grade.score, 9.5, 'A newer grade must be shown after refreshing the server data.');
  renderGrading().find(node => node.type === 'button' && node.props.children === 'Actualizar calificaciones').props.onClick();
  assert.equal(refreshes, 1, 'Manual refresh must update data in the current view.');
  renderGrading().find(node => node.type === 'button' && node.props.children === 'Cuaderno de notas').props.onClick();
  const grid = renderGrading().find(node => node.type === 'teacher-grade-grid').props;
  assert.deepEqual(Array.from(grid.students, student => student.id), [b], 'The table shares the group filter.');
  assert.equal(grid.situation, '', 'The table initially includes all situations.');
  assert.equal(grid.grades.get(grades.assessmentGradeKey(b, item)).score, 9.5);
  assert.equal((await renderPage(gradebookPage, { curso: '1', vista: 'cuaderno' })).props.children.props.initialGrid, true);
  console.log('Grading revalidation: stable pupil and session views, direct links, preserved filters and fresh publications passed.');

  actor = { id: teacher, role: 'teacher' };
  const extraItem = id(19);
  tables.assessment_grade_items.push({ id: extraItem, course_id: c2, sa_code: 'SA2', item_key: 'test-grid', title: 'Rúbrica de prueba', position: 2 });
  const publishedGrid = await actions.publishAssessmentScores([
    { studentId: a, itemId: item, score: 0 }, { studentId: b, itemId: extraItem, score: 8.5 },
  ]);
  assert.equal(publishedGrid.error, null);
  assert.equal(publishedGrid.grades.length, 2);
  assert.equal(publishedGrid.grades.find(grade => grade.student_id === a).comment, 'Nota corregida');
  assert.equal(publishedGrid.grades.find(grade => grade.student_id === a).score, 0);
  assert.equal(publishedGrid.grades.find(grade => grade.student_id === b).comment, '');
  const beforeBulkFailure = JSON.stringify(tables.student_assessment_grades);
  const mixed = await actions.publishAssessmentScores([
    { studentId: a, itemId: item, score: 10 }, { studentId: first, itemId: item, score: 7 },
  ]);
  assert.match(mixed.error, /curso activo/);
  assert.equal(mixed.grades.length, 0);
  assert.equal(JSON.stringify(tables.student_assessment_grades), beforeBulkFailure, 'A rejected batch cannot update its other marks.');
  const beforeBadInput = queries;
  assert.match((await actions.publishAssessmentScores([{ studentId: a, itemId: item, score: 8.55 }])).error, /una décima/);
  assert.match((await actions.publishAssessmentScores([{ studentId: a, itemId: item, score: 0 }, { studentId: a, itemId: item, score: 1 }])).error, /misma casilla/);
  assert.equal(queries, beforeBadInput, 'Invalid and duplicate changes must be rejected before database access.');
  console.log('Grade grid: scoped rows, all situations, atomic batch validation, decimals and published comments passed.');
  assert.ok(!editRender().some(node => node.type === 'session-form'), 'A confirmed update closes its editor.');
  console.log('Second-year grades: role/course isolation, shared pupil view, existing-mark and session corrections, peer preservation, cache invalidation and read/write failures passed.');
  console.log('Teacher UI handlers: group/accent-insensitive name filters, published values, cancellation and confirmed instrument/session updates passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });

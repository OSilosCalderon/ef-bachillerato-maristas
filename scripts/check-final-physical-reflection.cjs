const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, imports = {}) {
  const module = { exports: {} };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText,
    { module, exports: module.exports, require: name => Object.hasOwn(imports, name) ? imports[name] : require(name), Error, Date, Intl, URL, Request, Response, console });
  return module.exports;
}
const pure = load('lib/final-physical-reflection.ts');
const complete = { results_analysis: 'Cooper: de 1800 a 1950 m.', goal_review: 'Me acerco a mi objetivo.', personal_learning: 'He aprendido a regular el esfuerzo.', future_motivation: 'Seguiré corriendo con mis amigos.', status: 'submitted' };
assert.throws(() => pure.validateReflection({ ...pure.emptyReflection }), /Escribe/);
assert.throws(() => pure.validateReflection({ ...complete, future_motivation: '  ' }), /cuatro apartados/);
assert.throws(() => pure.validateReflection({ ...complete, results_analysis: 'x'.repeat(3001) }), /3000/);
assert.equal(pure.validateReflection({ ...pure.emptyReflection, results_analysis: ' Primer dato ' }).results_analysis, 'Primer dato');
assert.equal(pure.validateReflection({ ...complete, student_id: 'peer' }).student_id, undefined);

let year = 1, role = 'student', active = true, published = true, failWrite = false, writes = 0;
let storage = null;
const client = { from(table) {
  let filters = [], payload;
  const q = { select() { return q; }, eq(key, value) { filters.push(row => row[key] === value); return q; },
    upsert(value, options) { assert.equal(table, 'physical_final_reflections'); assert.equal(options.onConflict, 'student_id'); payload = value; return q; },
    single() { return result(); }, maybeSingle() { return result(); } };
  async function result() {
    if (payload) {
      if (failWrite) return { data: null, error: { code: 'fixture-denied' } };
      writes++; storage = { ...payload, updated_at: new Date().toISOString(), submitted_at: payload.status === 'submitted' ? new Date().toISOString() : null };
      return { data: storage, error: null };
    }
    const rows = table === 'students' ? [{ id: 'own', profile_id: 'own-profile', course_id: 'c' + year, active }]
      : table === 'courses' ? [{ id: 'c' + year, bachillerato_year: year, is_active: true }]
      : table === 'learning_situations' ? [{ id: 'sa', course_id: 'c' + year, code: year === 1 ? 'SA1' : 'SA2', published }]
      : storage ? [storage] : [];
    return { data: rows.filter(row => filters.every(fn => fn(row)))[0] ?? null, error: null };
  }
  return q;
} };
const invalidations = [];
const server = load('lib/final-physical-reflection-server.ts', {
  react: { cache: fn => fn },
  'server-only': {}, 'next/cache': { revalidatePath: path => invalidations.push(path) },
  '@/lib/auth/guards': { requireRole: async expected => { if (role !== expected) throw Object.assign(new Error('Denied'), { digest: 'NEXT_REDIRECT;replace;/auth/login' }); return { id: 'own-profile' }; } },
  '@/lib/supabase/server': { createClient: async () => client }, '@/lib/final-physical-reflection': pure,
});
const route = load('app/api/reflexion-fisica-final/route.ts', {
  '@/lib/final-physical-reflection-server': server, '@/lib/final-physical-reflection': pure,
  'next/server': { NextResponse: { json: (body, options = {}) => new Response(JSON.stringify(body), { ...options, headers: { 'content-type': 'application/json', ...options.headers } }) } },
});
const post = (body, origin = 'https://school.example') => route.POST(new Request('https://school.example/api/reflexion-fisica-final', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body) }));
(async () => {
  assert.equal((await post(complete, 'https://foreign.example')).status, 403); assert.equal(writes, 0);
  assert.equal((await post({ ...complete, future_motivation: '' })).status, 400); assert.equal(writes, 0);
  for (const deniedRole of ['teacher', 'anonymous']) { role = deniedRole; assert.equal((await post(complete)).status, 401); }
  role = 'student'; active = false; assert.equal((await post(complete)).status, 400); active = true;
  published = false; assert.equal((await post(complete)).status, 400); published = true; assert.equal(writes, 0);
  const draft = { ...pure.emptyReflection, results_analysis: 'Primer análisis', student_id: 'other-pupil', course_id: 'foreign', course_year: 2, sa_code: 'SA2' };
  assert.equal((await post(draft)).status, 200);
  assert.equal(storage.student_id, 'own'); assert.equal(storage.course_id, 'c1'); assert.equal(storage.course_year, 1); assert.equal(storage.sa_code, 'SA1'); assert.equal(storage.status, 'draft');
  assert.equal((await server.loadFinalPhysicalReflection(1)).results_analysis, 'Primer análisis');
  await assert.rejects(() => server.loadFinalPhysicalReflection(2), /no corresponde/);
  assert.equal((await post(complete)).status, 200); assert.equal(storage.status, 'submitted'); assert.ok(storage.submitted_at);
  failWrite = true; const before = JSON.stringify(storage); assert.equal((await post({ ...complete, goal_review: 'Cambio' })).status, 400); assert.equal(JSON.stringify(storage), before); failWrite = false;
  year = 2; assert.equal(await server.loadFinalPhysicalReflection(2), null, 'Do not reuse a response from another course.');
  assert.equal((await post(complete)).status, 200); assert.equal(storage.course_year, 2); assert.equal(storage.sa_code, 'SA2');
  assert.ok(invalidations.includes('/profesor')); assert.ok(invalidations.includes('/alumno/sa1/progreso')); assert.ok(invalidations.includes('/alumno/2bach/sa2/seguimiento'));
  const activity = load('lib/teacher-activity.ts');
  const completion = load('lib/teacher-completion.ts', { './teacher-activity': activity });
  const gradebook = load('lib/gradebook.ts');
  const summary = load('lib/teacher-assessment-summary.ts', { './gradebook': gradebook, './teacher-session-grading': { isPlanSessionLog: () => false, teacherSessionScore: n => n } });
  for (const courseYear of [1, 2]) {
    const sa = courseYear === 1 ? 'SA1' : 'SA2';
    const item = { id: 'item', course_id: 'course', sa_code: sa, item_key: 'final-physical-reflection', title: 'Reflexión personal y motivaciones de futuro', position: 90 };
    const data = { students: [{ id: 'own', courseId: 'course' }], activities: [], expectedInstruments: [{ key: 'reflection', category: 'reflections', sa, title: item.title, matchAll: true }], assessmentItems: [item], assessmentGrades: [] };
    assert.equal(completion.studentCompletion(data, 'own')[0].state, 'pending');
    const row = { id: 'response', studentId: 'own', category: 'reflections', sa, title: item.title, details: complete, date: '2026-10-28', status: 'draft', score: null };
    data.activities.push(row); assert.equal(completion.studentCompletion(data, 'own')[0].state, 'in_progress');
    row.status = 'submitted'; assert.equal(completion.studentCompletion(data, 'own')[0].state, 'completed');
    row.studentId = 'peer'; assert.equal(completion.studentCompletion(data, 'own')[0].state, 'pending'); row.studentId = 'own';
    const blocks = summary.studentBlockScores(data, 'own', courseYear); assert.equal(blocks[0].worked, true); assert.equal(blocks[0].grade, null);
    data.assessmentGrades.push({ id: 'grade', student_id: 'own', item_id: 'item', score: 0, comment: 'Comentario docente', published_at: '2026-10-28' });
    assert.equal(summary.studentBlockScores(data, 'own', courseYear)[0].grade.score, 0);
  }
  const sql = fs.readFileSync('supabase/migrations/20261028090640_final_physical_reflections.sql', 'utf8');
  assert.ok(!/\b(delete\s+from|drop\s|truncate\s)/i.test(sql));
  assert.match(sql, /enable row level security/); assert.match(sql, /current_student_id/); assert.match(sql, /is_teacher/); assert.match(sql, /on conflict .* do nothing/);
  console.log('Final reflection: private own-course persistence, draft/reload/submit, role and visibility checks, write failure preservation, teacher completion, manual grades and additive migration passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });

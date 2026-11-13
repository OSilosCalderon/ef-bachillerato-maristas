const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const studentId = '11111111-1111-4111-8111-111111111111';
const teacherId = '22222222-2222-4222-8222-222222222222';
function load(path, imports) {
  const module = {exports:{}};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText, {
    module,exports:module.exports,require: name => {
      if (Object.hasOwn(imports,name)) return imports[name];
      if (name.startsWith('.')) return load(require('node:path').join(require('node:path').dirname(path),name+'.ts'),imports);
      if (name==='react' || name==='react/jsx-runtime') return require(name);
      throw new Error(`Unexpected import ${name}`);
    },
  });
  return module.exports;
}
const calendar = load('lib/second-year-personal-plan-calendar.ts',{});
const helpers = load('lib/teacher-session-grading.ts',{'./second-year-personal-plan-calendar':calendar});
let year=2, allowed=true, writes=[];
const supabase = {from(table) {
  assert.ok(['students','courses','training_session_grades','first_year_plan_session_grades'].includes(table),'Grading must never create or alter student logs.');
  let payload;
  const query = {
    select(){return query;},eq(){return query;},
    maybeSingle:async()=>({data:table==='students'?{id:studentId,course_id:'course'}:{bachillerato_year:year},error:null}),
    upsert(value, options){assert.equal(table,year===1?'first_year_plan_session_grades':'training_session_grades');assert.equal(options.onConflict,'student_id,session_number');payload=value;return query;},
    single:async()=>{writes.push(payload);return {data:payload,error:null};},
  };
  return query;
}};
const actions = load('app/profesor/actions.ts',{
  'next/cache':{revalidatePath(){}},
  '@/lib/teacher-activity-server':{},
  '@/lib/auth/guards':{requireRole:async role=>{assert.equal(role,'teacher');if(!allowed)throw new Error('Teacher required');return {id:teacherId};}},
  '@/lib/supabase/server':{createClient:async()=>supabase},
});
const ui=load('components/teacher-session-grading.tsx',{
  'next/link':{__esModule:true,default:'a'},
  '@/app/profesor/actions':actions,
  '@/lib/teacher-session-grading':helpers,
  '@/lib/class-groups':load('lib/class-groups.ts',{}),
  '@/components/teacher-session-grade-grid':{TeacherSessionGradeGrid:()=>null},
});
const gradebook = load('lib/gradebook.ts', {});
const gradeGrid = load('components/grade-grid.tsx', { '@/lib/gradebook': gradebook, '@/lib/teacher-session-grading': helpers });
const sessionGrid = load('components/teacher-session-grade-grid.tsx', {
  '@/app/profesor/calificar-sesiones/actions': {}, '@/components/grade-grid': gradeGrid,
  '@/lib/class-groups': load('lib/class-groups.ts', {}), '@/lib/teacher-session-grading': helpers,
});
const data={students:[{id:studentId,name:'Alumno de prueba',group:'2º'}],activities:[],sessionEvaluations:[{studentId,number:3,score:0,absent:true,comment:'Seguimiento pendiente',updatedAt:'2026-10-19'}]};
const html=renderToStaticMarkup(React.createElement(ui.TeacherSessionGrading,{data}));
assert.equal((html.match(/aria-label="Calificar sesión \d+"/g)||[]).length,10,'All ten empty slots must have a grade form.');
assert.ok(html.includes('0/10 sesiones registradas'));
assert.ok(html.includes('1/10 calificadas'));
assert.ok(html.includes('9 pendientes de calificar'));
assert.ok(html.includes('Seguimiento pendiente'));
assert.ok(html.includes('1 ausencias registradas'));
assert.equal((html.match(/type="checkbox"[^>]*checked=""/g)||[]).length,1,'Only the absent session starts checked.');
assert.ok(html.includes('>AUSENCIA</span>'),'Published absence must be visible next to the grade.');
assert.ok(html.includes('Calificada · 0/10'));
const gridHtml = renderToStaticMarkup(React.createElement(sessionGrid.TeacherSessionGradeGrid, {
  students: data.students, logs: [], evaluations: data.sessionEvaluations, courseYear: 2, group: '', drafts: {},
}));
assert.equal((gridHtml.match(/type="text"/g) || []).length, 10);
assert.match(gridHtml, /aria-label="Alumno de prueba · Sesión 3 · Ausencia"[^>]+value="0"/);
assert.match(gridHtml, /aria-label="Alumno de prueba · Sesión 10 · Sin seguimiento registrado"/);
const firstYearGrid = (group) => renderToStaticMarkup(React.createElement(sessionGrid.TeacherSessionGradeGrid, {
  students: [{ ...data.students[0], group }], logs: [], evaluations: [], courseYear: 1, group, drafts: {},
}));
assert.equal((firstYearGrid('1ºA').match(/type="text"/g) || []).length, 8);
assert.match(firstYearGrid('1ºA'), /29 oct/);
assert.match(firstYearGrid('1ºB'), /30 oct/);
console.log('Teacher UI: all ten unregistered sessions are editable; zero grades and honest delivery counts render.');
(async()=>{
  const input={studentId,sessionNumber:3,score:0,absent:true,comment:'  Seguimiento pendiente  '};
  const saved=await actions.saveSecondYearSessionEvaluation(input);
  assert.equal(saved.score,0);assert.equal(saved.absent,true);assert.equal(saved.comment,'Seguimiento pendiente');
  assert.equal(writes[0].absent,true);assert.equal(writes[0].teacher_id,teacherId);assert.equal(writes[0].session_number,3);
  assert.ok(!Object.hasOwn(writes[0],'session_log_id'));
  await actions.saveSecondYearSessionEvaluation({...input,score:8.5,absent:false});
  assert.equal(writes[1].absent,false,'The teacher can correct an absence without changing the student log.');assert.equal(writes[1].score,undefined);assert.equal(writes[1].teacher_score,8.5);
  const count=writes.length;
  for(const absent of ['true',1,null,{}]) await assert.rejects(()=>actions.saveSecondYearSessionEvaluation({...input,absent}));
  for(const sessionNumber of [0,11,1.5]) await assert.rejects(()=>actions.saveSecondYearSessionEvaluation({...input,sessionNumber}));
  for(const score of [-1,11,8.55,NaN]) await assert.rejects(()=>actions.saveSecondYearSessionEvaluation({...input,score}));
  await assert.rejects(()=>actions.saveSecondYearSessionEvaluation({...input,comment:'a'.repeat(501)}));
  year=1;await assert.rejects(()=>actions.saveSecondYearSessionEvaluation(input));year=2;
  allowed=false;await assert.rejects(()=>actions.saveSecondYearSessionEvaluation(input));
  assert.equal(writes.length,count,'Rejected requests must not write data.');
  allowed=true;year=1;
  const first=await actions.saveFirstYearSessionEvaluation({...input,sessionNumber:8,score:8.5});
  assert.equal(first.score,8.5);assert.equal(first.absent,true);
  const firstCount=writes.length;
  for(const sessionNumber of [0,9,10]) await assert.rejects(()=>actions.saveFirstYearSessionEvaluation({...input,sessionNumber}));
  year=2;await assert.rejects(()=>actions.saveFirstYearSessionEvaluation(input));
  assert.equal(writes.length,firstCount,'Wrong course or session must not write first-year grades.');
  console.log('Teacher action: no student log dependency, zero and decimal grades, comments, scope checks and role protection passed.');
  await checkBulkPublication();
})().catch(error=>{console.error(error);process.exitCode=1;});

async function checkBulkPublication() {
  const id = index => `${String(index).padStart(8, '0')}-1111-4111-8111-111111111111`;
  const first = id(1), second = id(2), legacyOnly = id(3);
  const legacy = [{ student_id: legacyOnly, session_number: 4, teacher_score: 8, teacher_comment: 'Comentario anterior', absent: false, updated_at: '2026-10-12T12:00:00Z' }];
  const grades = {
    first_year_plan_session_grades: [{ student_id: first, session_number: 2, teacher_score: 5, teacher_comment: 'Comentario guardado', absent: true, updated_at: '2026-10-20T12:00:00Z' }],
    training_session_grades: [],
  };
  let writes = 0, failAt = 0;
  const invalidations = [];
  const client = { from(table) {
    assert.ok(Object.hasOwn(grades, table) || table === 'training_session_grade_results');
    let ids, payload, options;
    const query = {
      select() { return query; },
      in(_key, values) { ids = values; return query; },
      upsert(rows, settings) { payload = rows; options = settings; return query; },
      then(resolve, reject) {
        let result;
        if (!payload) {
          const rows = table === 'training_session_grade_results' ? [...grades.training_session_grades, ...legacy] : grades[table];
          result = { data: rows.filter(row => ids.includes(row.student_id)), error: null };
        } else if (options.ignoreDuplicates) {
          assert.equal(table, 'training_session_grades');
          grades[table].push({ ...payload });
          result = { data: null, error: null };
        } else {
          writes++;
          assert.equal(options.onConflict, 'student_id,session_number');
          assert.equal(options.defaultToNull, false);
          for (const row of payload) assert.ok(!('absent' in row) && !('teacher_comment' in row));
          if (payload.some(row => (table === 'first_year_plan_session_grades') !== (row.student_id === first))) {
            result = { data: null, error: { code: '42501' } };
          } else if (writes === failAt) {
            result = { data: null, error: { code: 'TEST' } };
          } else {
            const rows = payload.map(row => {
              const stored = grades[table].find(value => value.student_id === row.student_id && value.session_number === row.session_number);
              if (stored) { Object.assign(stored, row); return { ...stored }; }
              const inserted = { teacher_comment: '', absent: false, ...row };
              grades[table].push(inserted);
              return inserted;
            });
            result = { data: rows, error: null };
          }
        }
        return Promise.resolve(result).then(resolve, reject);
      },
    };
    return query;
  } };
  const { publishSessionScores } = load('app/profesor/calificar-sesiones/actions.ts', {
    'next/cache': { revalidatePath: path => invalidations.push(path) },
    '@/lib/auth/guards': { requireRole: async () => { if (!allowed) throw new Error('Teacher required'); return { id: teacherId }; } },
    '@/lib/supabase/server': { createClient: async () => client },
    '@/lib/teacher-session-grading': helpers,
  });
  const input = { studentId: first, number: 2, score: 0 };
  allowed = false;
  await assert.rejects(() => publishSessionScores(1, [input]), /Teacher required/);
  allowed = true;
  assert.match((await publishSessionScores(1, [{ ...input, number: 9 }])).error, /sesión del curso/);
  assert.match((await publishSessionScores(1, [{ ...input, score: 8.55 }])).error, /una décima/);
  assert.match((await publishSessionScores(1, [input, input])).error, /misma casilla/);
  assert.equal(writes, 0);
  const firstSaved = await publishSessionScores(1, [input, { studentId: first, number: 8, score: 8.5 }]);
  assert.equal(firstSaved.error, null);
  assert.deepEqual(Array.from(firstSaved.grades, grade => [grade.score, grade.absent, grade.comment]), [[0, true, 'Comentario guardado'], [8.5, false, '']]);
  const mixed = await publishSessionScores(1, [input, { studentId: second, number: 1, score: 9 }]);
  assert.match(mixed.error, /curso activo seleccionado/);
  assert.equal(mixed.grades.length, 0);
  const secondSaved = await publishSessionScores(2, [{ studentId: legacyOnly, number: 4, score: 9.5 }]);
  assert.equal(secondSaved.grades[0].comment, 'Comentario anterior');
  assert.equal(secondSaved.grades[0].score, 9.5);
  assert.ok(invalidations.includes('/alumno/sa1/seguimiento'));
  assert.ok(invalidations.includes('/alumno/2bach/sa2/seguimiento'));

  failAt = writes + 2;
  const batch = Array.from({ length: 101 }, (_, index) => ({ studentId: id(index + 10), number: 10, score: 6 }));
  const partial = await publishSessionScores(2, batch);
  assert.equal(partial.grades.length, 100);
  assert.match(partial.error, /pendientes/);
  console.log('Session grade grid: 8 and 10 columns, course isolation, comments, absences, legacy records and partial publication passed.');
}



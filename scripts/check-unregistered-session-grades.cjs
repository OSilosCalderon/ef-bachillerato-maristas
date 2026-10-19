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
  assert.ok(['students','courses','training_session_grades'].includes(table),'Grading must never create or alter student logs.');
  let payload;
  const query = {
    select(){return query;},eq(){return query;},
    maybeSingle:async()=>({data:table==='students'?{id:studentId,course_id:'course'}:{bachillerato_year:year},error:null}),
    upsert(value, options){assert.equal(table,'training_session_grades');assert.equal(options.onConflict,'student_id,session_number');payload=value;return query;},
    single:async()=>{writes.push(payload);return {data:payload,error:null};},
  };
  return query;
}};
const actions = load('app/profesor/actions.ts',{
  '@/lib/teacher-activity-server':{},
  '@/lib/auth/guards':{requireRole:async role=>{assert.equal(role,'teacher');if(!allowed)throw new Error('Teacher required');return {id:teacherId};}},
  '@/lib/supabase/server':{createClient:async()=>supabase},
});
const ui=load('components/teacher-session-grading.tsx',{'@/app/profesor/actions':actions,'@/lib/teacher-session-grading':helpers});
const data={students:[{id:studentId,name:'Alumno de prueba',group:'2º'}],activities:[],sessionEvaluations:[{studentId,number:3,score:0,comment:'Seguimiento pendiente',updatedAt:'2026-10-19'}]};
const html=renderToStaticMarkup(React.createElement(ui.TeacherSessionGrading,{data}));
assert.equal((html.match(/aria-label="Calificar sesión \d+"/g)||[]).length,10,'All ten empty slots must have a grade form.');
assert.ok(html.includes('0/10 sesiones registradas'));
assert.ok(html.includes('1/10 calificadas'));
assert.ok(html.includes('9 pendientes de calificar'));
assert.ok(html.includes('Seguimiento pendiente'));
assert.ok(html.includes('Calificada · 0/10'));
console.log('Teacher UI: all ten unregistered sessions are editable; zero grades and honest delivery counts render.');
(async()=>{
  const input={studentId,sessionNumber:3,score:0,comment:'  Seguimiento pendiente  '};
  const saved=await actions.saveSecondYearSessionEvaluation(input);
  assert.equal(saved.score,0);assert.equal(saved.comment,'Seguimiento pendiente');
  assert.equal(writes[0].teacher_id,teacherId);assert.equal(writes[0].session_number,3);
  assert.ok(!Object.hasOwn(writes[0],'session_log_id'));
  await actions.saveSecondYearSessionEvaluation({...input,score:8.5});
  assert.equal(writes[1].score,undefined);assert.equal(writes[1].teacher_score,8.5);
  const count=writes.length;
  for(const sessionNumber of [0,11,1.5]) await assert.rejects(()=>actions.saveSecondYearSessionEvaluation({...input,sessionNumber}));
  for(const score of [-1,11,8.55,NaN]) await assert.rejects(()=>actions.saveSecondYearSessionEvaluation({...input,score}));
  await assert.rejects(()=>actions.saveSecondYearSessionEvaluation({...input,comment:'a'.repeat(501)}));
  year=1;await assert.rejects(()=>actions.saveSecondYearSessionEvaluation(input));year=2;
  allowed=false;await assert.rejects(()=>actions.saveSecondYearSessionEvaluation(input));
  assert.equal(writes.length,count,'Rejected requests must not write data.');
  console.log('Teacher action: no student log dependency, zero and decimal grades, comments, scope checks and role protection passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});


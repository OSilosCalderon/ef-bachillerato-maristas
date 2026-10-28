const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const vm=require('node:vm');
function load(file,imports={}) {
  const module={exports:{}};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText,{module,exports:module.exports,require:name=>Object.hasOwn(imports,name)?imports[name]:require(name),Intl,Date});
  return module.exports;
}
const activity=load('lib/teacher-activity.ts');
const completion=load('lib/teacher-completion.ts',{'./teacher-activity':activity});
const {studentCompletion,completionTotals}=completion;
const row=(id,category,sa,title,details={},score=null,status='')=>({id,studentId:'a',category,sa,title,details,score,status,date:'2026-10-22'});
const data={students:[{id:'a',name:'Alumno A',group:'1ºA'},{id:'b',name:'Alumno B',group:'1ºB'}],activities:[
  row('plan','plans','SA1','Objetivo propio',{final_conclusions:'Conclusiones',future_work:''},null,'active'),
  row('initial','physical','SA1','Sprint',{physical_test_id:'sprint',period:'september'},0),
  row('quiz','quizzes','SA1','Tema 1',{topic_slug:'topic'},0),
  row('challenge','challenges','SA1','Tema 1',{topic_slug:'topic',answer:'Propuesta razonada'}),
  row('extra','journals','SA2','Registro anterior',{session_number:11},100,'completed'),
  {...row('peer','journals','SA2','Sesión 1',{session_number:1},100,'completed'),studentId:'b'},
],sessionEvaluations:[{studentId:'a',number:1,score:0,comment:'Comentario docente',absent:true}],expectedInstruments:[
  {key:'plan',category:'plans',sa:'SA1',title:'Plan personal',matchAll:true},
  {key:'reflection',category:'plans',sa:'SA1',title:'Reflexión final',matchAll:true,completion:'reflection'},
  {key:'pre',category:'physical',sa:'SA1',title:'Sprint inicial',filters:{physical_test_id:'sprint',period:'september'}},
  {key:'post',category:'physical',sa:'SA2',title:'Sprint final',filters:{physical_test_id:'sprint',period:'december'}},
  {key:'quiz',category:'quizzes',sa:'SA1',title:'Tema 1',filters:{topic_slug:'topic'}},
  {key:'challenge',category:'challenges',sa:'SA1',title:'Reto del tema 1',filters:{topic_slug:'topic'}},
  {key:'session',category:'journals',sa:'SA2',title:'Sesión 1',filters:{session_number:1}},
  {key:'group-b',category:'journals',sa:'SA1',title:'Diario de B',group:'1ºB',filters:{session_date:'2026-10-20'}},
  {key:'demo',category:'projects',sa:'SA3',title:'Sesión diseñada',matchAll:true,tracking:'unavailable'},
]};
const own=studentCompletion(data,'a');
const item=key=>own.find(row=>row.key===key);
assert.equal(item('pre').state,'completed','A recorded zero is a real result.');
assert.equal(item('post').state,'pending','Initial results must not complete the final assessment.');
assert.equal(item('quiz').state,'completed','A submitted quiz with a low mark still counts as done.');
assert.equal(item('challenge').state,'completed','A saved free-text response counts as answered.');
assert.equal(item('plan').state,'in_progress');
assert.equal(item('reflection').state,'in_progress','Partial reflection is not completed.');
assert.equal(item('session').state,'pending','A teacher mark or absence does not create a student delivery.');
assert.equal(item('session').evaluation.absent,true);
assert.equal(item('session').evaluation.score,0);
assert.equal(item('session').records.length,0,'Do not use a peer\'s session.');
assert.equal(item('group-b'),undefined,'Use the pupil\'s own group calendar.');
assert.equal(item('demo').state,'untracked','Do not blame the pupil for screens without digital tracking.');
assert.ok(own.some(item=>!item.requested&&item.records[0].id==='extra'),'Preserve access to older records.');
const totals=completionTotals(own);
assert.equal(totals.total,7);assert.equal(totals.completed,3);assert.equal(totals.pending,2);assert.equal(totals.inProgress,2);assert.equal(totals.untracked,1);
assert.equal(completionTotals(studentCompletion(data,'missing')).total,0);
assert.ok(studentCompletion(data,'a','SA2').every(item=>item.sa==='SA2'));
assert.equal(JSON.stringify(data.activities[0].details),JSON.stringify({final_conclusions:'Conclusiones',future_work:''}));
const React=require('react');const {renderToStaticMarkup}=require('react-dom/server');
const checklist=load('components/teacher-student-checklist.tsx',{
  '@/lib/teacher-activity':activity,'@/lib/teacher-completion':completion,
  'next/link':{__esModule:true,default:({href,children,...props})=>React.createElement('a',{href,...props},children)},
});
const html=renderToStaticMarkup(React.createElement(checklist.TeacherStudentChecklist,{student:data.students[0],items:own,situations:[{code:'SA1',title:'Inicio'},{code:'SA2',title:'Seguimiento'},{code:'SA3',title:'Diseño'}],renderRecord:row=>React.createElement('p',null,row.details.answer||row.title)}));
for(const expected of ['Sprint inicial','Sprint final','Reflexión final','Sin seguimiento digital','AUSENCIA','Comentario docente','Propuesta razonada','Sesión 1','Pendiente','0/10'])assert.ok(html.includes(expected),`Missing individual evidence: ${expected}`);
assert.ok(!html.includes('Alumno B'));assert.ok(!html.includes('media de registros'));
console.log('Completion checklist: requested/missing work, phase/group isolation, zeros, drafts, reflections, absence without delivery, private responses and untracked screens passed.');

// Exercise the actual server loader with controlled rows, including an empty first-year pupil.
const tables={
  courses:[{id:'c2',name:'Segundo',bachillerato_year:2,is_active:true},{id:'c1',name:'Primero',bachillerato_year:1,is_active:true}],
  students:[{id:'a',profile_id:'pa',course_id:'c2',active:true},{id:'b',profile_id:'pb',course_id:'c1',active:true}],
  profiles:[{id:'pa',display_name:'Alumno A',class_group:'2º Bachillerato'},{id:'pb',display_name:'Alumno B',class_group:'1ºA Bachillerato'}],
  learning_situations:['c1','c2'].flatMap(course_id=>['SA1','SA2','SA3','SA4','SA5','SA6'].map(code=>({id:course_id+code,course_id,code,title:code}))),
  physical_tests:[{id:'sprint',name:'Sprint',unit:'s',direction:'lower_better'}],
  questionnaires:[{id:'qi',learning_situation_id:'c2SA1',title:'GOES inicial',assessment_phase:'initial'},{id:'qf',learning_situation_id:'c2SA1',title:'GOES final',assessment_phase:'final'},{id:'foreign-final',learning_situation_id:'c1SA1',title:'GOES final de otro curso',assessment_phase:'final'}],
  questionnaire_attempts:[{id:'attempt',questionnaire_id:'qf',student_id:'a',status:'submitted'}],
  questionnaire_questions:[{id:'question',questionnaire_id:'qf',prompt:'Pregunta real',position:1}],
  questionnaire_responses:[{id:'answer',attempt_id:'attempt',question_id:'question',answer:{label:'Muy de acuerdo'}}],
  theory_topic_progress:[{id:'progress',student_id:'a',topic_slug:'topic-2',completed:false,quiz_score:0}],
  physical_test_results:[{id:'post',student_id:'a',physical_test_id:'sprint',period:'december',value:8}],
  training_session_grade_results:[{student_id:'a',session_number:1,teacher_score:0,teacher_comment:'Ausencia',absent:true,updated_at:'2026-10-22'}],
  theory_challenge_topics:[{slug:'topic-2',title:'Cargas',sa_code:'SA2',course_year:2}],
  class_sessions:[],
  physical_final_reflections:[{id:'reflection-2',student_id:'a',course_id:'c2',course_year:2,sa_code:'SA2',status:'submitted',results_analysis:'Comparación propia',goal_review:'Objetivo logrado',personal_learning:'Conclusiones',future_motivation:'Seguir nadando'}],
};
const client={from(table){let filters=[],start=0,end=999;const query={select(){return query;},order(){return query;},range(a,b){start=a;end=b;return query;},eq(key,value){filters.push(row=>row[key]===value);return query;},in(key,values){filters.push(row=>values.map(String).includes(String(row[key])));return query;},then(resolve,reject){return Promise.resolve({data:(tables[table]||[]).filter(row=>filters.every(filter=>filter(row))).slice(start,end+1),error:null}).then(resolve,reject);}};return query;}};
const loader=load('lib/teacher-activity-server.ts',{
  'server-only':{},'@/lib/auth/guards':{requireRole:async role=>assert.equal(role,'teacher')},'@/lib/supabase/server':{createClient:async()=>client},
  '@/lib/class-groups':{firstYearCalendarGroup:group=>group.startsWith('1ºA')?'1ºA Bachillerato':null},
  '@/lib/training-theory-topics':{trainingTheoryTopics:[{slug:'topic-1',title:'Primer tema'}]},'@/lib/training-theory-flexibility':{flexibilityTheoryTopic:{slug:'flex',title:'Flexibilidad'}},
  '@/lib/second-year-theory-topics':{secondYearTheoryTopics:[{slug:'topic-2',title:'Cargas',sa:'SA2'}]},
  '@/lib/first-year-personal-plan-calendar':load('lib/first-year-personal-plan-calendar.ts',{}),
  '@/lib/second-year-personal-plan-calendar':{SECOND_YEAR_PLAN_SESSIONS:Array.from({length:10},(_,index)=>({date:`2026-10-${13+index}`}))},
});
(async()=>{
  tables.assessment_grade_items=[{id:'block-2',course_id:'c2',sa_code:'SA1',item_key:'personal-plan',title:'Plan personal',position:1},{id:'block-1',course_id:'c1',sa_code:'SA1',item_key:'personal-plan',title:'Plan de 1º',position:1}];
  tables.student_assessment_grades=[{id:'published-2',student_id:'a',item_id:'block-2',score:0,comment:'Nota propia',published_at:'2026-10-26'},{id:'foreign-grade',student_id:'a',item_id:'block-1',score:10,comment:'Otro curso',published_at:'2026-10-26'},{id:'published-1',student_id:'b',item_id:'block-1',score:8,comment:'Nota de primero',published_at:'2026-10-26'}];
  const second=await loader.loadTeacherActivity(2);
  assert.equal(second.activities.filter(row=>row.category==='reflections').length,1);
  assert.equal(second.activities.find(row=>row.category==='reflections').details.future_motivation,'Seguir nadando');
  assert.equal(second.activities.find(row=>row.category==='reflections').sa,'SA2');
  assert.equal(second.expectedInstruments.find(row=>row.category==='reflections').sa,'SA2');
  assert.equal(second.assessmentItems.length,1);assert.equal(second.assessmentItems[0].id,'block-2');
  assert.equal(second.assessmentGrades.length,1);assert.equal(second.assessmentGrades[0].score,0);assert.equal(second.assessmentGrades[0].comment,'Nota propia');
  assert.equal(second.students[0].courseId,'c2');
  assert.equal(second.students.length,1);assert.equal(second.students[0].id,'a');
  assert.equal(second.expectedInstruments.filter(item=>item.category==='journals'&&item.sa==='SA2').length,10);
  assert.equal(second.expectedInstruments.filter(item=>item.category==='questionnaires').length,2,'Final questionnaires from another course must not become extra pending work.');
  assert.equal(second.activities.find(row=>row.category==='physical').sa,'SA2');
  const questionnaire=second.activities.find(row=>row.category==='questionnaires');
  assert.equal(questionnaire.sa,'SA2');assert.equal(questionnaire.details.answers[0].question,'Pregunta real');assert.equal(questionnaire.details.answers[0].answer,'Muy de acuerdo');
  assert.ok(second.expectedInstruments.some(item=>item.category==='plans'));
  assert.ok(second.expectedInstruments.some(item=>item.category==='challenges'));
  assert.ok(second.expectedInstruments.some(item=>item.category==='theory'));
  const first=await loader.loadTeacherActivity(1);
  assert.equal(first.assessmentGrades.length,1);assert.equal(first.assessmentGrades[0].comment,'Nota de primero');
  assert.equal(first.students.length,1);assert.equal(first.students[0].id,'b');
  assert.equal(first.activities.length,0,'Empty pupils must not inherit another course\'s activity.');
  assert.ok(first.expectedInstruments.length>0,'An empty pupil must still have a visible list of requested work.');
  assert.ok(first.expectedInstruments.some(item=>item.sa==='SA3'&&item.tracking==='unavailable'));
  tables.profiles.push({id:'pc',display_name:'Alumno C',class_group:'1ºB Bachillerato'});
  tables.students.push({id:'c',profile_id:'pc',course_id:'c1',active:true});
  tables.first_year_plan_session_logs=[{id:'first-log',student_id:'b',sa_code:'SA1',session_number:1,session_date:'2026-10-26',status:'completed',completion_percent:100}];
  tables.first_year_plan_session_grades=[{student_id:'b',session_number:2,teacher_score:0,teacher_comment:'Ausencia',absent:true,updated_at:'2026-10-26'}];
  tables.session_journals=[{id:'old-diary',student_id:'b',learning_situation_id:'c1SA1',session_date:'2026-10-26',reflection:'Diario conservado'}];
  tables.class_sessions=[{id:'calendar-day',class_group:'1ºA Bachillerato',academic_year:'2026/2027',status:'scheduled',session_date:'2026-10-26'},{id:'before-plan',class_group:'1ºA Bachillerato',academic_year:'2026/2027',status:'scheduled',session_date:'2026-09-21'}];
  tables.sports_journals=[{id:'old-sports',student_id:'b',learning_situation_id:'c1SA2',reflection:'Respuesta deportiva conservada'}];
  tables.physical_final_reflections.push({id:'reflection-1',student_id:'b',course_id:'c1',course_year:1,sa_code:'SA1',status:'draft',results_analysis:'Análisis de primero'});
  const storedBefore=JSON.stringify(tables);
  const updated=await loader.loadTeacherActivity(1);
  assert.equal(updated.activities.find(row=>row.category==='reflections').sa,'SA1');
  assert.equal(updated.activities.find(row=>row.category==='reflections').status,'draft');
  assert.equal(updated.expectedInstruments.find(row=>row.category==='reflections').sa,'SA1');
  for(const group of ['1ºA Bachillerato','1ºB Bachillerato']) assert.equal(updated.expectedInstruments.filter(item=>item.filters?._kind==='plan-session'&&item.group===group).length,8);
  assert.ok(!updated.expectedInstruments.some(item=>item.category==='journals'&&item.filters?._kind!=='plan-session'),'Only the eight personal-plan follow-ups remain requested.');
  assert.ok(updated.activities.some(row=>row.details.id==='old-diary'),'Existing diary remains accessible.');
  assert.ok(updated.activities.some(row=>row.details.id==='old-sports'),'Existing sports diary remains accessible.');
  assert.equal(JSON.stringify(tables),storedBefore,'Loading the revised catalog must not alter any stored rows.');
  assert.equal(updated.sessionEvaluations[0].score,0);
  const firstCompletion=completion.studentCompletion(updated,'b');
  for(const id of ['old-diary','old-sports']) assert.ok(firstCompletion.some(item=>!item.requested&&item.records.some(row=>row.details.id===id)),'Retired diaries remain additional historical records, not pending assignments.');
  assert.equal(firstCompletion.filter(item=>item.sessionNumber).length,8);assert.equal(firstCompletion.find(item=>item.sessionNumber===1).state,'completed');
  assert.equal(firstCompletion.find(item=>item.sessionNumber===2).state,'pending');assert.equal(firstCompletion.find(item=>item.sessionNumber===2).evaluation.absent,true);
  assert.equal(completion.studentCompletion(updated,'c').filter(item=>item.sessionNumber&&item.state==='completed').length,0);
  console.log('Teacher loader: ten expected sessions, full empty-pupil catalog, final/initial placement, actual response text and course isolation passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});



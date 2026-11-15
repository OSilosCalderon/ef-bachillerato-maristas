const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const vm=require('node:vm');
const moduleObject={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/gradebook.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:moduleObject,exports:moduleObject.exports});
const {gradesForStudent,validateGradePublication,formatGrade}=moduleObject.exports;
const studentId='11111111-1111-4111-8111-111111111111';
const otherStudent='22222222-2222-4222-8222-222222222222';
const itemId='33333333-3333-4333-8333-333333333333';
const items=[{id:itemId,course_id:'second',sa_code:'SA1',position:2,title:'Teoría'},{id:'pending',course_id:'second',sa_code:'SA1',position:1,title:'Plan'},{id:'another-course',course_id:'first',sa_code:'SA1',position:1,title:'Otro curso'}];
const grades=[{id:'grade-a',student_id:studentId,item_id:itemId,score:0,comment:'Comentario propio',published_at:'2026-10-16T10:00:00Z'},{id:'grade-b',student_id:otherStudent,item_id:'pending',score:10,comment:'Comentario privado de otro alumno',published_at:'2026-10-16T10:00:00Z'}];
const result=gradesForStudent(items,grades,studentId,'second');
assert.equal(result.length,2,'Solo se incluyen instrumentos del curso solicitado.');
assert.equal(result[0].item.id,'pending');
assert.equal(result[0].grade,null,'Una calificación pendiente no debe tomar la nota de otro alumno.');
assert.equal(result[1].grade.score,0,'Una nota cero es una calificación publicada.');
assert.equal(result[1].grade.comment,'Comentario propio');
assert.equal(items[0].id,itemId,'La ordenación no debe modificar la entrada.');
const valid={studentId,itemId,score:8.5,comment:'  Buen trabajo  '};
assert.equal(validateGradePublication(valid).comment,'Buen trabajo');
assert.equal(validateGradePublication({...valid,score:0}).score,0);
assert.equal(validateGradePublication({...valid,score:10}).score,10);
assert.equal(formatGrade(8.5),'8,5');
for(const score of [-1,10.1,8.55,NaN,Infinity,'8.5',null])assert.throws(()=>validateGradePublication({...valid,score}));
assert.throws(()=>validateGradePublication({...valid,studentId:'not-an-id'}));
assert.throws(()=>validateGradePublication({...valid,itemId:''}));
assert.throws(()=>validateGradePublication({...valid,comment:'a'.repeat(501)}));
console.log('Gradebook: student/course isolation, private comments, pending versus zero, stable order, decimal limits and publication input passed.');

const finalModule = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/second-year-final-grades.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, {
  module: finalModule, exports: finalModule.exports,
  require: name => { assert.equal(name, './gradebook'); return moduleObject.exports; },
});
const { secondYearFinalGrades } = finalModule.exports;
const { indexAssessmentGrades } = moduleObject.exports;
const blockInstruments = [
  ['SA1', 'initial-assessment', 0], ['SA2', 'final-physical-tests', 7.5],
  ['SA1', 'questionnaire-completion', 7.4], ['SA1', 'theory-self-assessment', 8.5], ['SA2', 'theory-self-assessment', 6.5],
  ['SA1', 'personal-plan', 9.3], ['SA2', 'session-follow-up', 5.5], ['SA2', 'final-physical-reflection', 8.4],
  ['SA2', 'final-questionnaire-completion', 0],
];
const blockItems = blockInstruments.map(([sa_code, item_key], index) => ({ id: 'instrument-' + index, course_id: 'second', sa_code, item_key }));
const blockGrades = blockInstruments.map(([, , score], index) => ({
  student_id: studentId, item_id: blockItems[index].id, score, published_at: '2026-11-15T09:00:00Z',
}));
const resultsFor = (notes) => secondYearFinalGrades(
  [{ id: studentId, courseId: 'second' }, { id: otherStudent, courseId: 'second' }],
  [...blockItems, { ...blockItems[6], course_id: 'first', id: 'first-year-follow-up' }],
  indexAssessmentGrades(notes),
);
const [complete, empty] = resultsFor([...blockGrades, { ...blockGrades[6], item_id: 'first-year-follow-up', score: 10 }]);
assert.deepEqual(Array.from(complete.blocks, block => block.score.toFixed(2)), ['3.75', '7.47', '7.98']);
assert.deepEqual(Array.from(complete.blocks, block => block.published), [2, 3, 3], 'Zero counts and the SA2 questionnaire is excluded.');
assert.ok(empty.blocks.every(block => block.score === null && block.published === 0), 'Avoid borrowing another student’s notes.');
const [pending] = resultsFor(blockGrades.filter(grade => grade.item_id !== blockItems[6].id));
assert.equal(pending.blocks[2].score, null, 'A missing mark leaves the weighted block pending.');
assert.equal(pending.blocks[2].published, 2);
const [updatedBlock] = resultsFor([...blockGrades, { ...blockGrades[1], score: 10, published_at: '2026-11-15T10:00:00Z' }]);
assert.equal(updatedBlock.blocks[0].score, 5);
console.log('Final grade blocks: means, 50/30/20 weighting, course and student isolation, omitted SA2 questionnaire, zero and missing marks passed.');

// Render the actual pupil page with controlled data, without storing real marks.
const path=require('node:path');
const Module=require('node:module');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const originalLoad=Module._load;
const originalTsx=Module._extensions['.tsx'];
let pupilData={studentId,courseId:'second',year:2,items,grades,situations:[{code:'SA1',title:'Situación inicial'}],sessionGrades:[{number:1,score:7.5,comment:'Sesión comentada',date:'2026-10-16T10:00:00Z'}]};
Module._load=function(request,parent,...args){
  if(request==='next/link')return {__esModule:true,default:({href,children,...props})=>React.createElement('a',{href,...props},children)};
  if(request==='@/components/dashboard-header')return {DashboardHeader:({title,description})=>React.createElement('header',null,React.createElement('h1',null,title),React.createElement('p',null,description))};
  if(request==='@/lib/gradebook')return moduleObject.exports;
  if(request==='@/components/gradebook-view')return originalLoad.call(this,path.resolve('components/gradebook-view.tsx'),parent,...args);
  if(request==='@/lib/gradebook-server')return {loadStudentGradebook:async()=>pupilData};
  return originalLoad.call(this,request,parent,...args);
};
Module._extensions['.tsx']=(mod,filename)=>mod._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText,filename);
(async()=>{
  try{
    const Page=require(path.resolve('app/alumno/calificaciones/page.tsx')).default;
    const html=renderToStaticMarkup(await Page());
    assert.ok(html.includes('Mis calificaciones'));
    assert.ok(html.includes('Comentario propio'));
    assert.ok(html.includes('Sesión comentada'));
    assert.ok(html.includes('7,5/10'));
    assert.ok(html.includes('Pendiente'));
    assert.ok(!html.includes('Comentario privado de otro alumno'));
    assert.ok(!html.includes('Otro curso'));
    pupilData={...pupilData,year:1};
    const firstYear=renderToStaticMarkup(await Page());
    assert.ok(firstYear.includes('/alumno/sa1/seguimiento'));
    assert.ok(firstYear.includes('SA1'));
    assert.ok(firstYear.includes('Sesión comentada'));
    assert.ok(!firstYear.includes('/alumno/2bach/sa2/seguimiento'));
    pupilData={...pupilData,grades:[],sessionGrades:[]};
    const empty=renderToStaticMarkup(await Page());
    assert.ok(empty.includes('Aún no tienes calificaciones publicadas'));
    assert.ok(!empty.includes('Comentario propio'));
    console.log('Pupil grade page: published notes, session feedback, pending entries, private-data filtering and empty state rendered correctly.');
  }finally{Module._load=originalLoad;if(originalTsx)Module._extensions['.tsx']=originalTsx;else delete Module._extensions['.tsx'];}
})().catch(error=>{console.error(error);process.exitCode=1;});


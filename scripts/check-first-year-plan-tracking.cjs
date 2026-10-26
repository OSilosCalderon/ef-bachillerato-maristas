const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
function load(file,mocks={}) {
 const module={exports:{}};
 const resolve=name=>Object.hasOwn(mocks,name)?mocks[name]:name.startsWith('@/')?load(name.slice(2)+(fs.existsSync(name.slice(2)+'.tsx')?'.tsx':'.ts'),mocks):name.startsWith('.')?load(path.join(path.dirname(file),name)+'.ts',mocks):require(name);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText,{module,exports:module.exports,require:resolve,console,Date,Set,Map,Intl,window:{scrollTo(){}}});
 return module.exports;
}
const helper=load('lib/teacher-session-grading.ts');
for (const group of ['1ºA','1ºB']) {
 const slots=helper.teacherSessionSlots([], 'a', [{studentId:'a',number:2,score:0,comment:'Ausencia de prueba',absent:true}],1,group);
 assert.equal(slots.length,8);assert.equal(slots[0].planned.date,'2026-10-26');assert.equal(slots[7].planned.date,'2026-11-23');
 assert.equal(slots[1].planned.date,group==='1ºA'?'2026-10-29':'2026-10-30');assert.equal(slots[1].evaluation.score,0);assert.equal(slots[1].record,null);
 const ui=load('components/teacher-session-grading.tsx',{'@/app/profesor/actions':{}});
 const html=renderToStaticMarkup(React.createElement(ui.TeacherSessionGrading,{courseYear:1,data:{students:[{id:'a',name:'Alumno de prueba',group}],activities:[],sessionEvaluations:[{studentId:'a',number:2,score:0,comment:'Ausencia de prueba',absent:true}]}}));
 assert.equal((html.match(/aria-label="Calificar sesión \d+"/g)||[]).length,8);assert.ok(html.includes('0/8 sesiones registradas'));assert.ok(html.includes('1/8 calificadas'));assert.ok(html.includes('AUSENCIA'));assert.ok(!html.includes('sesion-9'));
}
assert.equal(helper.teacherSessionSlots([],'a',[],1,'desconocido').length,0,'Do not invent a group calendar.');
const mk=(kind,sa='SA1',studentId='a')=>({id:kind,studentId,sa,category:'journals',title:kind,status:'completed',date:'2026-10-26',score:100,details:{id:kind,_kind:kind,session_number:1}});
const records=[mk('class-journal'),mk('plan-session'),mk('plan-session','SA2'),mk('plan-session','SA1','b')];
const slots=helper.teacherSessionSlots(records,'a',[],1,'1ºA');assert.equal(slots.filter(x=>x.record).length,1);assert.equal(slots[0].record.details._kind,'plan-session');
const completion=load('lib/teacher-completion.ts');
const result=completion.studentCompletion({students:[{id:'a',group:'1ºA'}],activities:[],expectedInstruments:[{sa:'SA1',category:'journals',title:'Sesión 1',filters:{_kind:'plan-session',session_number:1}}],sessionEvaluations:[{studentId:'a',number:1,score:0,absent:true}]},'a');
assert.equal(result[0].state,'pending');assert.equal(result[0].evaluation.score,0);assert.equal(completion.completionTotals(result).completed,0);

// Exercise the actual pupil load/save handlers with deterministic hook state, for both calendars.
async function pupilFlow(group,year=1) {
 let state=[],cursor=0,effects=[],writes=[];
 const sid='11111111-1111-4111-8111-111111111111';
 const logTable=year===1?'first_year_plan_session_logs':'training_session_logs';
 const gradeTable=year===1?'first_year_plan_session_grades':'training_session_grade_results';
 const logs=[];
 const client={auth:{getUser:async()=>({data:{user:{id:'profile'}},error:null})},from(table){
  let payload;const filters=[];
  const data=()=>table==='students'?{id:sid,course_id:'course'}:table==='profiles'?{class_group:group}:table==='courses'?{bachillerato_year:year}:table==='personal_training_plans'?{objective:'Mejorar mi resistencia',plan_items:[]}:table===logTable?logs:table===gradeTable?[{session_number:2,teacher_score:0,teacher_comment:'Comentario docente',absent:true}]:null;
  const query={select(){return query;},eq(k,v){filters.push([k,v]);return query;},order(){return query;},upsert(row,options){assert.equal(table,logTable);assert.equal(options.onConflict,'student_id,course_id,sa_code,session_number');payload=row;return query;},single:async()=>{if(payload){writes.push(payload);logs.push({...payload,id:'saved'});return {data:{id:'saved'},error:null};}return {data:data(),error:null};},maybeSingle:async()=>({data:data(),error:null}),then(resolve,reject){return Promise.resolve({data:data(),error:null}).then(resolve,reject);}};return query;
 }};
 const jsx={jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props}),Fragment:'fragment'};
 const hooks={useState(initial){const i=cursor++;if(!(i in state))state[i]=typeof initial==='function'?initial():initial;return [state[i],v=>{state[i]=typeof v==='function'?v(state[i]):v;}];},useEffect(fn){if(!effects.length)effects.push(fn);},useMemo:fn=>fn()};
 const {SecondYearSa2Tracker}=load('components/second-year-sa2-tracker.tsx',{'react':hooks,'react/jsx-runtime':jsx,'next/link':{__esModule:true,default:'a'},'lucide-react':{},'@/lib/supabase/client':{createClient:()=>client}});
 const nodes=n=>Array.isArray(n)?n.flatMap(nodes):n&&typeof n==='object'?[n,...nodes(n.props?.children)]:[];
 const render=()=>{cursor=0;return nodes(SecondYearSa2Tracker({courseYear:year}));};
 render();effects[0]();for(let i=0;i<20;i++)await Promise.resolve();let tree=render();
 const select=tree.find(n=>n.type==='select');assert.ok(select,'Pupil follow-up loads.');
 assert.equal(select.props.children[1].length,year===1?8:10);
 assert.ok(tree.some(n=>n.type==='p'&&String(JSON.stringify(n.props.children)).includes('Comentario docente')),'A grade without pupil log is visible.');
 const duration=tree.find(n=>n.type==='input'&&n.props.max==='240');duration.props.onChange({target:{value:'45'}});
 tree.find(n=>n.type==='button'&&n.props['aria-label']==='Esfuerzo 7 de 10').props.onClick();
 const texts=tree.filter(n=>n.type==='textarea');texts[0].props.onChange({target:{value:'Reduzco la carga'}});texts[1].props.onChange({target:{value:'Me he regulado mejor'}});
 tree=render();const save=tree.find(n=>n.type==='button'&&String(JSON.stringify(n.props.children)).includes('Guardar sesión'));await save.props.onClick();for(let i=0;i<40;i++)await Promise.resolve();
 assert.equal(writes.length,1);assert.equal(writes[0].student_id,sid);assert.equal(writes[0].sa_code,year===1?'SA1':'SA2');assert.equal(writes[0].session_date,year===1?'2026-10-26':'2026-10-13');assert.equal(writes[0].rpe,7);assert.equal(writes[0].duration_minutes,45);assert.equal(writes[0].reflection,'Me he regulado mejor');assert.equal(writes[0].teacher_score,undefined);
 tree=render();assert.ok(tree.some(n=>n.type==='button'&&n.props['aria-label']==='Editar sesión 1'));if(year===1)assert.ok(!tree.some(n=>n.type==='button'&&n.props['aria-label']==='Eliminar sesión 1'));
 tree.find(n=>n.type==='button'&&n.props['aria-label']==='Editar sesión 1').props.onClick();tree=render();assert.equal(tree.find(n=>n.type==='input'&&n.props.max==='240').props.value,'45','Editing reloads the existing answers.');
}
(async()=>{await pupilFlow('1ºA');await pupilFlow('1ºB');await pupilFlow('2º Bachillerato',2);console.log('First-year SA1: eight group-specific dates, all grade forms, honest completion, student save/edit and teacher feedback; second-year regression passed.');})().catch(error=>{console.error(error);process.exitCode=1;});

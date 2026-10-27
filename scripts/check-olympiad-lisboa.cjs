const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
function load(file,mocks={}) {
 const module={exports:{}};
 const resolve=name=>Object.hasOwn(mocks,name)?mocks[name]:name.startsWith('@/')?load(name.slice(2)+(fs.existsSync(name.slice(2)+'.tsx')?'.tsx':'.ts'),mocks):name.startsWith('.')?load(path.join(path.dirname(file),name)+'.ts',mocks):require(name);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText,{module,exports:module.exports,require:resolve,Intl,Date,Set,Map});
 return module.exports;
}
const helper=load('lib/olympiad-lisboa.ts');
const yes={participating:true,gender:'femenino',first_choice:'atletismo-2000',second_choice:'gimnasia-minitrampolin'};
assert.equal(helper.OLYMPIAD_CHOICES.length,13);assert.equal(new Set(helper.OLYMPIAD_CHOICES.map(x=>x.sport)).size,8);
for(const choice of helper.OLYMPIAD_CHOICES)assert.equal(helper.validateOlympiadAnswer({...yes,first_choice:choice.id,second_choice:choice.id==='futbol-sala'?'baloncesto':'futbol-sala'}).first_choice,choice.id);
const declined=helper.validateOlympiadAnswer({...yes,participating:false,student_id:'foreign'});
assert.equal(JSON.stringify(declined),JSON.stringify({participating:false,gender:null,first_choice:null,second_choice:null}),'No must finish the form without retaining unneeded demographic/preferences fields.');
for(const invalid of [null,[],{}, {...yes,participating:'false'},{...yes,gender:''},{...yes,first_choice:'unknown'},{...yes,second_choice:''},{...yes,second_choice:yes.first_choice}])assert.throws(()=>helper.validateOlympiadAnswer(invalid));
const response={student_id:'a',...yes,updated_at:'2026-10-27T09:00:00Z'};
const nextMocks={
 'next/link':{__esModule:true,default:({children,href,...props})=>React.createElement('a',{href,...props},children)},
 'next/image':{__esModule:true,default:({priority,...props})=>React.createElement('img',props)},
 'next/navigation':{usePathname:()=>'/alumno/olimpiada-lisboa',useSearchParams:()=>new URLSearchParams(),useRouter:()=>({refresh(){}}),redirect:href=>{throw Error('REDIRECT:'+href);}},
 '@/app/alumno/olimpiada-lisboa/actions':{saveOlympiadAnswer:async()=>response},
};
const {OlympiadParticipationForm}=load('components/olympiad-participation-form.tsx',nextMocks);
const noHtml=renderToStaticMarkup(React.createElement(OlympiadParticipationForm,{initialResponse:{...response,...declined}}));
assert.ok(noHtml.includes('no deseas participar'));assert.ok(!noHtml.includes('<select'));
const yesHtml=renderToStaticMarkup(React.createElement(OlympiadParticipationForm,{initialResponse:response}));
for(const label of ['Género','Primera opción','Segunda opción','Natación · 50 metros mariposa','Gimnasia deportiva · Minitrampolín'])assert.ok(yesHtml.includes(label));
const content=load('components/olympiad-lisboa-content.tsx',nextMocks);
const eventHtml=renderToStaticMarkup(React.createElement(content.OlympiadLisboaContent,{showParticipationLink:true}));
for(const text of ['15–17 de abril de 2027','2027-04-15','2027-04-16','2027-04-17','09:00','14:00','Noche cultural','Finales',helper.OLYMPIAD_RULES,helper.OLYMPIAD_LOGO,helper.OLYMPIAD_PROGRAM])assert.ok(eventHtml.includes(text));
const {SideNav}=load('components/side-nav.tsx',nextMocks);
for(const role of ['student','teacher'])for(const courseYear of [1,2]) {
 const html=renderToStaticMarkup(React.createElement(SideNav,{role,courseYear}));
 assert.equal(html.includes('olimpiada-lisboa'),role==='teacher'||courseYear===1,'The link must appear on desktop/mobile for first year only.');
}
const tables={
 courses:[{id:'c1',bachillerato_year:1,is_active:true,academic_year:'2026-2027'},{id:'c2',bachillerato_year:2,is_active:true,academic_year:'2026-2027'}],
 students:[{id:'a',profile_id:'pa',course_id:'c1',active:true},{id:'b',profile_id:'pb',course_id:'c1',active:true},{id:'other-year',profile_id:'p2',course_id:'c2',active:true},{id:'inactive',profile_id:'pi',course_id:'c1',active:false}],
 profiles:[{id:'pa',display_name:'Alumno A',class_group:'1ºA'},{id:'pb',display_name:'Alumno B',class_group:'1ºB Bachillerato'}],
 olympiad_lisboa_2027_responses:[response,{...response,student_id:'b',...declined}],
};
let profileId='pa',role='student',writes=[],failWrite=false;
const client={from(table){let filters=[],single=false,payload=null;const query={select(){return query;},order(){return query;},eq(key,value){filters.push(row=>row[key]===value);return query;},in(key,values){filters.push(row=>values.includes(row[key]));return query;},maybeSingle(){single=true;return query;},single(){single=true;return query;},upsert(value,options){assert.equal(options.onConflict,'student_id');payload=value;writes.push({...value});return query;},then(resolve,reject){const rows=(tables[table]||[]).filter(row=>filters.every(f=>f(row)));return Promise.resolve(payload?{data:failWrite?null:{...payload,updated_at:response.updated_at},error:failWrite?{message:'unavailable'}:null}:{data:single?rows[0]??null:rows,error:null}).then(resolve,reject);}};return query;}};
const serverMocks={...nextMocks,'server-only':{},'@/lib/auth/guards':{requireRole:async expected=>{assert.equal(role,expected,'Wrong role must be denied.');return {id:profileId};}},'@/lib/supabase/server':{createClient:async()=>client}};
const server=load('lib/olympiad-lisboa-server.ts',serverMocks);
const action=load('app/alumno/olimpiada-lisboa/actions.ts',{...serverMocks,'@/lib/olympiad-lisboa-server':server,'next/cache':{revalidatePath(){}}});
(async()=>{
 const original=JSON.stringify(tables);
 assert.equal((await server.loadStudentOlympiad()).response.student_id,'a');
 const saved=await action.saveOlympiadAnswer({...yes,student_id:'b'});assert.equal(saved.student_id,'a','Student identity must come from the session, not a submitted ID.');
 await action.saveOlympiadAnswer({...yes,participating:false});assert.equal(writes.at(-1).gender,null);assert.equal(writes.at(-1).first_choice,null);
 const beforeInvalid=writes.length;await assert.rejects(()=>action.saveOlympiadAnswer({...yes,first_choice:'forged'}));assert.equal(writes.length,beforeInvalid);
 failWrite=true;await assert.rejects(()=>action.saveOlympiadAnswer(yes));failWrite=false;
 profileId='p2';assert.equal(await server.loadStudentOlympiad(),null);const beforeSecond=writes.length;await assert.rejects(()=>action.saveOlympiadAnswer(yes));assert.equal(writes.length,beforeSecond);
 const pupilPage=load('app/alumno/olimpiada-lisboa/page.tsx',{...serverMocks,'@/lib/olympiad-lisboa-server':server});
 await assert.rejects(()=>pupilPage.default(),/REDIRECT:\/alumno/);
 role='teacher';profileId='teacher';const roster=await server.loadTeacherOlympiad();assert.equal(roster.length,2);assert.equal(roster[0].group,'1ºA Bachillerato');assert.ok(roster.some(row=>row.response?.participating===false));
 const beforeTeacher=writes.length;await assert.rejects(()=>action.saveOlympiadAnswer(yes));assert.equal(writes.length,beforeTeacher,'Teacher preview must not generate a student participation record.');
 const teacherUi=load('components/teacher-olympiad-responses.tsx',nextMocks);
 const html=renderToStaticMarkup(React.createElement(teacherUi.TeacherOlympiadResponses,{students:[...roster,{id:'pending',name:'Alumno sin respuesta',group:'1ºB Bachillerato',response:null}]}));
 for(const text of ['Alumno A','Alumno B','Alumno sin respuesta','Sin responder','Atletismo · 2.000 metros','Gimnasia deportiva · Minitrampolín'])assert.ok(html.includes(text));
 assert.equal(JSON.stringify(tables),original,'Tests must not mutate source rows or existing grades.');
 for(const asset of [helper.OLYMPIAD_LOGO,helper.OLYMPIAD_RULES,helper.OLYMPIAD_PROGRAM])assert.ok(fs.existsSync('public'+asset));
 console.log('Lisboa Olympiad: conditional yes/no form, all 13 choices, ordered preferences, persisted identity, confirmed saves/errors, first-year/role isolation, teacher consultation, program/logo and preserved records passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});

const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
function load(file,mocks={},globals={}) {
 const module={exports:{}};
 const resolve=name=>Object.hasOwn(mocks,name)?mocks[name]:name.startsWith('@/')?load(name.slice(2)+(fs.existsSync(name.slice(2)+'.tsx')?'.tsx':'.ts'),mocks,globals):name.startsWith('.')?load(path.join(path.dirname(file),name)+'.ts',mocks,globals):require(name);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText,{module,exports:module.exports,require:resolve,Request,Response,URL,Date,Intl,Set,Map,Error,...globals});
 return module.exports;
}
const helper=load('lib/olympiad-lisboa.ts'),{summarizeOlympiadParticipation}=load('lib/olympiad-participation-summary.ts');
const student=(id,first,second,participating=true)=>({id,name:'Alumno '+id,group:id==='b'?'1ºB Bachillerato':'1ºA Bachillerato',response:first===undefined?null:{student_id:id,participating,gender:participating?'masculino':null,first_choice:first,second_choice:second,updated_at:'2026-10-27T12:00:00Z'}});
const students=[student('a','atletismo-longitud','atletismo-2000'),student('b','baloncesto','atletismo-peso'),student('c',null,null,false),student('pending')];
const original=JSON.stringify(students),summary=summarizeOlympiadParticipation(students);
assert.equal(summary.accepted.length,2);assert.equal(summary.declined.length,1);assert.equal(summary.pending.length,1);
const athletics=summary.sports.find(row=>row.sport==='Atletismo');assert.equal(athletics.interested,2,'Count a pupil once per sport even if both preferences name that sport.');assert.equal(athletics.first.length,1);assert.equal(athletics.second.length,2);
assert.equal(summarizeOlympiadParticipation(students.filter(x=>x.group==='1ºB Bachillerato')).sports.find(x=>x.sport==='Atletismo').interested,1);
const ui=load('components/teacher-olympiad-summary.tsx');
const html=renderToStaticMarkup(React.createElement(ui.TeacherOlympiadSummary,{students}));
for(const text of ['Sí desean participar · Por deportes','Primera opción','Segunda opción','No desean participar','Alumno c','1ºB Bachillerato','Atletismo · 2.000 metros'])assert.ok(html.includes(text));
assert.ok(!html.includes('Alumno pending'),'Unanswered pupils must not be presented as declining.');assert.equal(JSON.stringify(students),original);

// Compose the actual teacher controls with gender/group filters and preserve unclassified responses.
{
 const {filterOlympiadStudents}=load('lib/olympiad-participation-summary.ts');
 const named=(id,group,gender,first='baloncesto',second='voleibol')=>({...student(id,first,second),group,response:{...student(id,first,second).response,gender}});
 const roster=[named('mA','1ºA Bachillerato','masculino','atletismo-longitud','atletismo-2000'),named('fA','1ºA Bachillerato','femenino','atletismo-2000','baloncesto'),named('mB','1ºB Bachillerato','masculino','voleibol','atletismo-peso'),named('fB','1ºB Bachillerato','femenino'),named('otherA','1ºA Bachillerato','no-indicado'),named('otherB','1ºB Bachillerato','otra-identidad'),{...student('no',null,null,false),group:'1ºA Bachillerato'},{...student('pending'),group:'1ºA Bachillerato'}];
 const snapshot=JSON.stringify(roster);
 assert.equal(filterOlympiadStudents(roster,'','femenino').length,2);
 assert.equal(filterOlympiadStudents(roster,'1ºB Bachillerato','femenino')[0].id,'fB');
 assert.equal(filterOlympiadStudents(roster,'1ºA Bachillerato','masculino')[0].id,'mA');
 assert.equal(filterOlympiadStudents(roster,'','other').length,4,'Keep other identities, unspecified gender, No and pending responses available.');
 const breakdown=summarizeOlympiadParticipation(roster).sports.find(row=>row.sport==='Atletismo');
 assert.equal(breakdown.interested,3);assert.equal(breakdown.genders.masculino,2);assert.equal(breakdown.genders.femenino,1);assert.equal(breakdown.genders.other,0);
 let state=[],cursor=0;
 const hooks={useState(initial){const i=cursor++;if(!(i in state))state[i]=initial;return [state[i],value=>{state[i]=value;}];}};
 const jsx={jsx:(type,props,key)=>({type,props,key}),jsxs:(type,props,key)=>({type,props,key}),Fragment:'fragment'};
 const teacher=load('components/teacher-olympiad-responses.tsx',{'react':hooks,'react/jsx-runtime':jsx,'next/navigation':{useRouter:()=>({refresh(){}})}});
 const nodes=n=>Array.isArray(n)?n.flatMap(nodes):n&&typeof n==='object'?[n,...nodes(n.props?.children)]:[];
 const render=()=>{cursor=0;return nodes(teacher.TeacherOlympiadResponses({students:roster}));};
 const select=(tree,label)=>nodes(tree.find(n=>n.type==='label'&&n.props.children?.[0]===label)).find(n=>n.type==='select');
 const tableNames=tree=>nodes(tree.find(n=>n.type==='tbody')).filter(n=>n.type==='th').map(n=>n.props.children).join(',');
 const summaryRows=tree=>tree.find(n=>typeof n.type==='function'&&Array.isArray(n.props?.students)).props.students;
 let tree=render();assert.equal(summaryRows(tree).length,8);
 select(tree,'Género').props.onChange({target:{value:'femenino'}});tree=render();
 assert.equal(summaryRows(tree).length,2);assert.equal(tableNames(tree),'Alumno fA,Alumno fB');
 select(tree,'Grupo').props.onChange({target:{value:'1ºB Bachillerato'}});tree=render();
 assert.equal(tableNames(tree),'Alumno fB');assert.equal(summaryRows(tree)[0].id,'fB');
 select(tree,'Respuesta').props.onChange({target:{value:'no'}});tree=render();assert.equal(tableNames(tree),'');
 assert.equal(summaryRows(tree)[0].id,'fB','The existing response filter affects the table, while gender/group apply to both summaries and table.');
 select(tree,'Respuesta').props.onChange({target:{value:''}});select(tree,'Género').props.onChange({target:{value:'other'}});select(tree,'Grupo').props.onChange({target:{value:''}});tree=render();
 assert.equal(summaryRows(tree).length,4);assert.ok(tableNames(tree).includes('Alumno no'));assert.ok(tableNames(tree).includes('Alumno pending'));
 select(tree,'Género').props.onChange({target:{value:''}});tree=render();assert.equal(summaryRows(tree).length,8);assert.equal(JSON.stringify(roster),snapshot);
 const genderHtml=renderToStaticMarkup(React.createElement(ui.TeacherOlympiadSummary,{students:roster}));
 assert.ok(genderHtml.includes('Masculino: 2'));assert.ok(genderHtml.includes('Femenino: 1'));assert.ok(genderHtml.includes('Otros / sin dato:'));
 console.log('Olympiad genders: actual controls compose class/gender/status, per-sport unique M/F counts, first/second choices and all unknown/declined/pending records preserved.');
}
(async()=>{
 let saves=0,saved=null,deny=false,fail=false;
 const route=load('app/api/olimpiada-lisboa/route.ts',{'next/server':{NextResponse:{json:(body,options={})=>new Response(JSON.stringify(body),{...options,headers:{'content-type':'application/json',...options.headers}})}},'@/app/alumno/olimpiada-lisboa/actions':{saveOlympiadAnswer:async input=>{if(deny)throw Object.assign(new Error('Redirect'),{digest:'NEXT_REDIRECT;replace;/auth/login;307;'});if(fail)throw Error('Guardado no disponible');saves++;saved={student_id:'own',...helper.validateOlympiadAnswer(input),updated_at:'2026-10-27T12:00:00Z'};return saved;}}});
 const fetches=[];
 const client=load('lib/olympiad-response-client.ts',{}, {fetch:async (url,options)=>{fetches.push({url,options});return route.POST(new Request('https://school.test'+url,{...options,headers:{...options.headers,Origin:'https://school.test'}}));}});
 const no=await client.submitOlympiadResponse({participating:false,gender:'old',first_choice:'old',second_choice:'old'});
 assert.equal(no.participating,false);assert.equal(no.gender,null);assert.equal(no.first_choice,null);assert.equal(saves,1);
 assert.equal(fetches[0].url,'/api/olimpiada-lisboa');assert.equal(fetches[0].options.method,'POST');assert.equal(fetches[0].options.credentials,'same-origin');
 assert.equal(JSON.parse(fetches[0].options.body).participating,false,'A false answer must actually be sent.');
 await client.submitOlympiadResponse({participating:false});assert.equal(saves,2,'Saving No again is permitted.');
 const yes={participating:true,gender:'femenino',first_choice:'futbol-sala',second_choice:'voleibol'};
 await client.submitOlympiadResponse(yes);assert.equal(saved.first_choice,'futbol-sala');
 await client.submitOlympiadResponse({...yes,participating:false});assert.equal(saved.second_choice,null,'Changing Yes to No clears unneeded choices.');
 let before=saves;
 const invalid=await route.POST(new Request('https://school.test/api/olimpiada-lisboa',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...yes,second_choice:yes.first_choice})}));assert.equal(invalid.status,400);assert.equal(saves,before);
 const csrf=await route.POST(new Request('https://school.test/api/olimpiada-lisboa',{method:'POST',headers:{'content-type':'application/json',origin:'https://other.test'},body:JSON.stringify(yes)}));assert.equal(csrf.status,403);assert.equal(saves,before);
 deny=true;await assert.rejects(()=>client.submitOlympiadResponse({participating:false}),/sesión ha caducado/);assert.equal(saves,before);deny=false;
 fail=true;await assert.rejects(()=>client.submitOlympiadResponse({participating:false}),/Guardado no disponible/);fail=false;
 const badClient=load('lib/olympiad-response-client.ts',{}, {fetch:async()=>new Response('<html>Login</html>',{status:200})});await assert.rejects(()=>badClient.submitOlympiadResponse({participating:false}),/No se ha podido guardar/);
 console.log('Olympiad fix: actual HTTP client→route→saved response roundtrip for No/Yes, repeated No, stale field cleanup, session/errors/CSRF, sport priorities, unique counts, declined versus pending and class isolation passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});

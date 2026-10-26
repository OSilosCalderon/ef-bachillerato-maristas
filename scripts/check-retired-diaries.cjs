const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
function load(file,imports={}) {
  const module={exports:{}};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020}}).outputText,{module,exports:module.exports,require:name=>Object.hasOwn(imports,name)?imports[name]:require(name),Intl,Date});
  return module.exports;
}
const mocks={
  'next/link':{__esModule:true,default:({href,children,...props})=>React.createElement('a',{href,...props},children)},
  'next/navigation':{usePathname:()=>'/alumno/sa1',redirect:href=>{throw new Error(`REDIRECT:${href}`);}},
  '@/components/dashboard-header':{DashboardHeader:()=>null},
  '@/components/sa1-layout':{Sa1Layout:({children})=>children},
  '@/components/sa2-layout':{Sa2Layout:({children})=>children},
};
for(const [file,name] of [['components/sa1-section-nav.tsx','Sa1SectionNav'],['components/sa2-section-nav.tsx','Sa2SectionNav'],['app/alumno/sa1/page.tsx','default'],['app/alumno/sa2/page.tsx','default']]) {
  const html=renderToStaticMarkup(React.createElement(load(file,mocks)[name]));
  assert.ok(!html.includes('/diario'),'Obsolete diaries must not appear in pupil navigation or cards.');
  assert.ok(!html.includes('Diario de sesiones')&&!html.includes('Diario deportivo'));
  if(file.includes('sa1'))assert.ok(html.includes('/alumno/sa1/seguimiento'),'Keep personal-plan follow-up accessible.');
}
for(const file of ['app/alumno/sa1/diario/page.tsx','app/alumno/sa2/diario/page.tsx']) assert.throws(()=>load(file,mocks).default(),/REDIRECT:\/alumno\/sa1\/seguimiento/,'Old bookmarks must redirect without rendering a diary form.');
const gradebook=load('lib/gradebook.ts');
const items=[{id:'old',course_id:'c1',sa_code:'SA2',item_key:'sports-journal',title:'Diario deportivo',position:1},{id:'plan',course_id:'c1',sa_code:'SA1',item_key:'session-follow-up',title:'Diario y seguimiento',position:1}];
const grades=[{id:'grade',student_id:'a',item_id:'old',score:0,comment:'Comentario anterior conservado',published_at:'2026-10-26'}];
const snapshot=JSON.stringify({items,grades});
assert.equal(gradebook.gradesForStudent(items,grades,'b','c1').length,1,'An ungraded retired diary is no longer a pending grade.');
const own=gradebook.gradesForStudent(items,grades,'a','c1');
assert.equal(own.length,2);assert.equal(own.find(row=>row.item.id==='old').grade.score,0);
assert.equal(own.find(row=>row.item.id==='old').grade.comment,'Comentario anterior conservado');
assert.equal(own.find(row=>row.item.id==='old').item.title,'Registro anterior · Diario deportivo');
assert.equal(own.find(row=>row.item.id==='plan').item.title,'Seguimiento del plan personal');
assert.equal(JSON.stringify({items,grades}),snapshot,'Retiring a display must not alter historical grades or metadata.');
console.log('Retired diaries: pupil navigation/cards, bookmarked redirects, plan follow-up and all historical grades preserved.');

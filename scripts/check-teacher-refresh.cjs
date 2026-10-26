// Exercise the actual component handlers with deterministic React hook state.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = process.cwd();
let state = [], cursor = 0, tasks = [], fail = false, calls = [], destination;
const originalLoad = Module._load;
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function(request, parent, ...args) {
  return originalResolve.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, parent, ...args);
};
Module._load = function(request, parent, ...args) {
  if (request === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }), Fragment: 'fragment' };
  if (request === 'react') return {
    useState(initial) { const i = cursor++; if (!(i in state)) state[i] = typeof initial === "function" ? initial() : initial; return [state[i], value => { state[i] = typeof value === "function" ? value(state[i]) : value; }]; },
    useTransition() { return [false, fn => { tasks.push(Promise.resolve(fn())); }]; },
  };
  if (request === 'lucide-react') return { FileDown: () => null };
  if (request === '@/lib/personal-plan-pdf') return { downloadPersonalPlanPdf: () => {} };
  if (request === '@/lib/personal-plan-tasks') return { methodologyLabels: {}, normalizeItems: () => [] };
  if (request === 'next/link') return { __esModule: true, default: 'a' };
  if (request === 'next/navigation') return { useRouter: () => ({ push: value => { destination = value; } }) };
  if (request === '@/app/profesor/actions') return { refreshTeacherActivity: async year => { calls.push(year); if (fail) throw Error('Offline'); return fresh; } };
  if (request === '@/components/teacher-student-checklist') return { TeacherStudentChecklist: () => null };
  if (request === '@/components/teacher-session-grading') return { TeacherSessionEvaluationForm: () => null };
  if (request === '@/lib/second-year-progress') return { physicalCapacity: () => 'Fuerza' };
  if (request === '@/components/teacher-psychological-reports') return { TeacherPsychologicalReports: () => null };
  if (request === '@/components/physical-radar-chart') return { PhysicalRadarChart: () => null };
  return originalLoad.call(this, request, parent, ...args);
};
for (const ext of ['.ts', '.tsx']) Module._extensions[ext] = (mod, filename) => mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
const { TeacherActivityDashboard } = require(path.join(root, 'components/teacher-activity-dashboard.tsx'));
const data = { students: [{ id: 's', courseId: 'c2', name: 'Test pupil', group: 'Test group' }], activities: [], situations: [{ id: 'a', code: 'SA1', title: 'Start' }, { id: 'b', code: 'SA2', title: 'Training' }], assessmentItems: [{id:'plan',course_id:'c2',sa_code:'SA1',item_key:'personal-plan',title:'Plan personal',position:1}], assessmentGrades: [], physicalTests: [], courseName: 'Test course', loadedAt: '2026-09-18T08:00:00Z' };
const fresh = { ...data, loadedAt: '2026-09-18T08:01:00Z', activities: [{ id: 'new', studentId: 's', sa: 'SA1', category: 'plans', title: 'New saved plan', date: '2026-09-18', status: 'active', score: null, details: {} }] };
const nodes = node => Array.isArray(node) ? node.flatMap(nodes) : node && typeof node === 'object' ? [node, ...nodes(node.props?.children)] : [];
const render = (initialSituation = 'SA1') => { cursor = 0; return nodes(TeacherActivityDashboard({ data, year: 2, initialSituation })); };
const button = tree => tree.find(node => node.type === 'button' && node.props.children === 'Actualizar datos');
(async () => {
  let tree = render();
  const select = (tree,label) => tree.find(node => node.type === 'select' && node.props['aria-label']===label);
  assert.equal(select(tree,'Situación').props.value,'SA1');
  select(tree,'Grupo').props.onChange({target:{value:'Test group'}});
  select(tree,'Vista').props.onChange({target:{value:'individual'}});
  assert.equal(select(render(),'Situación').props.value,'','Individual view must open the whole pupil record.');
  button(render()).props.onClick(); await Promise.all(tasks); tasks = [];
  tree = render();
  assert.deepEqual(calls, [2]);
  assert.ok(tree.some(node => node.props?.children === 'Datos actualizados correctamente.'));
  assert.ok(tree.some(node => node.type === 'summary' && JSON.stringify(node.props.children).includes('New saved plan')));
  assert.equal(select(tree,'Grupo').props.value, 'Test group');
  assert.equal(select(tree,'Vista').props.value, 'individual');
  state[0].activities.push({id:'log',studentId:'s',sa:'SA2',category:'journals',title:'Sesión 1',date:'2026-10-26',status:'completed',score:100,details:{id:'log',session_number:1,teacher_score:8}});
  tree=render();
  const checklist=tree.find(node=>typeof node.props?.renderGrades==='function');
  checklist.props.renderGrades('SA1').props.onPublished({id:'new-grade',student_id:'s',item_id:'plan',score:0,comment:'Nota confirmada',published_at:'2026-10-26'});
  tree=render();
  const savedChecklist=tree.find(node=>typeof node.props?.renderGrades==='function');
  assert.equal(savedChecklist.props.renderGrades('SA1').props.entries[0].grade.score,0,'Publishing a block must update results immediately, including a zero.');
  const sessionRow=state[0].activities.find(row=>row.id==='log');
  const inline=nodes(savedChecklist.props.renderRecord(sessionRow)).find(node=>typeof node.props?.onSaved==='function');
  assert.ok(inline,'Session grades can be edited inside the results.');
  inline.props.onSaved({score:0,absent:true,comment:'Ausencia confirmada',updatedAt:'2026-10-27'});
  tree=render();
  const updatedChecklist=tree.find(node=>typeof node.props?.renderGrades==='function');
  assert.equal(updatedChecklist.props.summary.props.summary.mean,null,'Saving an absence updates the visible mean immediately.');
  assert.equal(updatedChecklist.props.summary.props.summary.points,1,'A teacher edit must preserve the existing pupil valuation.');
  assert.equal(state[0].activities.find(row=>row.id==='log').details.teacher_absent,true);
  fail = true; button(tree).props.onClick(); await Promise.all(tasks);
  tree = render();
  assert.ok(tree.some(node => node.props?.role === 'alert'));
  assert.ok(tree.some(node => node.type === 'summary' && JSON.stringify(node.props.children).includes('New saved plan')));
  select(tree,'Situación').props.onChange({target:{value:'SA2'}});
  assert.equal(select(render(),'Situación').props.value,'SA2');
  select(tree,'Curso de los resultados').props.onChange({target:{value:'1'}});await Promise.all(tasks);tasks=[];
  assert.equal(destination,'/profesor?curso=1');
  state = []; tree = render('SA2');
  assert.ok(tree.some(node => node.type === 'a' && node.props.href === '/profesor/calificar-sesiones?curso=2'), 'SA2 debe ofrecer un acceso visible a las calificaciones.');
  state = []; tree = render('SA1');
  assert.ok(!tree.some(node => node.type === 'a' && node.props.href === '/profesor/calificar-sesiones?curso=2'), 'Las calificaciones de 2º SA2 no deben mostrarse en SA1.');
  console.log('Teacher refresh: fresh records, preserved filters, failure recovery and second-year SA navigation passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });



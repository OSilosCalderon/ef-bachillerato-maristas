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
    useState(initial) { const i = cursor++; if (!(i in state)) state[i] = initial; return [state[i], value => { state[i] = value; }]; },
    useTransition() { return [false, fn => { tasks.push(Promise.resolve(fn())); }]; },
  };
  if (request === 'next/navigation') return { useRouter: () => ({ push: value => { destination = value; } }) };
  if (request === '@/app/profesor/actions') return { refreshTeacherActivity: async year => { calls.push(year); if (fail) throw Error('Offline'); return fresh; } };
  if (request === '@/components/teacher-psychological-reports') return { TeacherPsychologicalReports: () => null };
  return originalLoad.call(this, request, parent, ...args);
};
for (const ext of ['.ts', '.tsx']) Module._extensions[ext] = (mod, filename) => mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020 } }).outputText, filename);
const { TeacherActivityDashboard } = require(path.join(root, 'components/teacher-activity-dashboard.tsx'));
const data = { students: [{ id: 's', name: 'Test pupil', group: 'Test group' }], activities: [], situations: [{ id: 'a', code: 'SA1', title: 'Start' }, { id: 'b', code: 'SA2', title: 'Training' }], physicalTests: [], courseName: 'Test course', loadedAt: '2026-09-18T08:00:00Z' };
const fresh = { ...data, loadedAt: '2026-09-18T08:01:00Z', activities: [{ id: 'new', studentId: 's', sa: 'SA1', category: 'plans', title: 'New saved plan', date: '2026-09-18', status: 'active', score: null, details: {} }] };
const nodes = node => Array.isArray(node) ? node.flatMap(nodes) : node && typeof node === 'object' ? [node, ...nodes(node.props?.children)] : [];
const render = (initialSituation = 'SA1') => { cursor = 0; return nodes(TeacherActivityDashboard({ data, year: 2, initialSituation })); };
const button = tree => tree.find(node => node.type === 'button' && node.props.children === 'Actualizar datos');
(async () => {
  let tree = render();
  const selects = tree.filter(node => node.type === 'select');
  assert.equal(selects[2].props.value, 'SA1');
  selects[1].props.onChange({ target: { value: 'Test group' } });
  selects[3].props.onChange({ target: { value: 'individual' } });
  button(render()).props.onClick(); await Promise.all(tasks); tasks = [];
  tree = render();
  assert.deepEqual(calls, [2]);
  assert.ok(tree.some(node => node.props?.children === 'Datos actualizados correctamente.'));
  assert.ok(tree.some(node => node.type === 'summary' && JSON.stringify(node.props.children).includes('New saved plan')));
  assert.equal(tree.filter(node => node.type === 'select')[1].props.value, 'Test group');
  assert.equal(tree.filter(node => node.type === 'select')[3].props.value, 'individual');
  fail = true; button(tree).props.onClick(); await Promise.all(tasks);
  tree = render();
  assert.ok(tree.some(node => node.props?.role === 'alert'));
  assert.ok(tree.some(node => node.type === 'summary' && JSON.stringify(node.props.children).includes('New saved plan')));
  tree.filter(node => node.type === 'select')[2].props.onChange({ target: { value: 'SA2' } });
  assert.equal(destination, '/profesor/2bach/sa2');
  console.log('Teacher refresh: fresh records, preserved filters, failure recovery and second-year SA navigation passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });

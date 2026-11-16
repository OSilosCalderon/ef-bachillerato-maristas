const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const source = fs.readFileSync(path.join(__dirname, "../components/second-year-sports-event-project.tsx"), "utf8");
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
}).outputText;

const key = { student_id: "alumno-prueba", course_id: "curso-prueba", sa_code: "SA4" };
const fixture = { ...key, event_name: "Torneo guardado", purpose: "Dar cabida a todo el grupo", rules: "Cuatro equipos", status: "planning" };

function createProjectTest(project) {
  let cursor = 0;
  let effects = [];
  const slots = [];
  const requests = [];
  const writes = [];
  const api = {
    project,
    readError: false,
    saveError: false,
    auth: { getUser: async () => ({ data: { user: { id: "perfil-prueba" } } }) },
    from(table) {
      const filters = {};
      let payload;
      const query = {
        select() { return query; },
        eq(column, value) { filters[column] = value; return query; },
        async single() {
          if (table === "students") {
            assert.deepEqual(filters, { profile_id: "perfil-prueba", active: true });
            return { data: { id: key.student_id, course_id: key.course_id } };
          }
          assert.ok(payload);
          writes.push(payload);
          if (api.saveError) return { error: { message: "Fallo de escritura simulado" } };
          api.project = { ...api.project, ...payload };
          return { data: { id: "proyecto-prueba" } };
        },
        async maybeSingle() {
          assert.equal(table, "sports_event_projects");
          assert.deepEqual(filters, key);
          requests.push({ ...filters });
          return api.readError
            ? { data: null, error: { message: "Fallo de lectura simulado" } }
            : { data: api.project, error: null };
        },
        upsert(row, options) {
          assert.equal(table, "sports_event_projects");
          assert.equal(options.onConflict, "student_id,course_id,sa_code");
          payload = row;
          return query;
        },
      };
      return query;
    },
  };
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], (next) => { slots[index] = typeof next === "function" ? next(slots[index]) : next; }];
    },
    useRef(initial) {
      const index = cursor++;
      return slots[index] ??= { current: initial };
    },
    useMemo(compute) { return compute(); },
    useEffect(effect, deps) {
      const index = cursor++;
      const previous = slots[index];
      if (previous && deps.every((value, i) => Object.is(value, previous.deps[i]))) return;
      effects.push(() => {
        previous?.cleanup?.();
        slots[index] = { deps, cleanup: effect() };
      });
    },
  };
  const jsx = (type, props) => ({ type, props });
  const imports = { react, "react/jsx-runtime": { jsx, jsxs: jsx }, "lucide-react": {}, "@/lib/supabase/client": { createClient: () => api } };
  const module = { exports: {} };
  new Function("require", "module", "exports", code)((name) => imports[name], module, module.exports);
  const render = () => {
    cursor = 0;
    effects = [];
    const tree = flatten(module.exports.SecondYearSportsEventProject());
    effects.forEach((effect) => effect());
    return tree;
  };
  return { render, api, requests, writes };
}

function flatten(node) {
  if (Array.isArray(node)) return node.flatMap(flatten);
  return node?.props ? [node, ...flatten(node.props.children)] : [];
}

function button(tree, title) {
  return tree.find(({ type, props }) => type === "button" && [props.children].flat().includes(title));
}

const field = (tree, label) => tree.find(({ props }) => props.label === label);
const renderAfterRequests = async (test) => {
  await new Promise((resolve) => setImmediate(resolve));
  return test.render();
};

(async () => {
  const existing = createProjectTest({ ...fixture });
  existing.api.readError = true;
  assert.equal(button(existing.render(), "Guardar proyecto"), undefined, "Saving is unavailable while loading.");
  let view = await renderAfterRequests(existing);
  assert.equal(button(view, "Guardar proyecto"), undefined, "A failed read must never open an empty editor.");
  assert.ok(view.some(({ props }) => props.role === "alert"));
  assert.deepEqual(existing.api.project, fixture);
  assert.equal(existing.writes.length, 0);

  existing.api.readError = false;
  button(view, "Reintentar carga").props.onClick();
  assert.equal(button(existing.render(), "Guardar proyecto"), undefined);
  view = await renderAfterRequests(existing);
  assert.equal(existing.requests.length, 2);
  assert.equal(field(view, "Nombre del evento").props.value, fixture.event_name);
  assert.equal(field(view, "Finalidad del evento").props.value, fixture.purpose);
  assert.equal(field(view, "Reglamento básico").props.value, fixture.rules);

  field(view, "Nombre del evento").props.onChange("Nuevo título");
  existing.api.saveError = true;
  const pressSave = button(existing.render(), "Guardar proyecto").props.onClick;
  pressSave();
  pressSave();
  const savingButton = button(existing.render(), "Guardando proyecto…");
  assert.equal(savingButton.props["aria-disabled"], true);
  assert.notEqual(savingButton.props.disabled, true, "The pending button must keep keyboard focus.");
  savingButton.props.onClick();
  view = await renderAfterRequests(existing);
  assert.equal(existing.writes.length, 1, "Repeated activation during a save must send a single write.");
  assert.equal(button(view, "Guardar proyecto").props["aria-disabled"], false);
  assert.equal(field(view, "Nombre del evento").props.value, "Nuevo título");
  assert.ok(view.some(({ props }) => props.role === "alert" && props.children.includes("Tus cambios siguen en el formulario")));
  assert.deepEqual(existing.api.project, fixture);
  existing.api.saveError = false;
  button(view, "Guardar proyecto").props.onClick();
  view = await renderAfterRequests(existing);
  assert.ok(view.some(({ props }) => props.role === "status" && typeof props.children === "string" && props.children.startsWith("Proyecto guardado")));
  assert.equal(existing.api.project.event_name, "Nuevo título");
  assert.equal(existing.api.project.purpose, fixture.purpose);
  assert.equal(existing.api.project.rules, fixture.rules);

  const newProject = createProjectTest(null);
  newProject.render();
  view = await renderAfterRequests(newProject);
  assert.ok(view.some(({ props }) => props.role === "status" && typeof props.children === "string" && props.children.includes("Aún no tienes un proyecto guardado")));
  assert.ok(button(view, "Guardar proyecto"), "A successful empty read allows a first project.");
  assert.equal(newProject.writes.length, 0);
  console.log("SA4 project: read failure blocks writing, retry restores data, repeated saves are blocked without disabling focus, failed save preserves edits and an empty read allows creation.");
})().catch((error) => { console.error(error); process.exitCode = 1; });

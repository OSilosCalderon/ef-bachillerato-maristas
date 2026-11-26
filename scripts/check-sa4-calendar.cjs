const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const cache = {};
function load(name) {
  if (cache[name]) return cache[name];
  const api = {};
  const file = path.join(__dirname, '../lib', name + '.ts');
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('exports', 'require', code)(api, (p) => load(p.replace('./', '')));
  cache[name] = api; return api;
}
const { tournamentWeeks, tournamentCalendar, sportClarifications, shortSportName, countryFlag } = load('sa4-tournament-calendar');
const weeks = tournamentWeeks(8);
assert.deepEqual(weeks.map(w => w.start), ['2026-11-30','2026-12-14','2027-01-11','2027-01-18','2027-01-25','2027-02-01','2027-02-15','2027-02-22']);
assert.equal(weeks.at(-1).end, '2027-02-25');
assert.equal(new Set(weeks.flatMap(w => w.classes.map(s => s.date))).size,32);
for (const w of weeks) {
  assert.equal(w.classes.length,4);
  assert.equal(new Date(w.start+'T12:00:00Z').getUTCDay(),1);
  assert.equal(new Date(w.end+'T12:00:00Z').getUTCDay(),4);
  assert.deepEqual(w.classes.map(s=>s.start),['10:05','13:20','10:05','13:20']);
  assert.ok(!w.classes.some(s=>s.date>='2026-12-23'&&s.date<='2027-01-07'));
}
assert.deepEqual(tournamentWeeks(0),[]);
const workspace={delegations:[{country_code:'JP',country:'Japón',position:2,members:[]},{country_code:'ES',country:'España',position:1,members:[]}],steps:[]};
const original=JSON.stringify(workspace);
const calendar=tournamentCalendar(workspace);
assert.equal(calendar[0].delegation.country_code,'ES');
assert.equal(calendar[0].sport.sport,'');
assert.equal(calendar[1].week.start,'2026-12-14');
assert.equal(JSON.stringify(workspace),original,'Reading the calendar must not modify saved team work');
assert.deepEqual(tournamentCalendar({delegations:[],steps:[]}),[]);
assert.equal(shortSportName('El deporte elegido es el Quadraball, un deporte inventado. Más texto'), 'Quadraball');
assert.equal(shortSportName(''), 'Deporte pendiente');
assert.equal(countryFlag('ES'),'🇪🇸'); assert.equal(countryFlag('bad'),'');
const sport={...calendar[0].sport,sport:'Pádel',rules:'Se golpea un volante',scoring:'',objective:''};
assert.equal(sportClarifications(sport).length,1);
assert.equal(sportClarifications({...sport,sport:'Bádminton',rules:'Final a 21 puntos',scoring:'A 11 puntos'}).length,1);
assert.equal(sportClarifications({...sport,sport:'Giro de relevos',rules:'Lanzar al pallino'}).length,1);
assert.equal(sportClarifications({...sport,sport:'Fútbol',rules:'Sin portero'}).length,0);
console.log('SA4 calendar: 8 full teaching weeks, 32 unique classes, holidays, year change, stable delegation order, empty proposals and rule clarifications passed.');

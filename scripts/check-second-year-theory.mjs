import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
const cache = new Map();
function load(file) {
  const absolute = path.resolve(file);
  if (cache.has(absolute)) return cache.get(absolute).exports;
  const module = { exports: {} }; cache.set(absolute, module);
  const js = ts.transpileModule(fs.readFileSync(absolute, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const require = (id) => load(id.startsWith("@/") ? `${id.slice(2)}.ts` : path.resolve(path.dirname(absolute), `${id}.ts`));
  vm.runInNewContext(js, { module, exports: module.exports, require }, { filename: absolute });
  return module.exports;
}
const { secondYearTheoryTopics: topics } = load("lib/second-year-theory-topics.ts");
const { secondYearMastery, secondYearQuizScore, SECOND_YEAR_PASS_SCORE } = load("lib/second-year-theory-assessment.ts");
assert.equal(topics.length, 6);
assert.equal(new Set(topics.map(t => t.slug)).size, 6);
for (const [index, topic] of topics.entries()) {
  assert.equal(topic.number, index + 1);
  assert.ok(topic.slug.startsWith(`2bach-sa${index + 1}-`));
  const route = fs.readFileSync(`app/alumno/2bach/sa${index + 1}/teoria/page.tsx`, "utf8");
  assert.ok(route.includes(`initialSlug="${topic.slug}"`), `Wrong theory route for ${topic.sa}`);
  assert.ok(route.includes("SecondYearTheoryReader"));
  assert.ok(topic.foundation && topic.sections.length >= 4 && topic.concepts.length >= 4 && topic.cases.length >= 2 && topic.challenge && topic.extension && topic.sources.length);
  assert.ok(topic.quiz.length >= 3 && topic.quiz.length <= 4);
  for (const question of topic.quiz) {
    assert.ok(question.correct >= 0 && question.correct < question.options.length);
    assert.ok(question.feedback && new Set(question.options).size === question.options.length);
  }
  for (const link of topic.sourceLinks) assert.ok(link.url.startsWith("https://"));
}
const slugs = topics.map(t => t.slug);
assert.equal(secondYearQuizScore(2, 3), SECOND_YEAR_PASS_SCORE);
assert.ok(secondYearQuizScore(1, 3) < SECOND_YEAR_PASS_SCORE);
assert.equal(secondYearQuizScore(3, 4), 75);
assert.equal(secondYearMastery(slugs, {}), 0);
const progress = {
  [slugs[0]]: { completed: true, quizScore: null },
  [slugs[1]]: { completed: false, quizScore: 100 },
  "1bach-example": { completed: true, quizScore: 100 },
};
assert.equal(secondYearMastery(slugs, progress), 0, "Separate reading and test must not count as mastery");
progress[slugs[0]].quizScore = 67;
assert.equal(secondYearMastery(slugs, progress), 17);
assert.equal(secondYearMastery(slugs, Object.fromEntries(slugs.map(slug => [slug, { completed: true, quizScore: 100 }]))), 100);
console.log("Second-year theory: six routes, content, quizzes, threshold and isolated mastery passed.");

import { physicalBenchmark } from "@/lib/sa1-types";
import type { AssessmentPeriod, FitnessReference, PhysicalTest } from "@/lib/sa1-types";
import type { TheoryTopicProgress } from "@/lib/training-theory-data";
import { SECOND_YEAR_PASS_SCORE } from "@/lib/second-year-theory-assessment";

export function theoryProgressTotals(slugs: string[], progress: Record<string, TheoryTopicProgress>) {
  const items = slugs.map((slug) => progress[slug]);
  const read = items.filter((item) => item?.completed).length;
  const scores = items.map((item) => item?.quizScore).filter((score): score is number => score != null && Number.isFinite(score) && score >= 0 && score <= 100);
  const passed = scores.filter((score) => score >= SECOND_YEAR_PASS_SCORE).length;
  const percent = (count: number) => slugs.length ? Math.round(count / slugs.length * 100) : 0;
  return {
    total: slugs.length, read, attempted: scores.length, passed,
    readPercent: percent(read), attemptedPercent: percent(scores.length), passedPercent: percent(passed),
    averageScore: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null,
  };
}

// Cada prueba aporta 100 puntos cuando iguala su referencia, también en pruebas cronometradas.
// Se suman índices comparables, nunca metros, segundos y repeticiones entre sí.
export function physicalPeriodTotals(tests: PhysicalTest[], period: AssessmentPeriod, reference: FitnessReference | null) {
  const recorded = tests.filter((test) => test[period] != null && Number.isFinite(test[period])).length;
  const indexes = reference ? tests.map((test) => secondYearPhysicalComparison(test, test[period], reference)?.index)
    .filter((index): index is number => index != null && Number.isFinite(index)) : [];
  const points = indexes.length ? indexes.reduce((sum, index) => sum + index, 0) : null;
  const benchmarkPoints = indexes.length ? indexes.length * 100 : null;
  return { recorded, compared: indexes.length, points, benchmarkPoints, index: points != null && benchmarkPoints != null ? points / benchmarkPoints * 100 : null };
}

export function secondYearPhysicalComparison(test: PhysicalTest, value: number | undefined, reference: FitnessReference) {
  const benchmark = physicalBenchmark(test, reference);
  if (value == null || !Number.isFinite(value) || value < 0 || benchmark == null || !Number.isFinite(benchmark) || benchmark <= 0) return null;
  if (test.direction === "lower_better" && value === 0) return null;
  return { benchmark, index: test.direction === "higher_better" ? value / benchmark * 100 : benchmark / value * 100 };
}

export function physicalCapacity(name: string) {
  const value = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (/cooper|navette|resistencia/.test(value)) return "Resistencia";
  if (/flexibilidad|sit.*reach|hombro|lateral.*tronco|extension.*tronco/.test(value)) return "Flexibilidad / movilidad";
  if (/abdomin|flexiones|salto|fuerza/.test(value)) return "Fuerza";
  if (/30\s*m|60\s*m|5\s*[x×]\s*10|velocidad|agilidad/.test(value)) return "Velocidad";
  return "Otras pruebas";
}

export function physicalCapacityTotals(tests: PhysicalTest[], reference: FitnessReference | null) {
  return ["Fuerza", "Resistencia", "Velocidad", "Flexibilidad / movilidad", "Otras pruebas"].map((capacity) => {
    const group = tests.filter((test) => physicalCapacity(test.name) === capacity);
    const paired = group.filter((test) => reference && secondYearPhysicalComparison(test, test.september, reference) && secondYearPhysicalComparison(test, test.december, reference));
    return { capacity, tests: group, september: physicalPeriodTotals(group, "september", reference), december: physicalPeriodTotals(group, "december", reference), pairedCount: paired.length,
      pairedSeptember: physicalPeriodTotals(paired, "september", reference).index,
      pairedDecember: physicalPeriodTotals(paired, "december", reference).index };
  }).filter((group) => group.tests.length);
}

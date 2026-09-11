import type { DemoQuestionnaire, JournalEntry, PhysicalTest, TheoryContent } from "@/lib/sa1-types";

export const physicalTests: PhysicalTest[] = [
  { id: "navette", name: "Course Navette", description: "Registro de demostración de resistencia.", unit: "periodos", direction: "higher_better", instructions: "Sigue el protocolo indicado por el profesorado.", active: true, september: 6.5, november: 7.2 },
  { id: "jump", name: "Salto horizontal", description: "Registro de demostración de fuerza explosiva.", unit: "cm", direction: "higher_better", instructions: "Realiza el intento según las indicaciones de clase.", active: true, september: 178, november: 184 },
  { id: "speed", name: "Velocidad", description: "Registro de demostración de tiempo.", unit: "s", direction: "lower_better", instructions: "Completa la distancia definida por el profesor.", active: true, september: 8.42, november: 8.31 },
  { id: "flex", name: "Flexibilidad", description: "Registro de demostración de movilidad.", unit: "cm", direction: "higher_better", instructions: "Aplica el protocolo explicado en clase.", active: true, september: 21, november: 21 },
  { id: "abs", name: "Abdominales", description: "Ejemplo editable por el profesorado.", unit: "repeticiones", direction: "higher_better", instructions: "Respeta el protocolo definido para la prueba.", active: false },
];

export const theoryContents: TheoryContent[] = [
  { id: "t1", title: "Principios básicos del entrenamiento", excerpt: "Conceptos para comprender cómo organizar una práctica física saludable y progresiva.", category: "Entrenamiento", publishedAt: "5 sep", read: true, documents: ["Ficha de síntesis.pdf"] },
  { id: "t2", title: "Calentamiento y vuelta a la calma", excerpt: "Funciones, estructura y criterios para preparar y cerrar una sesión.", category: "Práctica segura", publishedAt: "9 sep", read: true, hasImage: true },
  { id: "t3", title: "Carga, recuperación y adaptación", excerpt: "Una introducción a la relación entre estímulo, descanso y adaptación.", category: "Entrenamiento", publishedAt: "12 sep", read: false, links: ["Recurso complementario"] },
];

export const journalEntries: JournalEntry[] = [
  { id: "j1", date: "2026-09-08", title: "Sesión inicial de condición física", activity: "Organización de grupos, calentamiento y primeras tareas de valoración.", feeling: "Con energía y cómodo durante la mayor parte de la sesión.", learning: "He entendido cómo registrar el esfuerzo percibido.", difficulty: 2, effort: 6, reflection: "Quiero comparar mis sensaciones con las próximas sesiones sin centrarme solo en el resultado." },
  { id: "j2", date: "2026-09-10", title: "Trabajo de resistencia", activity: "Tareas progresivas por tiempo y control del ritmo.", feeling: "Al principio cómodo; al final necesité regular mejor el ritmo.", learning: "Empezar demasiado rápido hace más difícil mantener el esfuerzo.", difficulty: 3, effort: 7, reflection: "En la próxima sesión intentaré encontrar antes un ritmo sostenible." },
];

export const questionnaires: DemoQuestionnaire[] = [
  { id: "q1", title: "Cuestionario de hábitos de práctica", description: "Ejemplo genérico para probar el motor de cuestionarios. No es un test psicológico.", instructions: "Responde según tu experiencia habitual.", questionCount: 5, status: "completed", opensAt: "6 sep", closesAt: "20 sep" },
  { id: "q2", title: "Revisión de aprendizaje SA1", description: "Ejemplo académico sobre contenidos trabajados en clase.", instructions: "Lee cada pregunta y selecciona la respuesta que mejor corresponda.", questionCount: 8, status: "available", opensAt: "10 sep", closesAt: "30 sep" },
];

export const classEvolution = [
  { label: "Resistencia", september: 58, november: 66 },
  { label: "Salto", september: 61, november: 65 },
  { label: "Velocidad", september: 63, november: 67 },
  { label: "Flexibilidad", september: 60, november: 61 },
];

export const studentEvolution = [
  { label: "Resistencia", september: 54, november: 64 },
  { label: "Salto", september: 60, november: 66 },
  { label: "Velocidad", september: 62, november: 65 },
  { label: "Flexibilidad", september: 64, november: 64 },
];

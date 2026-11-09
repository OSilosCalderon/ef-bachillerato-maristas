export const teacherActivityStatuses: Record<string, string> = { draft: "Borrador", active: "En marcha", completed: "Finalizado", submitted: "Enviado", in_progress: "En curso", planned: "Planificado" };
const teacherActivityLabels: Record<string, string> = {
  question: "Pregunta", answers: "Respuestas guardadas", answer: "Respuesta del alumno/a", challenge_prompt: "Enunciado del reto", initial_analysis: "Análisis inicial", objective: "Objetivo", secondary_objective: "Segundo objetivo", priority_capacity: "Capacidad prioritaria", duration_weeks: "Semanas", weekly_frequency: "Frecuencia semanal", session_duration_minutes: "Minutos por sesión", progression_strategy: "Progresión", recovery_strategy: "Recuperación", success_indicator: "Indicador de logro", secondary_success_indicator: "Indicador del segundo objetivo", final_conclusions: "Conclusiones", future_work: "Trabajo futuro", plan_items: "Tareas del plan", activity: "Actividad", exercises: "Ejercicios", methodology: "Metodología", rounds: "Series", roundRecovery: "Descanso entre series (min)", dose: "Carga", recovery: "Descanso", sessionDate: "Fecha de la sesión", day: "Día", goal: "Objetivo", capacity: "Capacidad", description: "Descripción", title: "Título", activities: "Actividades", session_date: "Fecha de la sesión", feeling: "Sensaciones", learning: "Aprendizajes", reflection: "Reflexión", perceived_difficulty: "Dificultad percibida", perceived_effort: "Esfuerzo percibido", training_plan: "Trabajo de la sesión", content_worked: "Contenido trabajado", exercises_performed: "Ejercicios realizados", participation: "Participación", performance_perception: "Percepción del rendimiento", needs_improvement: "Aspectos a mejorar", session_number: "Sesión", week_number: "Semana", duration_minutes: "Duración (min)", rpe: "Esfuerzo percibido (RPE)", completion_percent: "Realización declarada (%)", modifications: "Adaptaciones", period: "Toma", value: "Marca", quiz_score: "Mejor resultado (%)", completed: "Lectura completada", focus_habit: "Hábito", initial_reflection: "Reflexión inicial", action_plan: "Acciones", barrier_strategy: "Dificultades y respuesta", final_reflection: "Reflexión final", sleep_routine: "Rutina de sueño", daily_movement: "Movimiento diario", sedentary_breaks: "Pausas activas", hydration: "Hidratación", balanced_eating: "Alimentación", goal_completion: "Cumplimiento del objetivo", next_adjustment: "Próximo ajuste", event_name: "Evento", purpose: "Propósito", target_audience: "Destinatarios", activity_type: "Actividad", event_format: "Formato", venue: "Lugar", event_date: "Fecha", participants_estimate: "Participantes previstos", team_name: "Equipo", personal_role: "Rol personal", team_roles: "Roles", rules: "Normas", inclusion_measures: "Inclusión", safety_measures: "Seguridad", materials: "Materiales", budget_items: "Presupuesto", timeline: "Calendario", communication_plan: "Comunicación", sustainability_measures: "Sostenibilidad", evaluation_plan: "Evaluación", instrument_code: "Cuestionario", assessment_phase: "Momento", total_score: "Puntuación", attempt_number: "Intento", status: "Estado",
};

teacherActivityLabels.results_analysis = "Evolución de mis resultados físicos";
teacherActivityLabels.goal_review = "Revisión de objetivos";
teacherActivityLabels.personal_learning = "Aprendizajes y sensaciones";
teacherActivityLabels.future_motivation = "Motivaciones y acciones de futuro";
teacherActivityLabels.course_year = "Curso de Bachillerato";
teacherActivityLabels.sa_code = "Situación de aprendizaje";

teacherActivityLabels.teacher_score = "Calificación del profesor (0–10)";
teacherActivityLabels.teacher_absent = "AUSENCIA";
teacherActivityLabels.teacher_comment = "Comentario del profesor";
teacherActivityLabels.teacher_evaluated_at = "Fecha de calificación";

teacherActivityLabels.success_indicator = "Cómo comprobaré mi objetivo principal";
teacherActivityLabels.rounds = "Series";
teacherActivityLabels.roundRecovery = "Descanso entre series (minutos)";

export function TeacherActivityDetail({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "") return <span className="text-slate-400">Sin completar</span>;
  if (Array.isArray(value)) return <ol className="list-inside list-decimal space-y-3">{value.map((entry, index) => <li key={index} className="rounded-lg bg-white p-3"><TeacherActivityDetail value={entry}/></li>)}</ol>;
  if (typeof value === "object") return <dl className="space-y-2">{Object.entries(value).filter(([key]) => !key.startsWith("_") && key !== "id" && !key.endsWith("_id") && key !== "exerciseId" && !["created_at", "updated_at", "recorded_at", "started_at", "submitted_at", "read_at", "topic_slug"].includes(key)).map(([key, entry]) => <div key={key}><dt className="text-xs font-bold text-slate-500">{teacherActivityLabels[key] ?? key.replaceAll("_", " ")}</dt><dd className="mt-1 whitespace-pre-wrap break-words"><TeacherActivityDetail value={entry}/></dd></div>)}</dl>;
  if (typeof value === "boolean") return <>{value ? "Sí" : "No"}</>;
  const word = String(value);
  return <>{teacherActivityStatuses[word] ?? ({ september: "Septiembre", december: "Diciembre", initial: "Inicial", final: "Final", circuit: "Circuit training", total: "Total training", custom: "Trabajo específico" } as Record<string, string>)[word] ?? word}</>;
}

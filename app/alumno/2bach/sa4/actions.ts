"use server";

import { createClient } from "@/lib/supabase/server";
import {
  eventMatches, eventSteps, projectSteps, validateLogoRanking, validateStep,
  type Delegation, type EventStep, type EventWorkspace, type LogoRanking, type SavedStep, type StepData,
} from "@/lib/sa4-event";

async function loadWorkspace(requestedCourse?: string): Promise<EventWorkspace> {
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) throw new Error("Vuelve a iniciar sesión para abrir el evento.");
  const profile = await supabase.from("profiles").select("role").eq("id", auth.user.id).single();
  if (profile.error || !profile.data) throw new Error("No se ha podido comprobar tu perfil. Reintenta la carga.");
  const teacher = profile.data.role === "teacher";
  const student = teacher ? null : await supabase.from("students").select("id,course_id").eq("profile_id", auth.user.id).eq("active", true).single();
  const courseId = teacher ? requestedCourse : student?.data?.course_id;
  if (!courseId || student?.error) throw new Error("No se ha podido encontrar tu curso. Consulta al profesor.");
  const course = await supabase.from("courses").select("id").eq("id", courseId).eq("bachillerato_year", 2).eq("is_active", true).maybeSingle();
  if (course.error || !course.data) throw new Error("No se ha encontrado un curso activo de 2.º de Bachillerato.");
  const [delegations, members, projects, settings, votes, ownVote] = await Promise.all([
    supabase.from("sa4_delegations").select("country_code,country,members,position").eq("course_id", courseId).order("position"),
    supabase.from("sa4_delegation_members").select("student_id,country_code").eq("course_id", courseId),
    supabase.from("sa4_team_projects").select("country_code,content,updated_at").eq("course_id", courseId),
    supabase.from("sa4_event_settings").select("phase").eq("course_id", courseId).maybeSingle(),
    supabase.from("sa4_logo_ballots").select("scores").eq("course_id", courseId),
    teacher ? Promise.resolve({ data: null, error: null }) : supabase.from("sa4_logo_ballots").select("scores").eq("course_id", courseId).eq("student_id", student!.data!.id).maybeSingle(),
  ]);
  if ([delegations, members, projects, settings, votes, ownVote].some((result) => result.error)) throw new Error("No se ha podido cargar el evento. Reintenta para recuperar las propuestas guardadas.");
  if (!settings.data) throw new Error("La SA4 está cerrada o el evento está pendiente de configurar. Consulta al profesor.");
  return {
    courseId, teacher, countryCode: members.data?.find((member) => member.student_id === student?.data?.id)?.country_code ?? null,
    delegations: (delegations.data ?? []) as Delegation[], steps: projectSteps(projects.data ?? []),
    phase: settings.data.phase, votes: (votes.data ?? []).map((vote) => ({ scores: vote.scores as LogoRanking })), ownVote: ownVote.data?.scores as LogoRanking ?? null,
  };
}

async function saveStep(input: { courseId: string; country: string; step: EventStep; data: StepData[EventStep]; revision: number }): Promise<SavedStep> {
  if (!eventSteps.some(({ id }) => id === input.step) || !Number.isInteger(input.revision) || input.revision < 0) throw new Error("Revisa el paso que quieres guardar.");
  const supabase = await createClient();
  const teams = await supabase.from("sa4_delegations").select("country_code").eq("course_id", input.courseId).order("position");
  if (teams.error || !teams.data?.length) throw new Error("No se han podido comprobar las delegaciones. Reintenta el guardado.");
  const countries = teams.data.map((team) => String(team.country_code));
  validateStep(input.step, input.data, countries);
  if (input.step === "results") {
    const competition = await supabase.from("sa4_team_projects").select("content")
      .eq("course_id", input.courseId).eq("country_code", input.country).maybeSingle();
    if (competition.error || !competition.data?.content?.competition) throw new Error("Guarda primero el formato y el cuadro de juego.");
    const config = competition.data.content.competition as StepData["competition"];
    const scores = (input.data as StepData["results"]).scores;
    const matches = eventMatches(config.format, config.order, scores);
    if (Object.keys(scores).some((key) => !matches.some((match) => match.id === key))) throw new Error("Los resultados corresponden a otro cuadro. Actualiza el evento.");
    for (const match of matches) {
      const score = scores[match.id];
      if (!score) continue;
      if ((score.a != null || score.b != null) && (!match.a || !match.b)) throw new Error("Completa los partidos anteriores antes de registrar esta ronda.");
      if (score.winner && score.winner !== match.a && score.winner !== match.b) throw new Error("El ganador debe ser uno de los países del partido.");
    }
  }
  const identity = input.data as StepData["identity"];
  const payload = input.step === "identity" ? { ...identity, submitted: Boolean(identity.logo && identity.name.trim() && identity.slogan.trim() && identity.meaning.trim()) } : input.data;
  const { data, error } = await supabase.rpc("save_sa4_team_step", {
    p_course: input.courseId, p_country: input.country, p_step: input.step, p_data: payload, p_revision: input.revision,
  });
  if (error) {
    if (error.message.includes("SA4_CONFLICT")) throw new Error("Otro integrante ha guardado este paso. Tu edición sigue aquí. Copia lo que quieras conservar y pulsa «Actualizar evento» para cargar su versión.");
    if (error.message.includes("SA4_RESULTS_EXIST")) throw new Error("El cuadro ya tiene resultados. Revisa los partidos en el paso de resultados.");
    if (error.code === "23505") throw new Error("Otra delegación ya ha elegido ese deporte. Acordad una actividad distinta y vuelve a guardar.");
    throw new Error("No se ha podido guardar. Tu edición sigue aquí. Comprueba que la SA4 y este paso estén abiertos y reintenta.");
  }
  if (!data?.[0]) throw new Error("No se ha confirmado el guardado. Conserva tu edición y reintenta.");
  return data[0] as SavedStep;
}

async function voteLogos(courseId: string, country: string, ranking: LogoRanking) {
  const supabase = await createClient();
  const teams = await supabase.from("sa4_delegations").select("country_code").eq("course_id", courseId);
  if (teams.error) throw new Error("No se han podido comprobar los logos. Tus puntuaciones siguen aquí. Reintenta.");
  validateLogoRanking(ranking, (teams.data ?? []).map((team) => String(team.country_code)));
  const { data, error } = await supabase.rpc("vote_sa4_logos", { p_course: courseId, p_country: country, p_scores: ranking });
  if (error?.message.includes("SA4_RANKING_INVALID")) throw new Error("Puntúa todos los logos usando cada número del 1 al 8 una sola vez.");
  if (error || !data || Object.keys(ranking).some((code) => data[code] !== ranking[code])) throw new Error("No se ha confirmado tu votación. Tus puntuaciones siguen aquí. Comprueba que la votación siga abierta y reintenta.");
  return ranking;
}

async function setVotingPhase(courseId: string, phase: EventWorkspace["phase"]) {
  const { data, error } = await (await createClient()).rpc("set_sa4_voting_phase", { p_course: courseId, p_phase: phase });
  if (error?.message.includes("SA4_LOGOS_PENDING")) throw new Error("Faltan propuestas. Las ocho delegaciones necesitan un logo, un nombre y un lema guardados.");
  if (error?.message.includes("SA4_VOTES_EXIST")) throw new Error("Ya hay votos registrados. Puedes reabrir la votación para ampliar el plazo.");
  if (error || data !== phase) throw new Error("No se ha podido cambiar la votación. Actualiza el evento y reintenta.");
  return phase;
}

async function actionResult<T>(action: () => Promise<T>): Promise<{ data: T; error: null } | { data: null; error: string }> {
  try { return { data: await action(), error: null }; }
  catch (cause) { return { data: null, error: cause instanceof Error ? cause.message : "No se ha podido completar la acción. Reintenta." }; }
}

export async function loadSa4Workspace(requestedCourse?: string) {
  return actionResult(() => loadWorkspace(requestedCourse));
}
export async function saveSa4Step(input: Parameters<typeof saveStep>[0]) {
  return actionResult(() => saveStep(input));
}
export async function voteSa4Logos(courseId: string, country: string, ranking: LogoRanking) {
  return actionResult(() => voteLogos(courseId, country, ranking));
}
export async function setSa4VotingPhase(courseId: string, phase: EventWorkspace["phase"]) {
  return actionResult(() => setVotingPhase(courseId, phase));
}

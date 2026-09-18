revoke all on public.theory_challenge_topics, public.theory_challenge_responses from public, anon, authenticated;
grant select on public.theory_challenge_topics to authenticated;
grant select, insert on public.theory_challenge_responses to authenticated;
grant update(answer) on public.theory_challenge_responses to authenticated;

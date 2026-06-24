-- Reverts 023_auto_group_advancement.sql.
--
-- Auto-scoring the instant a group's top-2 became mathematically certain
-- turned out to be less fair, not more: it locked in advancement results
-- (and scored them) before a group's actual pick deadline (the group's
-- last match kickoff), so anyone who simply hadn't gotten around to
-- making their advancement pick yet — like a user who picked nothing for
-- Group I — could never earn those points even if they picked correctly
-- before the real deadline. Reverting to manual admin entry, which only
-- happens once everyone's had their full window to pick.
drop trigger if exists on_match_result_check_advancement on public.match_results;
drop function if exists public.trg_auto_group_advancement();
drop function if exists public.compute_group_advancement(char);

delete from public.prediction_scores
where prediction_type = 'advancement'
  and reference_id in ('I_t1', 'I_t2');

delete from public.group_advancement_results
where group_letter = 'I';

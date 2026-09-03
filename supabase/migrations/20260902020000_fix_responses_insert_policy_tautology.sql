-- The previous fix (20260902010000) made things worse: referencing the new
-- row's columns unqualified inside the exists() subquery let Postgres
-- resolve them against the subquery's own alias "i" instead of the row
-- being inserted, collapsing the check into i."interviewId" = i."interviewId"
-- - a tautology that is true for any interview at all, so it accepted any
-- interviewId/userEmail combination including spoofed and nonexistent ones.
-- Confirmed via direct API testing before and after this fix.
--
-- The correct, Postgres/Supabase-documented pattern is to qualify the new
-- row's columns with the target table's own name ("Responses"."col"), which
-- is what the very first migration used - that version was correct.

drop policy if exists "Anyone can submit a response for a valid interview" on "Responses";
create policy "Anyone can submit a response for a valid interview"
on "Responses" for insert
to anon, authenticated
with check (
  exists (
    select 1 from "Interviews" i
    where i."interviewId" = "Responses"."interviewId"
      and i."userEmail" = "Responses"."userEmail"
  )
);

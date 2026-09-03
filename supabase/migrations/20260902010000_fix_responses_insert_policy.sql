-- The original insert policy qualified the new row's columns as
-- "Responses"."interviewId" / "Responses"."userEmail". That qualification
-- doesn't correlate to the row being inserted inside a WITH CHECK
-- expression, so the exists() subquery could never match and EVERY insert
-- was rejected - including legitimate ones. Fixed by referencing the new
-- row's columns unqualified, which is how Postgres RLS expects them here.

drop policy if exists "Anyone can submit a response for a valid interview" on "Responses";
create policy "Anyone can submit a response for a valid interview"
on "Responses" for insert
to anon, authenticated
with check (
  exists (
    select 1 from "Interviews" i
    where i."interviewId" = "interviewId"
      and i."userEmail" = "userEmail"
  )
);

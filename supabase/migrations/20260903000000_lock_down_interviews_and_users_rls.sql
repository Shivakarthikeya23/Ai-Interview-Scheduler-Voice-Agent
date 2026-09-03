-- Interviews and Users both had row level security completely disabled
-- (relrowsecurity = false, zero policies) - confirmed live: the public anon
-- key could read every recruiter's full interview data (including their
-- email) and every user's profile row, and could insert/delete arbitrary
-- rows in both tables with no restriction at all.
--
-- Users has no legitimate anonymous use case at all (the app only ever
-- reads/writes it for the signed-in user's own row), so it's locked down
-- entirely to `authenticated` + an owner check.
--
-- Interviews is trickier: candidates who are never authenticated genuinely
-- need to read one interview by its link (interviewId). RLS can't express
-- "readable only if you already know the exact id" - if a row is visible to
-- anon at all, an unfiltered select() returns every such row, which is
-- exactly how the leak worked. The fix is a SECURITY DEFINER function that
-- looks up exactly one row by id (the interviewId is an unguessable UUID,
-- so knowing it is equivalent to "having the link", the same trust model as
-- a Google Docs share link) and exposes only the columns a candidate needs -
-- notably not the internal numeric id. The base table itself grants anon
-- nothing.

alter table "Interviews" enable row level security;
alter table "Users" enable row level security;

-- Interviews: recruiters can only see/manage interviews they created.
drop policy if exists "Recruiters can view their own interviews" on "Interviews";
create policy "Recruiters can view their own interviews"
on "Interviews" for select
to authenticated
using ((auth.jwt() ->> 'email') = "userEmail");

drop policy if exists "Recruiters can create their own interviews" on "Interviews";
create policy "Recruiters can create their own interviews"
on "Interviews" for insert
to authenticated
with check ((auth.jwt() ->> 'email') = "Interviews"."userEmail");

drop policy if exists "Recruiters can delete their own interviews" on "Interviews";
create policy "Recruiters can delete their own interviews"
on "Interviews" for delete
to authenticated
using ((auth.jwt() ->> 'email') = "userEmail");

-- Users: a recruiter can only see/manage their own profile row. No anon
-- access at all - the app only ever touches this table when signed in.
drop policy if exists "Users can view their own profile" on "Users";
create policy "Users can view their own profile"
on "Users" for select
to authenticated
using ((auth.jwt() ->> 'email') = email);

drop policy if exists "Users can create their own profile" on "Users";
create policy "Users can create their own profile"
on "Users" for insert
to authenticated
with check ((auth.jwt() ->> 'email') = "Users".email);

drop policy if exists "Users can delete their own profile" on "Users";
create policy "Users can delete their own profile"
on "Users" for delete
to authenticated
using ((auth.jwt() ->> 'email') = email);

-- Candidate-facing "anyone with the link" read, without exposing the table
-- to broad anonymous listing. search_path is pinned to prevent a
-- search_path-hijack against this SECURITY DEFINER function.
create or replace function public.get_public_interview(p_interview_id text)
returns table (
  "interviewId" text,
  "jobPosition" text,
  "jobDescription" text,
  duration text,
  type text,
  "questionList" jsonb,
  "userEmail" text
)
language sql
security definer
set search_path = public
stable
as $$
  select "interviewId", "jobPosition", "jobDescription", duration, type, "questionList", "userEmail"
  from "Interviews"
  where "interviewId" = p_interview_id
  limit 1;
$$;

revoke all on function public.get_public_interview(text) from public;
grant execute on function public.get_public_interview(text) to anon, authenticated;

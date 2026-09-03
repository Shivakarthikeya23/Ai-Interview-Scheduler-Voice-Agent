-- Candidate interview feedback was only ever saved to the candidate's own
-- browser (localStorage), so recruiters could never see it on another
-- device. This table persists it server-side so the dashboard can read it.

create table if not exists "Responses" (
  id uuid primary key default gen_random_uuid(),
  "interviewId" text not null,
  "userEmail" text not null,
  "candidateName" text,
  "candidateEmail" text,
  "jobPosition" text,
  feedback jsonb,
  conversation jsonb,
  duration integer,
  "totalQuestions" integer,
  created_at timestamptz not null default now()
);

create index if not exists responses_interview_id_idx on "Responses" ("interviewId");
create index if not exists responses_user_email_idx on "Responses" ("userEmail");

alter table "Responses" enable row level security;

-- Candidates take the interview unauthenticated, so inserts must be open to
-- anon/authenticated alike. The WITH CHECK ties the row to whichever
-- recruiter actually owns that interviewId, so a candidate can't spoof
-- another recruiter's userEmail and make their response show up elsewhere.
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

-- Recruiters can only ever read responses for interviews they created.
drop policy if exists "Recruiters can view their own responses" on "Responses";
create policy "Recruiters can view their own responses"
on "Responses" for select
to authenticated
using ((auth.jwt() ->> 'email') = "userEmail");

-- Recruiters can delete their own responses (e.g. when they delete an interview).
drop policy if exists "Recruiters can delete their own responses" on "Responses";
create policy "Recruiters can delete their own responses"
on "Responses" for delete
to authenticated
using ((auth.jwt() ->> 'email') = "userEmail");

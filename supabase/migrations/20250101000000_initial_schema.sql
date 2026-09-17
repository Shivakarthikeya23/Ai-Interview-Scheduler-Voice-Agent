-- Baseline schema for a fresh project. The Interviews and Users tables
-- already existed in the original hosted project before this repo started
-- tracking migrations, so this file adopts them into version control
-- (create table if not exists - a safe no-op against that project) and lets
-- a brand-new Supabase project bootstrap the full schema with a single
-- `supabase db push`, since every later migration assumes both tables
-- already exist.

create table if not exists "Interviews" (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  "interviewId" text,
  "jobPosition" text,
  "jobDescription" text,
  duration text,
  -- Stored as a JSON-encoded string (e.g. '["Technical"]'), not a native
  -- array/jsonb - this matches the column's actual type in the original
  -- hosted project. The app already guards every read with
  -- Array.isArray(interview.type), so this is a known quirk, not something
  -- this migration should silently "fix" for new setups only.
  type text,
  "questionList" jsonb,
  "userEmail" text
);

create table if not exists "Users" (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  email text,
  name text,
  picture text,
  credits integer
);

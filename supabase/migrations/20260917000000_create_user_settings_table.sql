-- Settings page (app/(main)/settings/page.jsx) reads/writes/deletes rows in
-- a "UserSettings" table that no migration ever created - confirmed via a
-- live 404 on the Settings page and by grepping every migration file for
-- "UserSettings" (zero matches). This means "Save Settings" has never
-- actually worked in production; it always hits a missing-table error and
-- shows the "Failed to save settings" toast.
--
-- Same ownership model as the Users table: no legitimate anonymous use
-- case, only ever touched for the signed-in user's own row, so it's locked
-- down entirely to `authenticated` + an owner check on userEmail. Unlike
-- Users/Interviews, the app upserts here, so an update policy is required
-- too (Users never updates its own row today, so it never needed one).

create table if not exists "UserSettings" (
  id bigint generated always as identity primary key,
  "userEmail" text not null unique,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table "UserSettings" enable row level security;

drop policy if exists "Users can view their own settings" on "UserSettings";
create policy "Users can view their own settings"
on "UserSettings" for select
to authenticated
using ((auth.jwt() ->> 'email') = "userEmail");

drop policy if exists "Users can create their own settings" on "UserSettings";
create policy "Users can create their own settings"
on "UserSettings" for insert
to authenticated
with check ((auth.jwt() ->> 'email') = "userEmail");

drop policy if exists "Users can update their own settings" on "UserSettings";
create policy "Users can update their own settings"
on "UserSettings" for update
to authenticated
using ((auth.jwt() ->> 'email') = "userEmail")
with check ((auth.jwt() ->> 'email') = "userEmail");

drop policy if exists "Users can delete their own settings" on "UserSettings";
create policy "Users can delete their own settings"
on "UserSettings" for delete
to authenticated
using ((auth.jwt() ->> 'email') = "userEmail");

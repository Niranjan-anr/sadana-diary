-- ============================================================
-- Mentor system: roles, targets, and daily reports
-- ============================================================

-- Extend profiles with role + mentor link
alter table profiles add column if not exists role text not null default 'sadhaka';
alter table profiles add constraint profiles_role_check check (role in ('sadhaka', 'mentor'));
alter table profiles add column if not exists mentor_id uuid references profiles(id) on delete set null;

create index if not exists idx_profiles_mentor_id on profiles(mentor_id);

-- Per-sadhaka targets, set/edited by their mentor
create table if not exists sadhaka_targets (
  id uuid primary key default gen_random_uuid(),
  sadhaka_id uuid not null references profiles(id) on delete cascade unique,
  min_rounds integer not null default 16,
  min_reading_seconds integer not null default 0,
  min_hearing_seconds integer not null default 0,
  updated_by uuid references profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index if not exists idx_sadhaka_targets_sadhaka_id on sadhaka_targets(sadhaka_id);

-- One row per sadhaka per day: the submitted (manual or auto) report
create table if not exists daily_reports (
  id uuid primary key default gen_random_uuid(),
  sadhaka_id uuid not null references profiles(id) on delete cascade,
  report_date date not null,

  wake_time text,
  sleep_time text,
  japa_rounds integer not null default 0,
  reading_seconds integer not null default 0,
  hearing_seconds integer not null default 0,

  -- Snapshot of the target at submit time so later target edits
  -- never retroactively change a past day's completion %
  target_rounds integer not null,
  target_reading_seconds integer not null,
  target_hearing_seconds integer not null,

  submitted_at timestamptz not null default now(),
  submitted_by text not null default 'manual' check (submitted_by in ('manual', 'auto_midnight')),

  created_at timestamptz not null default now(),
  unique(sadhaka_id, report_date)
);

create index if not exists idx_daily_reports_sadhaka_id on daily_reports(sadhaka_id);
create index if not exists idx_daily_reports_date on daily_reports(report_date);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table sadhaka_targets enable row level security;
alter table daily_reports enable row level security;

-- Sadhaka can read their own target
create policy "sadhaka reads own target"
  on sadhaka_targets for select
  using (sadhaka_id = auth.uid());

-- Mentor can read/write targets for their own sadhakas
create policy "mentor manages own sadhakas targets"
  on sadhaka_targets for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = sadhaka_targets.sadhaka_id
      and profiles.mentor_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from profiles
      where profiles.id = sadhaka_targets.sadhaka_id
      and profiles.mentor_id = auth.uid()
    )
  );

-- Sadhaka can read + insert/update their own daily reports
create policy "sadhaka manages own reports"
  on daily_reports for all
  using (sadhaka_id = auth.uid())
  with check (sadhaka_id = auth.uid());

-- Mentor can read reports for their own sadhakas
create policy "mentor reads own sadhakas reports"
  on daily_reports for select
  using (
    exists (
      select 1 from profiles
      where profiles.id = daily_reports.sadhaka_id
      and profiles.mentor_id = auth.uid()
    )
  );

-- ============================================================
-- Leaderboard view — percentage-of-target completion, no cap
-- ============================================================

create or replace view leaderboard as
select
  dr.sadhaka_id,
  p.full_name,
  p.mentor_id,
  dr.report_date,
  dr.japa_rounds,
  dr.target_rounds,
  dr.reading_seconds,
  dr.target_reading_seconds,
  dr.hearing_seconds,
  dr.target_hearing_seconds,
  -- Average of whichever component targets are nonzero
  (
    coalesce(
      (case when dr.target_rounds > 0 then dr.japa_rounds::numeric / dr.target_rounds else null end), 0
    ) +
    coalesce(
      (case when dr.target_reading_seconds > 0 then dr.reading_seconds::numeric / dr.target_reading_seconds else null end), 0
    ) +
    coalesce(
      (case when dr.target_hearing_seconds > 0 then dr.hearing_seconds::numeric / dr.target_hearing_seconds else null end), 0
    )
  ) / nullif(
    (case when dr.target_rounds > 0 then 1 else 0 end) +
    (case when dr.target_reading_seconds > 0 then 1 else 0 end) +
    (case when dr.target_hearing_seconds > 0 then 1 else 0 end),
    0
  ) as completion_pct
from daily_reports dr
join profiles p on p.id = dr.sadhaka_id;
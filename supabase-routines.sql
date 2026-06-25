create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.user_routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  icon text not null default 'Target',
  color text not null default '#8f1828',
  routine_type text not null default 'custom'
    check (routine_type in ('vacation', 'college', 'work', 'custom')),
  is_active boolean not null default false,
  weekly_goal_percent integer not null default 70
    check (weekly_goal_percent between 0 and 100),
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.routine_activities (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.user_routines(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  start_time time not null,
  end_time time not null,
  days_of_week jsonb not null default '[]'::jsonb,
  category text not null default '',
  position integer not null default 0,
  requires_evidence boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.routine_habits (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.user_routines(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  goal_value numeric,
  goal_unit text not null default '',
  frequency text not null default 'daily'
    check (frequency in ('daily', 'weekly', 'monthly', 'free')),
  target_days jsonb not null default '[]'::jsonb,
  is_required boolean not null default true,
  requires_evidence boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.routine_daily_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  routine_id uuid references public.user_routines(id) on delete set null,
  routine_name text not null default 'Rotina sem nome',
  record_date date not null,
  is_exception_day boolean not null default false,
  exception_id uuid references public.routine_exceptions(id) on delete set null,
  exception_reason text not null default '',
  planned_habits integer not null default 0,
  completed_habits integer not null default 0,
  progress_percent integer not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, record_date)
);

create table if not exists public.routine_habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  daily_record_id uuid not null references public.routine_daily_records(id) on delete cascade,
  routine_habit_id uuid references public.routine_habits(id) on delete set null,
  habit_name text not null,
  done boolean not null default false,
  value_done numeric,
  unit text not null default '',
  notes text not null default '',
  evidence_url text,
  evidence_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (daily_record_id, routine_habit_id)
);

alter table public.routine_exceptions
add column if not exists routine_id uuid references public.user_routines(id) on delete set null;

drop trigger if exists set_user_routines_updated_at on public.user_routines;
create trigger set_user_routines_updated_at
before update on public.user_routines
for each row execute function public.set_updated_at();

drop trigger if exists set_routine_activities_updated_at on public.routine_activities;
create trigger set_routine_activities_updated_at
before update on public.routine_activities
for each row execute function public.set_updated_at();

drop trigger if exists set_routine_habits_updated_at on public.routine_habits;
create trigger set_routine_habits_updated_at
before update on public.routine_habits
for each row execute function public.set_updated_at();

drop trigger if exists set_routine_daily_records_updated_at on public.routine_daily_records;
create trigger set_routine_daily_records_updated_at
before update on public.routine_daily_records
for each row execute function public.set_updated_at();

drop trigger if exists set_routine_habit_logs_updated_at on public.routine_habit_logs;
create trigger set_routine_habit_logs_updated_at
before update on public.routine_habit_logs
for each row execute function public.set_updated_at();

create unique index if not exists user_routines_one_active_per_user_idx
on public.user_routines(user_id)
where is_active;

create index if not exists user_routines_user_idx
on public.user_routines(user_id, created_at desc);

create index if not exists routine_activities_routine_idx
on public.routine_activities(routine_id, position);

create index if not exists routine_habits_routine_idx
on public.routine_habits(routine_id, position);

create index if not exists routine_daily_records_user_date_idx
on public.routine_daily_records(user_id, record_date desc);

create index if not exists routine_habit_logs_record_idx
on public.routine_habit_logs(daily_record_id);

alter table public.user_routines enable row level security;
alter table public.routine_activities enable row level security;
alter table public.routine_habits enable row level security;
alter table public.routine_daily_records enable row level security;
alter table public.routine_habit_logs enable row level security;

drop policy if exists "Users can manage own routines" on public.user_routines;
create policy "Users can manage own routines"
on public.user_routines
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can manage own routine activities" on public.routine_activities;
create policy "Users can manage own routine activities"
on public.routine_activities
for all
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.user_routines r
    where r.id = routine_id
    and r.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage own routine habits" on public.routine_habits;
create policy "Users can manage own routine habits"
on public.routine_habits
for all
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.user_routines r
    where r.id = routine_id
    and r.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage own routine daily records" on public.routine_daily_records;
create policy "Users can manage own routine daily records"
on public.routine_daily_records
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can manage own routine habit logs" on public.routine_habit_logs;
create policy "Users can manage own routine habit logs"
on public.routine_habit_logs
for all
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.routine_daily_records dr
    where dr.id = daily_record_id
    and dr.user_id = auth.uid()
  )
);

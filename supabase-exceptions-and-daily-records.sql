-- Suporte Supabase para perfil, exceções de rotina e registros diários.
-- Execute no SQL editor do Supabase depois de habilitar Auth.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.routine_exceptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exception_date date not null,
  title text not null,
  description text default '',
  type text default 'Exceção',
  minimum_habits integer not null default 1 check (minimum_habits > 0),
  notes text default '',
  show_on_dashboard boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, exception_date)
);

create table if not exists public.daily_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  record_date date not null,
  routine_id text,
  routine_name text default 'Rotina sem nome',
  planned_habit_count integer not null default 0,
  habits_completed integer not null default 0,
  entries jsonb not null default '[]'::jsonb,
  note text default '',
  is_exception_day boolean not null default false,
  exception_id uuid references public.routine_exceptions(id) on delete set null,
  exception_title text default '',
  exception_type text default '',
  exception_reason text default '',
  exception_note text default '',
  minimum_habits_goal integer,
  minimum_habits_completed integer,
  minimum_routine_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, record_date)
);

alter table public.profiles enable row level security;
alter table public.routine_exceptions enable row level security;
alter table public.daily_records enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "routine_exceptions_select_own"
  on public.routine_exceptions for select
  using (auth.uid() = user_id);

create policy "routine_exceptions_insert_own"
  on public.routine_exceptions for insert
  with check (auth.uid() = user_id);

create policy "routine_exceptions_update_own"
  on public.routine_exceptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "routine_exceptions_delete_own"
  on public.routine_exceptions for delete
  using (auth.uid() = user_id);

create policy "daily_records_select_own"
  on public.daily_records for select
  using (auth.uid() = user_id);

create policy "daily_records_insert_own"
  on public.daily_records for insert
  with check (auth.uid() = user_id);

create policy "daily_records_update_own"
  on public.daily_records for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "daily_records_delete_own"
  on public.daily_records for delete
  using (auth.uid() = user_id);

create index if not exists routine_exceptions_user_date_idx
  on public.routine_exceptions (user_id, exception_date);

create index if not exists daily_records_user_date_idx
  on public.daily_records (user_id, record_date);

create table if not exists public.body_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  record_date date not null,
  weight numeric(6, 2) not null,
  height numeric(4, 2) not null,
  goal text not null default '',
  notes text not null default '',
  waist numeric(6, 2),
  hip numeric(6, 2),
  arm numeric(6, 2),
  leg numeric(6, 2),
  chest numeric(6, 2),
  photo_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  author text not null default '',
  status text not null default 'quero ler',
  total_pages integer not null default 0,
  current_page integer not null default 0,
  start_date date,
  finish_date date,
  category text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  platform text not null default '',
  category text not null default '',
  status text not null default 'não iniciado',
  total_hours numeric(7, 2) not null default 0,
  completed_hours numeric(7, 2) not null default 0,
  start_date date,
  finish_date date,
  course_url text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);

alter table public.body_progress enable row level security;
alter table public.books enable row level security;
alter table public.courses enable row level security;

create policy "Users can read their body progress"
  on public.body_progress for select
  using (auth.uid() = user_id);

create policy "Users can create their body progress"
  on public.body_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their body progress"
  on public.body_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their body progress"
  on public.body_progress for delete
  using (auth.uid() = user_id);

create policy "Users can read their books"
  on public.books for select
  using (auth.uid() = user_id);

create policy "Users can create their books"
  on public.books for insert
  with check (auth.uid() = user_id);

create policy "Users can update their books"
  on public.books for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their books"
  on public.books for delete
  using (auth.uid() = user_id);

create policy "Users can read their courses"
  on public.courses for select
  using (auth.uid() = user_id);

create policy "Users can create their courses"
  on public.courses for insert
  with check (auth.uid() = user_id);

create policy "Users can update their courses"
  on public.courses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their courses"
  on public.courses for delete
  using (auth.uid() = user_id);

create index if not exists body_progress_user_date_idx
  on public.body_progress (user_id, record_date desc);

create index if not exists books_user_created_idx
  on public.books (user_id, created_at desc);

create index if not exists courses_user_created_idx
  on public.courses (user_id, created_at desc);

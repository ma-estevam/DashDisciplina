create table if not exists public.custom_modules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  icon text not null default 'Target',
  color text not null default '#8f1828',
  tracking_type text not null default 'livre',
  goal text not null default '',
  unit text not null default '',
  allow_evidence boolean not null default false,
  show_on_dashboard boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.custom_module_fields (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.custom_modules(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  field_key text not null,
  field_type text not null,
  required boolean not null default false,
  options jsonb not null default '[]'::jsonb,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.custom_module_records (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.custom_modules(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  record_date date not null default current_date,
  values jsonb not null default '{}'::jsonb,
  evidence_url text,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.custom_modules enable row level security;
alter table public.custom_module_fields enable row level security;
alter table public.custom_module_records enable row level security;

create policy "Users can read their custom modules"
  on public.custom_modules for select
  using (auth.uid() = user_id);

create policy "Users can create their custom modules"
  on public.custom_modules for insert
  with check (auth.uid() = user_id);

create policy "Users can update their custom modules"
  on public.custom_modules for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their custom modules"
  on public.custom_modules for delete
  using (auth.uid() = user_id);

create policy "Users can read their custom module fields"
  on public.custom_module_fields for select
  using (auth.uid() = user_id);

create policy "Users can create their custom module fields"
  on public.custom_module_fields for insert
  with check (auth.uid() = user_id);

create policy "Users can update their custom module fields"
  on public.custom_module_fields for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their custom module fields"
  on public.custom_module_fields for delete
  using (auth.uid() = user_id);

create policy "Users can read their custom module records"
  on public.custom_module_records for select
  using (auth.uid() = user_id);

create policy "Users can create their custom module records"
  on public.custom_module_records for insert
  with check (auth.uid() = user_id);

create policy "Users can update their custom module records"
  on public.custom_module_records for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their custom module records"
  on public.custom_module_records for delete
  using (auth.uid() = user_id);

create index if not exists custom_modules_user_idx
  on public.custom_modules (user_id, created_at desc);

create index if not exists custom_module_fields_module_idx
  on public.custom_module_fields (module_id, position);

create index if not exists custom_module_records_module_idx
  on public.custom_module_records (module_id, record_date desc);

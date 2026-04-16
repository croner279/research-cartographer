create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  source text,
  document_type text,
  status text not null default 'inbox',
  published_at date,
  summary_line text,
  raw_text text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.waves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  slug text not null,
  title text not null,
  thesis text,
  stage text not null default 'early',
  key_bottlenecks text[] not null default '{}',
  value_capture_layers text[] not null default '{}',
  latest_interpretation text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.emerging_topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  parent_wave_id uuid references public.waves (id) on delete set null,
  slug text not null,
  name text not null,
  one_liner text,
  why_now text,
  why_it_matters text,
  maturity_status text not null default 'unknown',
  recent_mentions integer not null default 0,
  linked_documents_count integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  wave_id uuid references public.waves (id) on delete set null,
  title text not null,
  description text,
  confidence integer not null default 50,
  last_updated timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.evidence_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  document_id uuid references public.documents (id) on delete cascade,
  title text not null,
  snippet text,
  item_type text not null default 'snippet',
  why_tag text,
  note text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  ticker text,
  role_description text
);

create table if not exists public.wave_company_links (
  id uuid primary key default gen_random_uuid(),
  wave_id uuid not null references public.waves (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  relationship_note text
);

create table if not exists public.question_evidence_links (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  evidence_item_id uuid not null references public.evidence_items (id) on delete cascade,
  stance text not null default 'supporting'
);

create table if not exists public.topic_evidence_links (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.emerging_topics (id) on delete cascade,
  evidence_item_id uuid not null references public.evidence_items (id) on delete cascade
);

create table if not exists public.missed_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  theme_name text not null,
  winner_stocks text[] not null default '{}',
  early_clues text,
  why_missed text,
  watch_next_time text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.workspace_snapshots (
  user_id uuid primary key references auth.users (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;
alter table public.documents enable row level security;
alter table public.waves enable row level security;
alter table public.emerging_topics enable row level security;
alter table public.questions enable row level security;
alter table public.evidence_items enable row level security;
alter table public.companies enable row level security;
alter table public.wave_company_links enable row level security;
alter table public.question_evidence_links enable row level security;
alter table public.topic_evidence_links enable row level security;
alter table public.missed_reviews enable row level security;
alter table public.workspace_snapshots enable row level security;

create policy "profiles own access" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "documents own access" on public.documents for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "waves own access" on public.waves for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "topics own access" on public.emerging_topics for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "questions own access" on public.questions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "evidence own access" on public.evidence_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "companies own access" on public.companies for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "missed reviews own access" on public.missed_reviews for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workspace snapshot own access" on public.workspace_snapshots for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

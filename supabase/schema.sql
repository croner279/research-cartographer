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
  topic_id uuid,
  wave_id uuid,
  file_name text,
  intake_method text not null default 'paste',
  extraction_state text not null default 'not_started',
  extraction_error text,
  analysis_state text not null default 'not_run',
  last_analysis_run_id uuid,
  page_count integer not null default 0,
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
  review_status text not null default 'draft',
  origin text not null default 'manual',
  recent_mentions integer not null default 0,
  linked_documents_count integer not null default 0,
  open_questions text[] not null default '{}',
  source_concepts text[] not null default '{}',
  parent_wave_hint text,
  source_pages integer[] not null default '{}',
  last_analysis_run_id uuid,
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
  chunk_id uuid,
  analysis_run_id uuid,
  title text not null,
  snippet text,
  item_type text not null default 'snippet',
  why_tag text,
  note text,
  review_status text not null default 'pending',
  confidence integer not null default 50,
  company_mentions text[] not null default '{}',
  candidate_topic_names text[] not null default '{}',
  parent_wave_hint text,
  source_pages integer[] not null default '{}',
  approved_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.analysis_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  document_id uuid not null references public.documents (id) on delete cascade,
  status text not null default 'completed',
  engine_version text not null default 'analysis-engine-v1',
  chunk_count integer not null default 0,
  evidence_candidate_count integer not null default 0,
  topic_draft_count integer not null default 0,
  repeated_concepts text[] not null default '{}',
  notes text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.document_pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  document_id uuid not null references public.documents (id) on delete cascade,
  page_number integer not null,
  body text not null,
  char_start integer not null default 0,
  char_end integer not null default 0,
  asset_placeholders jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  document_id uuid not null references public.documents (id) on delete cascade,
  analysis_run_id uuid not null references public.analysis_runs (id) on delete cascade,
  chunk_order integer not null,
  body text not null,
  char_start integer not null default 0,
  char_end integer not null default 0,
  token_estimate integer not null default 0,
  page_start integer not null default 1,
  page_end integer not null default 1,
  source_pages integer[] not null default '{}',
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
alter table public.analysis_runs enable row level security;
alter table public.document_pages enable row level security;
alter table public.document_chunks enable row level security;
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
create policy "analysis runs own access" on public.analysis_runs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "document pages own access" on public.document_pages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "document chunks own access" on public.document_chunks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "companies own access" on public.companies for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "missed reviews own access" on public.missed_reviews for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "workspace snapshot own access" on public.workspace_snapshots for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

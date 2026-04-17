# Research Cartographer

Research Cartographer is a local-first MVP for detecting and mapping emerging industry structures early.

## What is included

- Next.js App Router MVP
- Korean desktop-first UI
- Seeded sample data for:
  - Emerging Radar
  - Topic Draft
  - Wave Board
  - Research Queue
  - Evidence Workspace
  - Question Board
  - Missed Winners Lab
- Supabase schema draft for future backend wiring

## Routes

- `/` Emerging Radar
- `/topics/[slug]` Topic Draft
- `/waves` Wave Board
- `/waves/[slug]` Wave Detail
- `/queue` Research Queue
- `/evidence` Evidence Workspace
- `/questions` Question Board
- `/missed-winners` Missed Winners Lab

## Setup

1. Install dependencies

```bash
npm install
```

2. Add environment variables

Create `.env.local` from `.env.example`.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
```

3. Optional: run the Supabase schema in the SQL editor

[supabase/schema.sql](./supabase/schema.sql)

4. Start the app

```bash
npm run dev
```

## How persistence works now

- The current MVP is local-only.
- Workspace changes are stored in browser storage.
- Supabase schema is included for later backend wiring, but login and sync are intentionally removed from the current UX.

## Notes

- The MVP is intentionally sample-data heavy so the product feel is testable immediately.
- The pages are built first; backend persistence can be deepened after workflow validation.
- `shadcn/ui` CLI initialization was blocked by a local certificate issue, so equivalent local UI primitives were created directly in `src/components/ui`.

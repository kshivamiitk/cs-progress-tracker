# CS Progress Tracker

A modern full-stack template for logging and visualizing computer science learning progress. Built with Next.js, Supabase, Tailwind CSS, Chart.js, Framer Motion, and React-based visualizations.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure Supabase by setting the following environment variables in a `.env.local` file:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) to interact with the app.

## Supabase Schema

Execute this SQL in your Supabase project to provision the required table:

```sql
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  task_type text check (task_type in ('programming', 'video')),
  platform text,
  topic text,
  count int,
  difficulty text,
  date date default now()
);
```

## Features

- Supabase email/password authentication.
- Task logging form with programming/video flow.
- History table with filtering, CSV export, and edit/delete actions.
- Analytics dashboard with streak tracking, goal management, heatmap, bar, pie, and line charts.
- Calendar view highlighting daily tasks.
- Glassmorphism-inspired UI with light/dark mode toggle and responsive layout.

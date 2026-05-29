# Supabase Setup Guide — SWG Mentorship Feedback Dashboard

> **Project:** [SWGMentorshipFeedBackDashBoard](https://github.com/realharshkumar/SWGMentorshipFeedBackDashBoard.git)  
> **Auth method:** Email OTP / Magic Link via Supabase

---

## Overview

This guide walks through the full Supabase setup required to run the SWG Mentorship Feedback Dashboard locally. It covers database schema creation, auth configuration, test data seeding, RLS policies, and local environment setup.

---

## Step 1 — Create Tables

Go to **Supabase → SQL Editor → New query** and run the following:

```sql
create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('mentee', 'admin');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.academic_sessions (
  id uuid primary key default gen_random_uuid(),
  session_name text unique not null,
  is_current boolean default false
);

create table if not exists public.users (
  id uuid primary key,
  email text unique not null,
  role public.user_role default 'mentee',
  otp_hash text
);

create table if not exists public.mentors (
  id uuid primary key default gen_random_uuid(),
  roll_number text unique not null,
  name text not null,
  email text unique not null,
  phone_number text not null
);

create table if not exists public.mentees (
  id uuid primary key references public.users(id),
  session_id uuid references public.academic_sessions(id),
  mentor_id uuid not null references public.mentors(id),
  roll_number text unique not null,
  name text not null
);

create table if not exists public.feedback_cycles (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.academic_sessions(id),
  cycle_name text not null,
  opens_at timestamptz not null,
  closes_at timestamptz not null
);

create table if not exists public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  mentee_id uuid not null references public.mentees(id),
  mentor_id uuid not null references public.mentors(id),
  cycle_id uuid references public.feedback_cycles(id),
  q1_rating integer not null check (q1_rating between 1 and 5),
  q2_rating integer not null check (q2_rating between 1 and 5),
  created_at timestamptz default now(),
  unique (mentee_id, cycle_id)
);

create table if not exists public.leaderboard_snapshots (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.mentors(id),
  session_id uuid references public.academic_sessions(id),
  cycle_id uuid references public.feedback_cycles(id),
  review double precision not null,
  engagement_score double precision not null,
  final_score double precision not null,
  unique (mentor_id, session_id, cycle_id)
);
```

---

## Step 2 — Enable OTP / Magic Link Login

1. Go to **Authentication → Providers → Email**
2. Enable:
   - Email provider
   - OTP / magic link email login
3. Go to **Authentication → URL Configuration** and set:
   - **Site URL:** `http://127.0.0.1:5173`
   - **Redirect URLs:** `http://127.0.0.1:5173/mentorship/dashboard`

---

## Step 3 — Create a Test Auth User

1. Go to **Authentication → Users → Add user**
2. Create a user with a real email you can access (e.g. `test@example.com`)
3. After creating, click on the user to open their details
4. **Copy the User UID** — you'll need it in Step 4

> The UID looks like: `7b3e6c2a-9f3a-4a62-8b21-123456789abc`

---

## Step 4 — Seed Testing Data

Go to **SQL Editor**, replace the two placeholders below, then run:

- `PASTE_AUTH_USER_UID_HERE` → the UID you copied in Step 3
- `PASTE_YOUR_TEST_EMAIL_HERE` → the same email used to create the Auth user

```sql
with
session_row as (
  insert into public.academic_sessions (session_name, is_current)
  values ('2026-2027 First-Year Batch', true)
  on conflict (session_name)
  do update set is_current = excluded.is_current
  returning id
),
mentor_row as (
  insert into public.mentors (
    roll_number,
    name,
    email,
    phone_number
  )
  values (
    '22SWG001',
    'Arjun Mehta',
    'arjun.mentor@example.com',
    '9999999999'
  )
  on conflict (roll_number)
  do update set
    name = excluded.name,
    email = excluded.email,
    phone_number = excluded.phone_number
  returning id
),
user_row as (
  insert into public.users (
    id,
    email,
    role
  )
  values (
    'PASTE_AUTH_USER_UID_HERE',
    'PASTE_YOUR_TEST_EMAIL_HERE',
    'mentee'
  )
  on conflict (id)
  do update set
    email = excluded.email,
    role = excluded.role
  returning id
),
mentee_row as (
  insert into public.mentees (
    id,
    session_id,
    mentor_id,
    roll_number,
    name
  )
  select
    user_row.id,
    session_row.id,
    mentor_row.id,
    '24TEST001',
    'Test Mentee'
  from user_row, session_row, mentor_row
  on conflict (id)
  do update set
    session_id = excluded.session_id,
    mentor_id = excluded.mentor_id,
    roll_number = excluded.roll_number,
    name = excluded.name
  returning id
)
insert into public.feedback_cycles (
  session_id,
  cycle_name,
  opens_at,
  closes_at
)
select
  session_row.id,
  'Testing Feedback Cycle',
  now() - interval '1 day',
  now() + interval '7 days'
from session_row
on conflict do nothing;
```

> **Why the UID must match:** The dashboard's RLS policy checks `auth.uid() = mentees.id`. So `public.users.id` and `public.mentees.id` must equal the Supabase Auth UID exactly.

---

## Step 5 — Seed Leaderboard Data

Run this to populate `/mentorship/leaderboard` with sample mentor scores:

```sql
with
session_row as (
  select id from public.academic_sessions
  where session_name = '2026-2027 First-Year Batch'
  limit 1
),
cycle_row as (
  select id from public.feedback_cycles
  where cycle_name = 'Testing Feedback Cycle'
  limit 1
),
mentor_rows as (
  insert into public.mentors (
    roll_number,
    name,
    email,
    phone_number
  )
  values
    ('22SWG002', 'Neha Singh', 'neha.mentor@example.com', '9999999998'),
    ('22SWG003', 'Rohan Gupta', 'rohan.mentor@example.com', '9999999997'),
    ('22SWG004', 'Priya Kumar', 'priya.mentor@example.com', '9999999996')
  on conflict (roll_number)
  do update set
    name = excluded.name,
    email = excluded.email,
    phone_number = excluded.phone_number
  returning id, roll_number
)
insert into public.leaderboard_snapshots (
  mentor_id,
  session_id,
  cycle_id,
  review,
  engagement_score,
  final_score
)
select
  mentor_rows.id,
  session_row.id,
  cycle_row.id,
  case mentor_rows.roll_number
    when '22SWG002' then 4.9
    when '22SWG003' then 4.8
    when '22SWG004' then 4.7
  end,
  case mentor_rows.roll_number
    when '22SWG002' then 95
    when '22SWG003' then 91
    when '22SWG004' then 88
  end,
  case mentor_rows.roll_number
    when '22SWG002' then 98
    when '22SWG003' then 93
    when '22SWG004' then 89
  end
from mentor_rows, session_row, cycle_row
on conflict (mentor_id, session_id, cycle_id)
do update set
  review = excluded.review,
  engagement_score = excluded.engagement_score,
  final_score = excluded.final_score;
```

---

## Step 6 — Add RLS Policies

Run this to enable Row Level Security and add permissive testing policies:

```sql
alter table public.academic_sessions enable row level security;
alter table public.users enable row level security;
alter table public.mentors enable row level security;
alter table public.mentees enable row level security;
alter table public.feedback_cycles enable row level security;
alter table public.feedbacks enable row level security;
alter table public.leaderboard_snapshots enable row level security;

create policy "testing read academic sessions"
on public.academic_sessions for select
to anon, authenticated
using (true);

create policy "testing read users"
on public.users for select
to anon, authenticated
using (true);

create policy "testing read mentors"
on public.mentors for select
to anon, authenticated
using (true);

create policy "testing read mentees"
on public.mentees for select
to authenticated
using (auth.uid() = id);

create policy "testing read feedback cycles"
on public.feedback_cycles for select
to anon, authenticated
using (true);

create policy "testing read feedbacks"
on public.feedbacks for select
to authenticated
using (auth.uid() = mentee_id);

create policy "testing insert feedbacks"
on public.feedbacks for insert
to authenticated
with check (auth.uid() = mentee_id);

create policy "testing read leaderboard"
on public.leaderboard_snapshots for select
to anon, authenticated
using (true);
```

---

## Step 7 — Configure Local `.env`

In your project root, create or edit `.env`:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
```

- Use the **anon/public key** (also called publishable key) — found under **Project Settings → API**
- **Never** use the `service_role` key in frontend code

---

## Step 8 — Run the App

```bash
npm run dev
```

Open: [http://127.0.0.1:5173/mentorship](http://127.0.0.1:5173/mentorship)

---

## Step 9 — Login Flow (Magic Link vs OTP)

Supabase email login works in two ways:

| Mode | What happens |
|---|---|
| **Magic link** | User clicks "Sign in" button in the email |
| **Numeric OTP** | User enters a 6-digit code from the email |

**By default, Supabase sends only a magic link** — not a numeric code.

### Option A — Use the magic link (quickest for testing)

Click the **Sign in** link in the email you receive. It will redirect you to `/mentorship/dashboard`.

### Option B — Show a 6-digit OTP code in the email

1. Go to **Authentication → Emails** (or **Email Templates** depending on your Supabase version)
2. Find the **Magic Link** template
3. Edit the body to include the token:

```html
<h2>Your SWG Mentorship Login Code</h2>
<p>Enter this code in the dashboard:</p>
<h1>{{ .Token }}</h1>
<p>Or click the link below:</p>
<p><a href="{{ .ConfirmationURL }}">Sign in</a></p>
```

4. Save → go back to the app → request OTP again → the email now contains a numeric code

> **Note:** If the app UI says "Enter OTP" but Supabase only sends a magic link, update the login screen copy to say **"Check your email and click the sign-in link"** instead of asking for a 6-digit code. This matches the default Supabase behaviour.

---

## Troubleshooting

**"Enter OTP" screen but email has no code**  
→ Supabase is sending a magic link by default. Either click the link in the email, or update the email template as shown in Option B above.

**RLS blocking queries**  
→ Make sure you ran all policies in Step 6. Also confirm the Auth UID matches `public.users.id` and `public.mentees.id`.

**Login redirects to wrong URL**  
→ Check **Authentication → URL Configuration** and verify the redirect URL is exactly `http://127.0.0.1:5173/mentorship/dashboard`.

**`anon` key not working**  
→ Make sure you're using the **anon/public** key from Project Settings → API, not the service_role key.

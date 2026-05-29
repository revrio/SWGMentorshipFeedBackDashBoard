# SWG Mentorship Dashboard

Standalone React micro-frontend for the Students' Welfare Group, IIT Kharagpur mentorship workflow.

This project is built to be handed off and merged into a larger React codebase later. All application routes are isolated under `/mentorship`.

## Tech Stack

- React with Vite
- `react-router-dom`
- Tailwind CSS
- `lucide-react`
- Supabase Auth and Database via `@supabase/supabase-js`

## Routes

- `/mentorship`  
  Entry route. Logged-out users see the email login screen. Signed-in and authorized users are redirected to `/mentorship/dashboard`.

- `/mentorship/dashboard`  
  Protected mentee dashboard for feedback submission.

- `/mentorship/leaderboard`  
  Leaderboard view reading frozen score snapshots from Supabase.

## Authentication Behavior

- Existing users sign in with email OTP/magic link.
- The sign-in flow checks `public.users` first, so only `mentee` and `admin` roles can enter the portal.
- The login page also includes a visible Sign up mode for local testing.
- Test sign-up creates a Supabase Auth user and then attempts to create a matching `public.users` row with role `mentee`.
- A newly signed-up user still needs a linked `public.mentees` row before the feedback dashboard can show assigned mentor/cycle data.
- The Leaderboard item on the login sidebar links to `/mentorship/leaderboard`.

## Current UI Direction

The app uses a full-page internal dashboard layout, not a centered mockup frame.

- Desktop layout has a left SWG sidebar.
- Main content fills the remaining browser width.
- The signed-in navigation contains only Dashboard and Leaderboard.
- There is no Home item in the signed-in sidebar because `/mentorship` is the login/entry route.
- The SWG logo in the signed-in shell links to `/mentorship/dashboard`.
- The visual style uses soft grey backgrounds, white panels, teal-blue accents, compact cards, and table/chip styling inspired by the SWG dashboard reference.

## Folder Structure

```text
src/
  components/
  pages/
    Login.jsx
    Dashboard.jsx
    Leaderboard.jsx
  lib/
    supabase.js
    scoringUtils.js
  App.jsx
  main.jsx
  styles.css
```

## Supabase Schema

The app follows the finalized schema from `SWG_Mentorship_Schema.pdf` and uses these tables:

- `academic_sessions`
- `users`
- `mentors`
- `mentees`
- `feedback_cycles`
- `feedbacks`
- `leaderboard_snapshots`

Only users with role `mentee` or `admin` in the `users` table are allowed through OTP login. Mentors do not log in.

## Scoring Rule

The required leaderboard scoring rule is:

```text
Final Score = 0.65(F) + 0.35(E)
F = (Average 1-5 Rating / 5) * 100
E = (No. of Responses Received / Total Mentees Assigned) * 100
```

The frontend does not calculate leaderboard rankings. It reads stored values from `leaderboard_snapshots`:

- `review`
- `engagement_score`
- `final_score`

`src/lib/scoringUtils.js` includes the formula as a utility/reference for backend cron or admin calculation code, plus formatting helpers for the UI.

## Explicit Exclusions

The dashboard intentionally does not include:

- Resume sections
- Last Mentor Meetup sections
- Meetup score calculation
- Meetup UI

The previous 50:30:20 scoring model was not implemented.

## Dashboard Logic

When a mentee opens `/mentorship/dashboard`, the app:

1. Checks the authenticated user and role through Supabase Auth plus the `users` table.
2. Loads the mentee profile from `mentees`.
3. Finds an active feedback cycle from `feedback_cycles` where the current time is between `opens_at` and `closes_at`.
4. Checks `feedbacks` for an existing row with the same `mentee_id` and `cycle_id`.
5. Shows one of three states:
   - Rating form if a cycle is active and unsubmitted.
   - Thank-you state if feedback was already submitted.
   - No active cycle banner if no cycle window is open.

Feedback submission writes to `feedbacks` using:

- `mentee_id`
- `mentor_id`
- `cycle_id`
- `q1_rating`
- `q2_rating`

The schema-level `UNIQUE(mentee_id, cycle_id)` constraint prevents double submission.

## Leaderboard Logic

The leaderboard queries `leaderboard_snapshots` joined with `mentors`.

Views:

- Default View: latest closed feedback cycle for the current academic session.
- Overall Session View: rows where `cycle_id IS NULL`.

The UI displays:

- Mentor rank
- Mentor name
- Mentor roll number
- Raw rating average
- Engagement percentage
- Final score out of 100

## Environment Setup

Copy `.env.example` to `.env` and fill in Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-or-publishable-key
```

Use a Supabase publishable key or legacy anon public key. Never use the `service_role` or secret key in frontend `.env`.

## Remaining Real-World Setup

Add your Supabase values in `.env` from `.env.example`, and ensure your Supabase RLS policies allow the intended `users`, `mentees`, `feedback_cycles`, `feedbacks`, `academic_sessions`, `mentors`, and `leaderboard_snapshots` reads/writes.

## Install and Run

On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm`.

```bash
npm.cmd install
npm.cmd run dev
```

Production build:

```bash
npm.cmd run build
```

Preview the built app:

```bash
npm.cmd run preview
```

## Verification Status

Completed locally:

- Dependencies installed with `npm.cmd install`.
- Production build passed with `npm.cmd run build`.
- `/mentorship` redirects signed-in authorized users to `/mentorship/dashboard`.
- Built preview responded successfully for:
  - `/mentorship`
  - `/mentorship/leaderboard`

Note: `npm audit` reported 2 moderate findings from installed packages. No force fix was applied to avoid unintended dependency churn.

## Supabase Notes

Before deploying, configure Row Level Security policies so the frontend can safely:

- Read allowed `users` rows for login eligibility.
- Insert a `users` row for local test sign-up, if that testing path remains enabled.
- Read the authenticated mentee profile.
- Read active `feedback_cycles`.
- Read/write permitted `feedbacks`.
- Read current `academic_sessions`.
- Read `leaderboard_snapshots` and joined `mentors`.

Leaderboard calculation should be handled outside the frontend, such as a Supabase scheduled function, cron job, or admin utility that writes immutable rows into `leaderboard_snapshots`.

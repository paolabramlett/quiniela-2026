# Quiniela 2026 — Design Spec

**Date:** 2026-05-05
**Stack:** React 18 + Vite + TailwindCSS + Supabase + Netlify

---

## 1. Product Overview

A World Cup 2026 prediction platform where users predict match outcomes and advancement, accumulate points automatically, and compete in friend groups and a global leaderboard.

---

## 2. Architecture

**Frontend:** React 18 + Vite + TailwindCSS, deployed to Netlify (auto-deploy on push to main). All business logic lives in custom hooks. Components are pure UI.

**Backend:** Supabase-heavy approach:
- **Auth:** Google OAuth only via Supabase Auth
- **Database:** PostgreSQL with RLS on every table
- **Triggers:** DB trigger fires on `match_results` insert/update → calculates points for all affected predictions → refreshes denormalized leaderboard tables
- **Real-time:** Supabase subscriptions for live leaderboard updates

**Hook structure:**
- `useAuth` — Google OAuth session, user profile
- `usePredictions` — CRUD for group stage + knockout predictions, lockout logic, countdown timers
- `useGroups` — create/join groups, group leaderboard
- `useLeaderboard` — global leaderboard with real-time subscription
- `useAdmin` — enter/edit match results (whitelisted emails only)

---

## 3. Data Model

### Tables

**`users`** — extends `auth.users`
- `id` (uuid, FK auth.users)
- `display_name` (text)
- `avatar_url` (text)
- `created_at`

**`matches`**
- `id` (uuid)
- `phase` (enum: group_stage | r16 | qf | sf | final)
- `group_letter` (char, nullable — only for group_stage)
- `home_team` (text)
- `away_team` (text)
- `kickoff_at` (timestamptz)
- `status` (enum: scheduled | in_progress | finished)

**`group_stage_predictions`** — per-match result picks for group stage
- `id` (uuid)
- `user_id` (FK users)
- `match_id` (FK matches)
- `prediction` (enum: home | draw | away)
- `locked_at` (timestamptz, nullable)
- UNIQUE (user_id, match_id)

**`group_advancement_predictions`** — which 2 teams advance per group
- `id` (uuid)
- `user_id` (FK users)
- `group_letter` (char)
- `team_1` (text)
- `team_2` (text)
- `locked_at` (timestamptz, nullable)
- UNIQUE (user_id, group_letter)

**`knockout_predictions`** — winner picks for R16 through Final
- `id` (uuid)
- `user_id` (FK users)
- `match_id` (FK matches)
- `predicted_winner` (text — team name)
- `locked_at` (timestamptz, nullable)
- UNIQUE (user_id, match_id)

**`match_results`**
- `id` (uuid)
- `match_id` (FK matches, UNIQUE)
- `result` (enum: home | draw | away, nullable — group stage only)
- `winner_team` (text, nullable — knockout only)
- CHECK: exactly one of `result` or `winner_team` is non-null
- `entered_by` (FK users)
- `entered_at` (timestamptz)

**`groups`**
- `id` (uuid)
- `name` (text)
- `invite_code` (char(6), UNIQUE)
- `created_by` (FK users)
- `max_members` (int, nullable — null = unlimited)
- `created_at`

**`group_members`**
- `group_id` (FK groups)
- `user_id` (FK users)
- `joined_at`
- PRIMARY KEY (group_id, user_id)

**`leaderboard_global`** — denormalized, refreshed by trigger
- `user_id` (FK users)
- `display_name`, `avatar_url`
- `total_points` (int)
- `correct_predictions` (int)
- `rank` (int)
- `updated_at`

**`leaderboard_group`** — denormalized per group
- `group_id` (FK groups)
- `user_id` (FK users)
- `display_name`, `avatar_url`
- `total_points` (int)
- `correct_predictions` (int)
- `rank` (int)
- `updated_at`

### DB Triggers

**`on_result_entered`** — fires after INSERT or UPDATE on `match_results`:
1. Scores all predictions for that match
2. Updates `leaderboard_global` and `leaderboard_group` for affected users

---

## 4. Scoring

| Prediction type | Points |
|---|---|
| Group stage match result (W/D/W) correct | +5 |
| Group stage advancing team correct (per team) | +10 |
| Round of 16 winner correct | +15 |
| Quarter-final winner correct | +20 |
| Semi-final winner correct | +25 |
| Final winner correct | +50 |

---

## 5. Prediction Rules

### Group Stage
- **Per-match result:** Pick Home Win / Draw / Away Win for all 48 group stage matches
- **Advancement:** Pick 2 teams that advance from each of the 12 groups (order doesn't matter)
- **Lockout:** 30 minutes before each match's `kickoff_at`; advancement picks lock 30 minutes before the group's first match kicks off

### Knockout Rounds
- Pick the winning team for each match (regardless of ET/penalties)
- Matches are hidden/greyed until both teams are known
- Lockout: 30 minutes before `kickoff_at`

### Lockout UX
- Countdown timer appears on match cards when < 2 hours away
- Timer turns red at < 30 minutes
- Card becomes read-only (disabled, not removed) once locked

---

## 6. UI & Navigation

**Visual style:** Clean & Light
- Background: `#f0f4ff`
- Cards: white with subtle shadow
- Primary: `#1253ED`
- Urgency/lockout: `#ef233c`
- Font: system UI stack

**Navigation:** Dashboard-first
- Landing screen: score card (total points + global rank) + quick-action tiles (Make Picks, Rankings, My Group) + next lockout countdown
- Bottom tab bar on mobile: Dashboard | Picks | Rankings | Group | (Admin)
- Top nav on desktop: same sections as horizontal tabs

**Pages / Routes:**
- `/` — Dashboard (score, rank, next lockout)
- `/predictions` — Group stage (tabbed by group A–L) + knockout bracket
- `/leaderboard` — Global top 100, user's row always visible
- `/groups` — Create group / join by code / group leaderboard
- `/admin` — Enter/edit match results (whitelisted only)

---

## 7. Groups

- Any authenticated user can create a group
- Creator sets name and optional member limit (default: unlimited)
- 6-character alphanumeric invite code auto-generated on creation
- Creator can view invite code at any time to reshare
- Any user with the code can join (enforced up to limit)
- Users can belong to multiple groups
- Group leaderboard shows all members ranked by total points

---

## 8. Admin Panel

**Access:** Email whitelist stored in Supabase (checked via RLS policy on admin actions).

**Capabilities:**
- View all matches grouped by phase, with result status
- Enter or edit match result (group stage: home/draw/away; knockout: winning team)
- Saving triggers automatic point calculation and leaderboard refresh

**Restrictions:**
- Cannot delete users or predictions
- Cannot modify scores directly — all scoring flows through the DB trigger

---

## 9. Out of Scope (v1)

- Push notifications
- Sportmonks API integration
- PWA / service worker
- Email/password auth
- Third-place match predictions
- Social features (comments, reactions)

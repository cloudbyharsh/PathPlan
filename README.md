# CS OKR Visibility Tracker

A full-stack web application for Customer Success teams to track Objectives and Key Results (OKRs) in real time — built as a portfolio project demonstrating end-to-end product thinking, system design, and engineering execution.

**Live Demo:** [Deploy to Vercel](#deployment) · **Tech:** Next.js 14 · TypeScript · Tailwind CSS · Supabase

---

## The Problem

Customer Success teams set OKRs at quarter start and review them at quarter end. Everything in between is a black box. Managers can't spot at-risk goals early enough to intervene. ICs lack a shared surface to communicate blockers and progress.

## The Solution

A lightweight, role-aware OKR tracker that gives CS teams **continuous visibility** into quarterly objectives and key results — with timestamped progress updates, automatic status calculation, and a manager team-view to catch risks before they become misses.

---

## Features

### Employee View
- Create quarterly objectives with up to 5 measurable key results
- Submit progress updates with notes — timestamped and auditable
- Auto-calculated status: **On Track / At Risk / Off Track** based on progress relative to time elapsed in the quarter
- Personal dashboard with stat summary and collapsible OKR cards

### Manager View
- Team overview grouped by employee
- Aggregate stats across the full team
- Read-only access to all team OKRs (enforced at database layer via RLS)

### Auth & Access
- Role-based access control: `employee`, `manager`, `admin`
- Demo mode works out of the box — no Supabase setup required
- Production-ready Supabase auth integration included

---

## Demo

| Account | Email | Password | Role |
|---|---|---|---|
| Sarah Chen | sarah@demo.com | demo123 | Employee |
| Mike Rodriguez | mike@demo.com | demo123 | Manager |
| Alex Johnson | alex@demo.com | demo123 | Employee |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3.4 |
| State | React Context + localStorage (demo) |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth |
| Deployment | Vercel |

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/cloudbyharsh/cs-okr-tracker.git
cd cs-okr-tracker
npm install
```

### 2. Run in demo mode (no setup needed)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with any demo account above.

The app runs entirely with in-memory mock data — no database or API keys required.

### 3. Connect Supabase (production mode)

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_DEMO_MODE=false
```

Run the database migration in your Supabase SQL editor:

```
supabase/migrations/001_initial_schema.sql
```

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/              # Authentication page
│   ├── dashboard/          # Employee OKR dashboard
│   ├── objectives/new/     # Create objective form
│   └── manager/            # Manager team overview
├── components/
│   ├── ui/                 # Button, Badge, ProgressBar, Modal
│   ├── layout/             # Sidebar navigation
│   └── okr/                # OKRCard, KeyResultRow, ProgressUpdateModal
├── contexts/
│   └── AppContext.tsx       # Global state management
├── lib/
│   ├── utils.ts            # Status calculation, formatting
│   └── mockData.ts         # Demo data
└── types/
    └── index.ts            # TypeScript interfaces
supabase/
└── migrations/
    └── 001_initial_schema.sql  # PostgreSQL schema + RLS policies
docs/
└── SYSTEM_DESIGN.md        # Full system design document
```

---

## System Design

See [`docs/SYSTEM_DESIGN.md`](./docs/SYSTEM_DESIGN.md) for:

- Architecture diagram (Browser → Vercel → Supabase)
- Database schema with ERD
- Row Level Security policy design
- API design with request/response examples
- Auth & authorization flow
- Status calculation logic
- Scalability considerations
- Implementation phases

---

## Status Calculation

The app auto-derives OKR status by comparing actual progress against time-adjusted expected progress:

```
progress_pct  = (current - start) / (target - start) × 100
expected_pct  = days_elapsed / quarter_days × 100

ON TRACK  → progress_pct ≥ expected_pct - 10
AT RISK   → progress_pct ≥ expected_pct - 25
OFF TRACK → progress_pct <  expected_pct - 25
```

This means an objective that's 60% complete in week 4 of a 13-week quarter is flagged **at risk** — enabling early intervention before it becomes a miss.

---

## Deployment

### Vercel (recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push this repo to GitHub
2. Import into Vercel
3. Add environment variables from `.env.example`
4. Deploy

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | For production | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For production | Your Supabase anon key |
| `NEXT_PUBLIC_DEMO_MODE` | Optional | Set to `true` for mock data mode |

---

## Product Thinking

This project was designed with the following PM principles:

**1. Start with the pain, not the feature.** The core insight was that OKR tools fail not because teams don't set goals, but because progress is invisible between check-ins. The solution focuses on the _update_ workflow, not goal-setting.

**2. Reduce friction to zero for the core action.** Submitting a progress update takes 3 clicks: hover → Update → enter value → save. No forms, no navigation, no context-switching.

**3. Role-based views prevent information overload.** Employees see only their OKRs. Managers see the team in one view. Different jobs require different information densities.

**4. Status is calculated, not self-reported.** Removing subjective status from the employee reduces bias and gaming. The system derives status from actual numbers.

**5. Data isolation by design.** Row Level Security at the PostgreSQL layer means a mis-coded UI can never leak another user's data — security is enforced at the data layer, not just the application layer.

---

## Roadmap

**Phase 2 (Post-MVP)**
- [ ] Slack integration for weekly OKR digest
- [ ] Email notifications when objectives go at-risk
- [ ] Quarter-over-quarter progress comparison

**Phase 3 (Scale)**
- [ ] Salesforce / JIRA sync for automated KR updates
- [ ] AI-assisted OKR writing and grading suggestions
- [ ] Cross-team objective alignment mapping

---

## License

MIT

---

*Built by [Harsh Shah](https://github.com/cloudbyharsh) — Product Manager & CS OKR enthusiast*

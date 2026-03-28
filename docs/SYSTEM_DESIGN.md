# CS OKR Visibility Tracker — System Design

---

## 1. Problem Statement

Customer Success teams struggle to maintain real-time visibility into OKR progress. Objectives are set at quarter start, reviewed at quarter end, and everything in between is a black box. Managers can't spot at-risk goals early. Employees lack a shared surface to communicate blockers.

**Goal:** Build a lightweight, role-aware OKR tracker that gives CS teams continuous visibility into quarterly objectives and key results.

---

## 2. Requirements

### Functional Requirements

| # | Requirement |
|---|---|
| FR-1 | Employees can create quarterly objectives with up to 5 key results each |
| FR-2 | Employees submit progress updates on key results with a numeric value and optional note |
| FR-3 | System auto-calculates status: On Track / At Risk / Off Track based on progress % |
| FR-4 | Employees see a personal dashboard with all their active OKRs and status |
| FR-5 | Managers see a team dashboard grouped by employee with summary statistics |
| FR-6 | Auth is role-based: employee, manager, admin |
| FR-7 | All data is scoped to the authenticated user (no cross-user data leaks) |
| FR-8 | Progress history is timestamped and viewable per key result |

### Non-Functional Requirements

| # | Requirement | Target |
|---|---|---|
| NFR-1 | Page load time | < 2s on 4G |
| NFR-2 | API response time | < 500ms p95 |
| NFR-3 | Availability | 99.5% uptime |
| NFR-4 | Security | Row-level data isolation, HTTPS only |
| NFR-5 | Scalability | Support up to 500 users per organization |
| NFR-6 | Accessibility | WCAG 2.1 AA |

### Out of Scope (v1)

- Slack/JIRA/Salesforce integrations
- OKR templates or AI-assisted goal setting
- Cross-team or org-wide OKR hierarchies
- Mobile native app
- Notifications / email digests

---

## 3. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                        │
│              Next.js 14 App (React Server Components)        │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      VERCEL EDGE NETWORK                     │
│   • Static asset CDN                                         │
│   • Edge Middleware (auth token validation, route guards)    │
│   • Serverless Functions (Next.js API Routes)                │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────┐    ┌─────────────────────────────┐
│     SUPABASE AUTH        │    │      SUPABASE DATABASE       │
│  • Email/password auth   │    │   • PostgreSQL               │
│  • JWT token issuance    │    │   • Row Level Security (RLS) │
│  • Session management    │    │   • Real-time subscriptions  │
│  • Role claims in JWT    │    │   • Typed JS client          │
└──────────────────────────┘    └─────────────────────────────┘
```

### Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 14 App Router | Server Components reduce client JS; built-in API routes |
| Database | Supabase (PostgreSQL) | Managed Postgres + Auth + RLS in one platform |
| Auth | Supabase Auth | Native JWT with role claims; no extra auth service |
| Data access | Supabase JS client (no ORM) | RLS enforces security at DB layer; typed queries |
| Deployment | Vercel | Zero-config Next.js deployments; edge middleware support |
| Styling | Tailwind CSS | Utility-first; no runtime CSS overhead |

---

## 4. Database Design

### Entity-Relationship Diagram

```
users
  ├── id (uuid, PK)
  ├── email
  ├── full_name
  ├── role  ─── [employee | manager | admin]
  ├── team_id (FK → teams)
  └── created_at

teams
  ├── id (uuid, PK)
  ├── name
  ├── manager_id (FK → users)
  └── created_at

objectives
  ├── id (uuid, PK)
  ├── owner_id (FK → users)        ← employee who owns it
  ├── team_id (FK → teams)
  ├── title
  ├── description
  ├── quarter  ─── [Q1 | Q2 | Q3 | Q4]
  ├── year
  ├── status  ─── [on_track | at_risk | off_track | completed]
  ├── created_at
  └── updated_at

key_results
  ├── id (uuid, PK)
  ├── objective_id (FK → objectives, CASCADE DELETE)
  ├── title
  ├── start_value    (numeric)
  ├── target_value   (numeric)
  ├── current_value  (numeric)
  ├── unit           (e.g. %, $, count)
  ├── created_at
  └── updated_at

progress_updates
  ├── id (uuid, PK)
  ├── key_result_id (FK → key_results, CASCADE DELETE)
  ├── submitted_by (FK → users)
  ├── value          (numeric — the new current_value)
  ├── note           (text, optional)
  └── created_at
```

### Row Level Security Policies

```sql
-- Employees see only their own objectives
CREATE POLICY "employee_own_objectives"
  ON objectives FOR SELECT
  USING (owner_id = auth.uid());

-- Managers see all objectives in their team
CREATE POLICY "manager_team_objectives"
  ON objectives FOR SELECT
  USING (
    team_id IN (
      SELECT id FROM teams WHERE manager_id = auth.uid()
    )
  );

-- Only objective owner can insert/update/delete
CREATE POLICY "owner_write_objectives"
  ON objectives FOR ALL
  USING (owner_id = auth.uid());

-- Similar patterns apply to key_results and progress_updates
```

### Status Calculation Logic

```
progress_pct = (current_value - start_value) / (target_value - start_value) * 100

-- Thresholds are time-adjusted within the quarter:
expected_pct = (days_elapsed / quarter_days) * 100

ON TRACK   → progress_pct >= expected_pct - 10
AT RISK    → progress_pct >= expected_pct - 25
OFF TRACK  → progress_pct <  expected_pct - 25
```

---

## 5. API Design

All API routes live under `/api/` in Next.js. Auth is validated via Supabase JWT on every request.

### Endpoints

#### Authentication
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Email + password → JWT |
| POST | `/api/auth/logout` | Invalidate session |
| GET  | `/api/auth/me` | Return current user + role |

#### Objectives
| Method | Path | Description |
|---|---|---|
| GET    | `/api/objectives` | List authenticated user's objectives |
| POST   | `/api/objectives` | Create new objective |
| GET    | `/api/objectives/:id` | Get single objective with key results |
| PATCH  | `/api/objectives/:id` | Update objective title/description/status |
| DELETE | `/api/objectives/:id` | Delete objective (cascades to KRs) |

#### Key Results
| Method | Path | Description |
|---|---|---|
| POST   | `/api/objectives/:id/key-results` | Add key result to objective |
| PATCH  | `/api/key-results/:id` | Update key result metadata |
| DELETE | `/api/key-results/:id` | Delete key result |

#### Progress Updates
| Method | Path | Description |
|---|---|---|
| GET    | `/api/key-results/:id/progress` | Get update history |
| POST   | `/api/key-results/:id/progress` | Submit new progress value |

#### Manager
| Method | Path | Description |
|---|---|---|
| GET    | `/api/manager/team` | All team objectives grouped by employee |
| GET    | `/api/manager/summary` | Aggregate stats: counts by status |

### Request / Response Example

**POST /api/objectives**
```json
// Request
{
  "title": "Reduce churn by improving onboarding",
  "description": "Focus on 30-day activation milestones",
  "quarter": "Q2",
  "year": 2026
}

// Response 201
{
  "id": "uuid",
  "title": "Reduce churn by improving onboarding",
  "status": "on_track",
  "quarter": "Q2",
  "year": 2026,
  "key_results": [],
  "created_at": "2026-03-28T10:00:00Z"
}
```

**POST /api/key-results/:id/progress**
```json
// Request
{
  "value": 72,
  "note": "Completed 3 new onboarding sessions this week"
}

// Response 201
{
  "id": "uuid",
  "key_result_id": "uuid",
  "value": 72,
  "note": "Completed 3 new onboarding sessions this week",
  "created_at": "2026-03-28T10:30:00Z"
}
```

### Error Format
```json
{
  "error": "VALIDATION_ERROR",
  "message": "title must be between 5 and 200 characters",
  "field": "title"
}
```

---

## 6. Frontend Architecture

### Route Map

```
/                    → redirect to /dashboard (or /login if unauthenticated)
/login               → login page
/dashboard           → employee OKR dashboard          [role: employee, manager]
/objectives/new      → create objective form            [role: employee]
/objectives/:id      → objective detail + KR management [role: employee, manager]
/manager             → team overview dashboard          [role: manager, admin]
```

### Component Hierarchy

```
RootLayout
├── AuthProvider (Supabase session context)
├── /login
│   └── LoginForm
├── /dashboard
│   ├── DashboardHeader (quarter selector, add button)
│   ├── OKRCard[]
│   │   ├── StatusBadge
│   │   ├── KeyResultRow[]
│   │   │   ├── ProgressBar
│   │   │   └── UpdateButton → ProgressModal
│   │   └── ObjectiveActions (edit, delete)
│   └── EmptyState (no objectives yet)
├── /objectives/new
│   └── ObjectiveForm
│       └── KeyResultFieldArray (up to 5)
└── /manager
    ├── TeamSummaryStats
    └── EmployeeGroup[]
        └── OKRCard[] (read-only)
```

### Data Flow

```
Server Component (page.tsx)
  │
  ├── createServerClient(supabase)   ← uses cookie-based session
  ├── fetch objectives from Supabase  ← RLS filters automatically
  │
  └── passes data as props to Client Components
        │
        └── Client Components handle:
              • progress update submissions (API route calls)
              • optimistic UI updates
              • form validation
```

---

## 7. Authentication & Authorization Flow

```
User visits /dashboard
       │
       ▼
Edge Middleware checks for Supabase session cookie
       │
   No session ──────────────────────► redirect to /login
       │
   Has session
       │
       ▼
Validate JWT with Supabase Auth
       │
   Invalid ─────────────────────────► redirect to /login
       │
   Valid
       │
       ▼
Extract role from JWT claims
       │
   role=employee ──► serve /dashboard
   role=manager  ──► serve /dashboard + /manager
   role=admin    ──► serve all routes
```

### Role Permission Matrix

| Action | employee | manager | admin |
|---|---|---|---|
| View own objectives | ✓ | ✓ | ✓ |
| Create/edit own objectives | ✓ | ✓ | ✓ |
| Delete own objectives | ✓ | ✓ | ✓ |
| View team objectives | ✗ | ✓ | ✓ |
| View all team progress | ✗ | ✓ | ✓ |
| Manage users | ✗ | ✗ | ✓ |

---

## 8. Key Workflows

### Workflow 1: Employee Creates an Objective

```
1. Employee clicks "New Objective"
2. Fills form: title, description, quarter, year
3. Adds 1–5 key results inline (title, start, target, unit)
4. Submits → POST /api/objectives
5. API validates input, inserts into Supabase (RLS: owner_id = auth.uid())
6. Redirects to /dashboard — new OKR card appears
7. Status auto-set to "on_track" (no progress yet = 0% expected at start)
```

### Workflow 2: Employee Submits Progress Update

```
1. Employee clicks "Update" on a key result
2. Modal opens showing current value + history
3. Employee enters new value + optional note
4. Submits → POST /api/key-results/:id/progress
5. API:
   a. Inserts progress_update row
   b. Updates key_results.current_value
   c. Recalculates objective status
   d. Updates objectives.status
6. Dashboard refreshes — progress bar and status badge update
```

### Workflow 3: Manager Reviews Team

```
1. Manager navigates to /manager
2. Page fetches GET /api/manager/team
3. Supabase RLS returns only objectives where team_id matches manager's team
4. Results grouped by employee name
5. Manager sees aggregate stats (On Track: 8, At Risk: 3, Off Track: 1)
6. Manager can drill into any objective (read-only)
```

---

## 9. Scalability Considerations

| Concern | Current approach | If scale increases |
|---|---|---|
| DB connections | Supabase connection pooler (PgBouncer built-in) | Upgrade Supabase plan; add read replicas |
| API throughput | Vercel Serverless (auto-scales) | Vercel Enterprise or dedicated compute |
| Real-time updates | Polling on page reload | Supabase Realtime subscriptions |
| Query performance | Index on `owner_id`, `team_id`, `quarter+year` | Add covering indexes on hot paths |
| File uploads | Not in scope v1 | Supabase Storage |

### Recommended Database Indexes

```sql
CREATE INDEX idx_objectives_owner    ON objectives(owner_id);
CREATE INDEX idx_objectives_team     ON objectives(team_id);
CREATE INDEX idx_objectives_quarter  ON objectives(year, quarter);
CREATE INDEX idx_key_results_obj     ON key_results(objective_id);
CREATE INDEX idx_progress_kr         ON progress_updates(key_result_id);
CREATE INDEX idx_progress_created    ON progress_updates(created_at DESC);
```

---

## 10. Security Checklist

- [x] All routes protected by JWT auth (Edge Middleware)
- [x] RLS policies on every Supabase table
- [x] No user can read/write another user's data (enforced at DB layer)
- [x] Input validation on all API routes (title length, value ranges, required fields)
- [x] HTTPS enforced (Vercel default)
- [x] Environment variables never exposed to client (`.env.local` + server-only Supabase client)
- [x] SQL injection impossible (parameterized queries via Supabase JS client)
- [ ] Rate limiting on auth endpoints (add in v1.1)
- [ ] CSRF protection (add in v1.1 if using cookie auth)
- [ ] Audit log for sensitive actions (v2)

---

## 11. Tech Stack Summary

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.4 |
| Database | PostgreSQL via Supabase | Latest managed |
| Auth | Supabase Auth | Latest |
| DB Client | @supabase/supabase-js | 2.x |
| Deployment | Vercel | - |
| Node runtime | Node.js | 20 LTS |

---

## 12. Implementation Phases

### Phase 1 — Foundation (Week 1–2)
- [ ] Supabase project setup + schema migration
- [ ] Authentication: login page, middleware, session handling
- [ ] Environment variable configuration
- [ ] Basic route structure

### Phase 2 — Core Features (Week 3–4)
- [ ] Objectives CRUD API routes + forms
- [ ] Key results CRUD
- [ ] Progress update submission
- [ ] Employee dashboard with real data

### Phase 3 — Manager + Polish (Week 5–6)
- [ ] Manager dashboard with team data
- [ ] Status recalculation logic
- [ ] Error handling, loading states, empty states
- [ ] Responsive design, accessibility

### Phase 4 — Launch Readiness (Week 7)
- [ ] Seed script for demo data
- [ ] End-to-end tests for critical flows
- [ ] Performance audit
- [ ] Production deployment + smoke tests

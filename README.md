# PathPlan

**Match your CV to any job description. Identify skill gaps. Get a personalised learning plan.**

PathPlan is a free, privacy-first tool that analyses your CV against a job description, gives you a match score, and generates a step-by-step learning plan to close the gaps — so you apply with confidence, not hope.

**Live demo:** [Deploy to Vercel in 1 click](#deployment)

---

## What it does

1. **Paste your CV** — plain text, no uploads
2. **Paste the job description** — from any job posting
3. **Get a match score + gap analysis** — see exactly which skills you have, which you're missing, and which are required vs. preferred
4. **View your learning plan** — curated courses, books, and certifications prioritised by what the employer actually needs, with a 3-phase timeline

---

## Screenshots

| Landing | Analyse | Results | Learning Plan |
|---|---|---|---|
| Value prop + CTA | 2-step CV + JD input | Score ring + skill breakdown | Phased plan + resources |

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 6 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 + shadcn/ui |
| Routing | React Router 7 |
| State | sessionStorage (no backend needed) |
| Deployment | Vercel / Netlify / any static host |

---

## Getting started

```bash
git clone https://github.com/cloudbyharsh/pathplan.git
cd pathplan
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

No environment variables needed — the app runs entirely in the browser.

---

## How the analysis works

PathPlan uses a client-side skill taxonomy of 100+ skills across 7 categories:

- **Technical** (Python, SQL, React, AWS, …)
- **Data & Analytics** (Tableau, A/B testing, Google Analytics, …)
- **Product & Strategy** (product management, roadmapping, GTM, …)
- **Leadership & Management** (stakeholder management, hiring, …)
- **Communication** (presentation, technical writing, …)
- **Domain Knowledge** (SaaS, customer success, UX, AI, …)
- **Tools & Platforms** (Jira, Figma, Salesforce, …)

**Match score formula:**

```
required skills matched × 2  +  preferred skills matched
───────────────────────────────────────────────────────── × 100
required skills in JD × 2  +  preferred skills in JD
```

Required skills are weighted 2× because employers screen harder on them.

**Status thresholds:**
- ≥ 70% → Strong match
- 45–69% → Partial match
- < 45% → Needs work

---

## Project structure

```
src/
├── main.tsx                    # Entry point
├── styles/index.css            # Tailwind + CSS variables
├── types/index.ts              # TypeScript interfaces
├── lib/
│   ├── utils.ts                # cn() helper
│   ├── analyzer.ts             # CV/JD parsing + match scoring
│   └── learningData.ts         # Learning modules + resource library
└── app/
    ├── App.tsx                 # Root component
    ├── routes.tsx              # React Router config
    ├── components/ui/          # shadcn/ui components
    └── pages/
        ├── Landing.tsx         # Home page
        ├── Analyze.tsx         # CV + JD input (2-step)
        ├── Results.tsx         # Match score + gap analysis
        └── Plan.tsx            # Personalised learning plan
```

---

## Deployment

### Vercel (recommended)

```bash
npm run build
# drag dist/ to vercel.com/new or:
npx vercel --prod
```

### Netlify

```bash
npm run build
# publish dist/
```

No server required — pure static output.

---

## Roadmap

- [ ] PDF export of the learning plan
- [ ] Save / share plan via unique URL
- [ ] Claude AI integration for smarter skill extraction
- [ ] Job board integration (LinkedIn, Greenhouse, Lever)
- [ ] Progress tracking dashboard

---

## Product thinking

This project was built with the following PM principles:

**1. Remove all friction from the core action.** The user's job is to paste text and get an answer — not create an account, upload a file, or wait for a server. The entire analysis runs in the browser, instantly.

**2. Separate required from preferred.** Most gap tools treat all missing skills equally. PathPlan weights required skills 2× in the score and surfaces them separately — matching how real hiring managers think.

**3. A score without a plan is useless.** The match score is the hook, but the learning plan is the value. Every gap links directly to a curated, prioritised resource — not a generic Google search.

**4. Privacy-first by design.** CV data is sensitive. By running entirely client-side with no backend, PathPlan never stores or transmits your CV. This isn't a features note — it's an architecture decision.

---

*Built by [Harsh Shah](https://github.com/cloudbyharsh)*

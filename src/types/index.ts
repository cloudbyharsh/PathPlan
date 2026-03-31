export interface SkillMatch {
  skill: string;
  inCV: boolean;
  inJD: boolean;
  priority: "required" | "preferred" | "bonus";
}

export interface AnalysisResult {
  matchScore: number;
  strongMatches: string[];
  skillGaps: SkillGap[];
  extraSkills: string[];
  cvSummary: CVSummary;
  jdSummary: JDSummary;
}

export interface SkillGap {
  skill: string;
  priority: "required" | "preferred";
  category: SkillCategory;
}

export interface CVSummary {
  detectedSkills: string[];
  yearsOfExperience: number | null;
  educationLevel: string | null;
}

export interface JDSummary {
  role: string;
  company: string | null;
  requiredSkills: string[];
  preferredSkills: string[];
  seniority: "junior" | "mid" | "senior" | "lead" | "unknown";
}

export type SkillCategory =
  | "Technical"
  | "Data & Analytics"
  | "Product & Strategy"
  | "Leadership & Management"
  | "Communication"
  | "Domain Knowledge"
  | "Tools & Platforms";

export interface LearningResource {
  title: string;
  provider: string;
  url: string;
  duration: string;
  type: "course" | "book" | "practice" | "certification" | "project";
  free: boolean;
}

export interface LearningModule {
  skill: string;
  category: SkillCategory;
  priority: "required" | "preferred";
  weekEstimate: number;
  resources: LearningResource[];
  why: string;
}

export interface LearningPlan {
  totalWeeks: number;
  modules: LearningModule[];
  phases: LearningPhase[];
}

export interface LearningPhase {
  name: string;
  weeks: string;
  focus: string[];
  goal: string;
}

// ── Plan configuration ────────────────────────────────────

export interface PlanConfig {
  totalDays: 14 | 21 | 30;
  hoursPerDay: number;
  startDate: string;
  planId: string;
}

// ── Day-level task produced by the scheduler ─────────────

export interface DayTask {
  day: number;
  skillName: string;
  skillCategory: SkillCategory;
  priority: "required" | "preferred";
  why: string;
  resource: LearningResource;
  microTask: string;
}

// ── Check-in entry persisted in localStorage ─────────────

export interface CheckInEntry {
  day: number;
  planId: string;
  completedAt: string;
  reflection: string;
}
